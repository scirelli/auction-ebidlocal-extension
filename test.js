//TODO: Make the table a custom component that handles coordinating updates of the rows.
if(!String.prototype.mustache) {
    String.prototype.mustache = function(o) {
        return this.replace(/{{([^{}]*)}}/g, function(a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r:a;
        });
    };
}

if(!Function.prototype.delay) {
    Function.prototype.delay = function delay(time) {
        let args = Array.prototype.slice.call(arguments, 1);

        time = parseInt(time) || 0;

        return new Promise((resolve)=> {
            setTimeout((...args)=> {
                resolve(this.apply(this, args));
            }, time, ...args);
        });
    };
}

if(!Function.prototype.chain) {
    Function.prototype.chain = function chain(iter) {
        let itm = iter.next();
        if(!itm.done) {
            return Promise.resolve(this(itm.value)).then(()=> {
                return chain.call(this, iter);
            });
        }
        return Promise.resolve();
    };
}

if(!Array.prototype.chain) {
    Array.prototype.chain = function chain(fnc, i=0) {
        let itm = this[i];
        if(itm) {
            return Promise.resolve(fnc(itm)).then(()=> {
                return chain.call(this, fnc, i+1);
            });
        }
        return Promise.resolve();
    };
}

var classes = (()=> {
    class AuctionWatchList extends HTMLElement{
        static TAG_NAME = 'auction-watch-list';
        static DEFAULT_REFRESH_RATE_MS = 10 * 1000;

        static get observedAttributes() { return ['data-refresh-rate']; }

        refreshIntervalId = 0;
        refreshRate = AuctionItemRow.DEFAULT_REFRESH_RATE_MS;

        constructor() {
            super();
            let template = document.getElementById('auction-watch-list-template'),
                templateContent = template.content;

            this.appendChild(templateContent.cloneNode(true));
            this.addEventListener('add-item', this._onAddItem.bind(this));
        }

        attributeChangedCallback(name, oldValue, newValue) {
            switch(name) {
                case 'data-refresh-rate':
                    this.refreshRate =  (parseInt(newValue) || 0) * 1000 || AuctionWatchList.DEFAULT_REFRESH_RATE_MS;
                    this._stopRefresh();
                    this._startRefresh();
                    break;
            }
        }

        _startRefresh() {
            this.refreshIntervalId = setTimeout(()=> {
                this._refresh().then(this._startRefresh.bind(this));
            }, this.refreshRate);
        }
        _stopRefresh() {
            clearTimeout(this.refreshIntervalId);
            this.refreshIntervalId = 0;
        }

        _refresh() {
            let self = this,
                rows = Array.prototype.slice.call(this.querySelectorAll('table > tbody > tr') || [], 0);

            this.dispatchEvent(new CustomEvent('update-start'));
            return rows.chain(tr=>((tr)=>{
                if(tr) tr.dispatchEvent(new CustomEvent('refresh'));
            }).delay(500, tr)).then(done).catch(done);

            function done(m) {
                if(m) console.error(m);
                self.dispatchEvent(new CustomEvent('update-end'));
            }
        }

        _addItem(url) {
            try {
                url = new URL(url);

                let oData = {data: AuctionItemRow.getAuctionIdFromURL(url), sourceURL: url},
                    id = oData.data.fullId;

                if(!this.querySelector(`table > tbody > tr[id="${id}"]`)) {
                    this.querySelector('table > tbody').appendChild(this._createRow(oData));
                }
            }catch(e) {
                console.error(e);
            }
        }

        _createRow(oData) {
            let newRow = document.createElement('tr', {is: AuctionItemRow.TAG_NAME});
            newRow.setAttribute('src', oData.sourceURL);
            newRow.classList.add('DataRow');
            newRow.setAttribute('valign', 'top');
            newRow.setAttribute('id', oData.data.fullId);

            newRow.addEventListener('change', ()=> {
                newRow.classList.add('changed');
                newRow.addEventListener('mouseenter', function onHover() {
                    newRow.classList.remove('changed');
                    newRow.removeEventListener('hover', onHover);
                });
            });
            newRow.addEventListener('update-start', ()=> {
                newRow.classList.add('updating');
            });
            newRow.addEventListener('update-end', ()=> {
                newRow.classList.remove('updating');
            });
            newRow.addEventListener('change', (e)=> {
                this.dispatchEvent(new CustomEvent('watchlist-change', {detail:
                    {
                        row:          newRow,
                        orignalEvent: e
                    }
                }));
            });
            newRow.addEventListener('data-change', (e)=> {
                this.dispatchEvent(new CustomEvent('watchlist-data-change', {detail:
                    {
                        row:  newRow,
                        data: e.detail.data
                    }
                }));
            });

            return newRow;
        }

        _onAddItem(evt) {
            this._addItem(evt.detail.src);
        }

        static __register() {
            customElements.define(AuctionWatchList.TAG_NAME, AuctionWatchList);
            document.body.insertAdjacentHTML('beforeend', AuctionWatchList.template);
            document.body.insertAdjacentHTML('beforeend', AuctionWatchList.style);
        }

        static template = `
            <template id="auction-watch-list-template">
                <table class="listbody" cellpadding="3" cellspacing="1">
                    <thead>
                        <tr bgcolor="#073c68" valign="bottom">
                            <th align="center" width="40"><font color="#ffffff"><strong>Item</strong></font></th>
                            <th id="DataTablePhoto" align="center"><font color="#ffffff"><strong>Photo</strong></font></th>
                            <th id="DataTableDesc" align="center"><font color="#ffffff"><strong>Description</strong></font></th>
                            <th align="center"><font color="#ffffff"><strong>Bids</strong></font></th>
                            <th align="center"><font color="#ffffff"><strong>High <br> Bidder</strong></font></th>
                            <th align="center"><font color="#ffffff"><strong>Current <br> Amount</strong></font></th>
                            <th align="center"><font color="#ffffff"><strong>Next Bid <br> Required</strong></font></th>
                            <th align="center"><font color="#ffffff"><strong>Your <br> Bid</strong></font></th>
                            <th align="center"><font color="#ffffff"><strong>Your <br> Maximum</strong></font></th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </template>
        `
        static style = `
            <style>
                td.photo a {
                    display:inline-block;
                    height: 50px;
                }
                img {
                    height: 100%;
                }
                a:hover img {
                    display:none;
                }
                a:hover img.icon-large {
                    display:inline;
                    height: 400px;
                    visibility: visible;
                    transition: height 0.2s ease-out;
                }
                img.icon-large {
                    position: absolute;
                    visibility: hidden;
                    height: 50px;
                }

                tbody tr.updating {
                    background-color: #DDFFDD;
                    transition: background-color 0.2s ease-out;
                }
                tbody tr.changed {
                    background-color: #FFDDFF;
                    transition: background-color 0.2s ease-out;
                }
                tbody tr{
                    transition: background-color 0.2s ease-out;
                }
            </style>
        `
    }

    class AuctionItemRow extends HTMLTableRowElement{
        static TAG_NAME = 'auction-item-row';
        static DEFAULT_REFRESH_RATE_MS = 10 * 1000;
        static DATA_TABLE_ID = 'DataTable';
        static CHANGE_WATCH_PROPS = [
            'itemNumOfBids',
            'itemHighBidder',
            'itemCurrentAmount',
            'itemNextBidRequired'
        ];

        static get observedAttributes() { return ['src', 'data-refresh-rate', 'data-auto-refresh']; }

        refreshIntervalId = 0;
        refreshRate = AuctionItemRow.DEFAULT_REFRESH_RATE_MS;
        oldDatat;

        constructor() {
            super();
            let template = document.getElementById('auction-item-row-template'),
                templateContent = template.content;

            this.appendChild(templateContent.cloneNode(true));
            this.addEventListener('refresh', this._onRefresh.bind(this));
        }

        attributeChangedCallback(name, oldValue, newValue) {
            switch(name) {
                case 'src':
                    this.dispatchEvent(new CustomEvent('update-start', {}));
                    AuctionItemRow.requestItemInfo(new URL(newValue))
                        .then((data)=> {
                            this._setLinksAndImages(data);
                            this._update(data);
                            if(this.getAttribute('data-auto-refresh') !== null) {
                                this._stopRefresh();
                                this._startRefresh();
                            }
                        })
                        .then(()=> {
                            this.dispatchEvent(new CustomEvent('update-end', {}));
                        })
                        .catch(e=> {
                            console.error(e);
                            this.dispatchEvent(new CustomEvent('update-end', {}));
                            this.remove();
                        });
                    break;
                case 'data-refresh-rate':
                    this.refreshRate =  (parseInt(newValue) || 0) * 1000 || AuctionItemRow.DEFAULT_REFRESH_RATE_MS;
                    this._stopRefresh();
                    this._startRefresh();
                    break;

                case 'data-auto-refresh':
                    if(newValue !== null) {
                        this._stopRefresh();
                        this._startRefresh();
                    }else {
                        this._stopRefresh();
                    }
                    break;
            }
        }

        _startRefresh() {
            this.refreshIntervalId = setTimeout(()=> {
                this._refresh().then(this._startRefresh.bind(this));
            }, this.refreshRate);
        }
        _stopRefresh() {
            clearTimeout(this.refreshIntervalId);
            this.refreshIntervalId = 0;
        }

        _refresh() {
            let self = this,
                src = this.getAttribute('src');

            if(!src) return Promise.resolve();

            this.dispatchEvent(new CustomEvent('update-start', {}));
            return AuctionItemRow.requestItemInfo(new URL(src))
                .catch(e=> {
                    console.error(new Error('Unable to parse data'));
                    throw e;
                })
                .then((data)=>{
                    if(this._hasDataChanged(this.oldData.auctionInfo.item, data.auctionInfo.item)) {
                        this._update(data);
                        this.dispatchEvent(new Event('change'));
                        this.dispatchEvent(new CustomEvent('data-change', {detail: {data: data}}));
                    }
                })
                .then(done)
                .catch(done);

            function done(m) {
                if(m) console.error(m);
                self.dispatchEvent(new CustomEvent('update-end', {}));
            }
        }

        _setLinksAndImages(data) {
            let itemElem = this.querySelector('.item a'),
                photoAnchorElem = this.querySelector('.photo a'),
                photoIconElem = this.querySelector('.photo a img.icon-small'),
                photoIconLargeElem = this.querySelector('.photo a img.icon-large'),
                bidsAnchorElem = this.querySelector('.bids a'),
                auction = data.auctionInfo.auction,
                item = data.auctionInfo.item,
                allData = {...item, ...auction};

            itemElem.setAttribute('href', '/cgi-bin/mmlist.cgi?{{auctionId}}/{{itemId}}'.mustache(allData));
            photoAnchorElem.setAttribute('href', '/cgi-bin/mmlist.cgi?{{auctionId}}/{{itemId}}'.mustache(allData));
            photoIconElem.setAttribute('src', item.itemIcon);
            photoIconLargeElem.setAttribute('src', item.itemIcon);
            bidsAnchorElem.setAttribute('href', 'cgi-bin/mmhistory.cgi?{{auctionId}}/{{itemId}}'.mustache(allData));
        }

        _update(data) {
            this._updateData(data);
            this._updateStyles(data);
        }

        _updateData(newData) {
            let itemElem = this.querySelector('.item a'),
                descriptionElem = this.querySelector('.description'),
                bidsElem = this.querySelector('.bids a span'),
                highBiddersElem = this.querySelector('.highbidder span'),
                currentAmountElem = this.querySelector('.currentamount span'),
                nextBidRequiredElem = this.querySelector('.nextbidrequired span'),
                yourBidElem = this.querySelector('.yourbid span'),
                yourMaxBidElem = this.querySelector('.yourmaximum span'),

                auction = newData.auctionInfo.auction,
                item = newData.auctionInfo.item,
                allData = {...item, ...auction};

            itemElem.textContent = allData.itemId;
            descriptionElem.textContent = item.itemDescription;
            bidsElem.textContent = allData.itemNumOfBids;
            highBiddersElem.textContent = allData.itemHighBidder;
            currentAmountElem.textContent = allData.itemCurrentAmount;
            nextBidRequiredElem.textContent = allData.itemNextBidRequired;
            yourBidElem.textContent = allData.itemYourBid;
            yourMaxBidElem.textContent = allData.itemYourMaxBid;

            this.oldData = newData;
        }

        _updateStyles(/*data*/) {
        }

        _hasDataChanged(oldData, newData) {
            if(!oldData || !newData) return true;

            return AuctionItemRow.CHANGE_WATCH_PROPS.reduce((acc, prop)=> {
                return acc || oldData[prop] !== newData[prop];
            }, false);
        }

        _onRefresh() {
            this._refresh();
        }

        static requestItemInfo(url) {
            return AuctionItemRow.request(url)
                .then((req)=>{
                    let div = document.createElement('div');
                    div.innerHTML = req.responseText;
                    return div;
                })
                .then(AuctionItemRow.getAllInfoFromElem);
        }

        static getAllInfoFromElem(elem) {
            let table = elem.querySelector(`table#${AuctionItemRow.DATA_TABLE_ID}`),
                trData = table.querySelector('tbody > tr:first-child') || {},
                submitTable = elem.querySelector('table#SubmitBids') || {},

                client = elem.querySelector('input[name="client"]') || {},
                auction = elem.querySelector('input[name="auction"]') || {},
                contents = elem.querySelector('input[name="contents"]') || {},
                icon     = trData.querySelector('td.photo img') || {},
                description = trData.querySelector('td.description') || {},
                bids        = trData.querySelector('td.bids') || {},
                highbidder = trData.querySelector('td.highbidder') || {},
                currentAmount = trData.querySelector('td.currentamount') || {},
                nextBidRequired = trData.querySelector('td.nextbidrequired') || {},
                yourBid         = trData.querySelector('td.yourbid') || {},
                yourMaxBid      = trData.querySelector('td.yourmaximum') || {},
                yourBidNumber = submitTable.querySelector('td.sbidcurbid strong') || {},
                yourBidNumber2 = submitTable.querySelector('td.sbidbidder input[name="bidder"]') || {},

                itemId = (contents.value || '').replace('/', ''),  //contents
                itemIcon = icon.src || '',
                itemDescription = (description.textContent || '').trim(),
                itemNumOfBids = (bids.textContent || '').trim(),
                itemHighBidder = (highbidder.textContent || '').trim(),
                itemCurrentAmount = (currentAmount.textContent || '').trim(),
                itemNextBidRequired = (nextBidRequired.textContent || '').trim(),
                itemYourBid = (yourBid.textContent || '').trim(),
                itemYourMaxBid = (yourMaxBid.textContent || '').trim(),
                auctionId = auction.value || '',  //event
                auctionName = client.value || '', //c
                auctionNum = Auction.AUCTIONID_ID_REG.exec(auctionId + '/' + itemId),
                bidderId = (yourBidNumber.textContent || '').trim() || (yourBidNumber2.value || '').trim();

            return {
                elem:        elem,
                auctionInfo: {
                    auction: new Auction(auctionName, auctionNum, auctionId), //c, , event
                    bidder:  {
                        id: bidderId
                    },
                    item: new AuctionItem({
                        itemId,
                        itemIcon,
                        itemDescription,
                        itemNumOfBids,
                        itemHighBidder,
                        itemCurrentAmount,
                        itemNextBidRequired,
                        itemYourBid,
                        itemYourMaxBid
                    })
                }
            };
        }

        static getAuctionIdFromURL(url) {
            let fullID = Auction.AUCTIONID_ID_REG.exec(url.search),
                client = '',
                auctionId = '',
                itemId = '',
                auctionNum = '',
                fullId = '';

            if(fullID) {
                client = fullID[Auction.CLIENT] || '';
                auctionId = fullID[Auction.AUCTION_ID] || '';
                itemId = fullID[Auction.ITEM_ID] || '';
                auctionNum = fullID[Auction.AUCTION_NUM] || '';
                fullId = fullID[Auction.FULL_ID] || '';
            }else {
                console.error(new Error('Unable to parse URL: ' + url));
            }

            return {
                c:          client,
                event:      auctionId,
                contents:   itemId,
                auctionNum: auctionNum,
                fullId:     fullId
            };
        }

        static request(url) {
            const oReq = new XMLHttpRequest();

            return new Promise((resolve, reject)=> {
                oReq.open('GET', url, true);
                oReq.addEventListener('load', success);
                oReq.addEventListener('error', fail);
                oReq.addEventListener('abort', fail);
                oReq.addEventListener('timeout', fail);
                oReq.send();

                function fail(evt) {
                    reject(oReq, evt);
                }
                function success(evt) {
                    if( oReq.getResponseHeader('content-type').indexOf('application/json') !== -1) {
                        oReq.responseJSON = JSON.parse(oReq.responseText);
                    }
                    resolve(oReq, evt);
                }
            });
        }

        static __register() {
            customElements.define(AuctionItemRow.TAG_NAME, AuctionItemRow, {extends: 'tr'});
            document.body.insertAdjacentHTML('beforeend', AuctionItemRow.template);
            document.body.insertAdjacentHTML('beforeend', AuctionItemRow.styles);
        }

        static template = `
            <template id="auction-item-row-template">
               <td class="item"><a target="_blank" href="#">###</a></td>
               <td class="photo" align="center">
                   <a target="_blank" href="#">
                       <img class="icon-small" src="" alt="no image"/>
                       <img class="icon-large" src=""/>
                   </a>
               </td>
               <td class="description"                  >XYZ</td>
               <td class="bids"            align="right"><a target="_blank" href=""><span>##</span></a></td>
               <td class="highbidder"      align="right"><span>Empty</span></td>
               <td class="currentamount"   align="right"><span>#.##</span></td>
               <td class="nextbidrequired" align="right"><span>#.##</span></td>
               <td class="yourbid"         align="right"><span>#.##</span></td>
               <td class="yourmaximum"     align="center"><span>#.##</span></td>
           </template>
       `;

        static styles = `
            <style>
            </style>
        `;
    }

    class Auction{
        static AUCTIONID_ID_REG = /(([a-zA-Z]+)([0-9]+))\/([0-9]+)/;
        static FULL_ID = 0;
        static AUCTION_ID = 1;
        static CLIENT = 2;
        static AUCTION_NUM = 3;
        static ITEM_ID = 4;

        auctionName;
        auctionId;
        auctionNum;

        constructor(name, num, id) {
            if(typeof(name) === 'string') {
                this.auctionName = name;
                this.auctionId = id;
                this.auctionName = num;
            }else {
                this.copy(name);
            }
        }

        copy(a) {
            this.auctionName = a.auctionName;
            this.auctionNum = a.auctionNum;
            this.auctionId = a.auctionId;
            return this;
        }

        clone() {
            return new Auction(this);
        }

        static parseAuctionID(id) {
            let fullID = Auction.AUCTIONID_ID_REG.exec(id),
                client = '',
                auctionId = '',
                itemId = '',
                auctionNum = '';

            if(fullID) {
                client = fullID[Auction.CLIENT] || '';
                auctionId = fullID[Auction.AUCTION_ID] || '';
                itemId = fullID[Auction.ITEM_ID] || '';
                auctionNum = fullID[Auction.AUCTION_NUM] || '';
            }

            return {
                auctionId:   auctionId,
                auctionNum:  auctionNum,
                auctionName: client,
                itemId:      itemId
            };
        }
    }

    class AuctionItem{
        itemId;
        itemIcon;
        itemDescription;
        itemNumOfBids;
        itemHighBidder;
        itemCurrentAmount;
        itemNextBidRequired;
        itemYourBid;
        itemYourMaxBid;

        constructor(item) {
            if(typeof(item) === 'string') {
                this.itemId = item;
            }else{
                this.copy(item);
            }
        }

        copy(itm) {
            this.itemId = itm.itemId;
            this.itemIcon = itm.itemIcon;
            this.itemDescription = itm.itemDescription;
            this.itemNumOfBids = itm.itemNumOfBids;
            this.itemHighBidder = itm.itemHighBidder;
            this.itemCurrentAmount = itm.itemCurrentAmount;
            this.itemNextBidRequired = itm.itemNextBidRequired;
            this.itemYourBid = itm.itemYourBid;
            this.itemYourMaxBid = itm.itemYourMaxBid;

            return this;
        }

        clone() {
            return new AuctionItem(this);
        }
    }

    return {AuctionWatchList, AuctionItemRow, Auction, AuctionItem};
})();

var utils = (()=> {
    function buildItemList() {
        let viewFormElem = document.querySelector('form[name="viewform"]'),
            baseURL = viewFormElem.action,
            auction = (viewFormElem.querySelector('input[name="auction"]') || {}).value,
            pageCount = parseInt((viewFormElem.querySelector('input[name="pages"]') || {}).value || '');

        return Array.prototype.filter.call(viewFormElem.querySelectorAll('input'), (e)=> {
            return parseInt(e.name.substr(1)) <= parseInt(pageCount);
        }).filter(Boolean).reduce((acc, e)=> {
            return acc.concat(e.value.split('/'));
        }, []).map((v)=> {
            return baseURL + '?' + auction + '/' + v;
        });
    }

    function pageItems() {
        return Array.prototype.reduce.call(document.querySelectorAll('.morepics a'), (acc, e)=>{ acc.push(e.href); return acc;}, []).join('\n');
    }

    return {
        buildItemList: buildItemList,
        pageItems:     pageItems
    };
})();

((AuctionWatchList, AuctionItemRow, Auction, AuctionItem, utils)=> {
    let template = `
            <style>
                body {
                    padding: 4px;
                }
                table {
                    width: 100%;
                }
                form#addItemform label, form#addItemform input {
                    vertical-align: top;
                }
                .not-high-bidder {
                    color: red
                }

                #addItemform > div {
                    display: inline-block;
                    vertical-align: top;
                }
                #addItemform > div > input {
                    display: block;
                }
                textarea {
                    width: 350px;
                }
                section.add-item-section {
                    padding: 4px;
                }
            </style>
            <section class="add-item-section">
                <form id="addItemform" action="#">
                    <label for="addItem">Add Item</label>
                    <textarea name="addItem"></textarea>
                    <div>
                        <input type="submit" value="Add"/>
                        <input type="button" value="Clear"/>
                    </div>
                </form>
            </section>
            <form id="refreshRateForm" action="#">
                <label for="refreshRate">Refresh rate:</label>
                <input type="number" min="1" max="10" name="refreshRate" value="10"/>
                <input type="submit" value="Set"/>
            </form>
        `,
        refreshRate = AuctionItemRow.DEFAULT_REFRESH_RATE_MS/1000;
        //yourBidNumber = ((document.body.querySelector('table#SubmitBids td.sbidcurbid strong') || {}).textContent || '').trim();

    window.RefreshBids = ()=>{};
    window.ResetCounter = ()=>{};
    window.allAuctionItems = utils.buildItemList();
    document.title = 'Watch List: ' + document.title;
    document.body.innerHTML = template;
    //#### DEBUG #####
    document.body.querySelector('textarea').value = window.allAuctionItems.join('\n');
    //################
    AuctionItemRow.__register();
    AuctionWatchList.__register();
    document.body.insertAdjacentHTML('beforeend', '<auction-watch-list data-refresh-rate="10"></auction-watch-list>');

    let watchListElem = document.body.querySelector('auction-watch-list');

    document.body.querySelector('form#refreshRateForm').addEventListener('submit', (evt)=> {
        evt.preventDefault();
        evt.stopPropagation();
        let rate = parseInt(evt.currentTarget.querySelector('input[name="refreshRate"]').value) || refreshRate;

        watchListElem.setAttribute('data-refresh-rate', rate);
    });
    document.body.querySelector('form#addItemform').addEventListener('submit', (evt)=> {
        evt.preventDefault();
        evt.stopPropagation();
        let items = evt.currentTarget.querySelector('textarea[name="addItem"]').value;

        items = items.split(/[\t\n \r]/).filter(Boolean).filter(url=> {
            try {
                new URL(url);
                return true;
            }catch {
                return false;
            }
        });

        items.chain((url)=> {
            return ((url)=>{
                document.body.querySelector('auction-watch-list').dispatchEvent(new CustomEvent('add-item', {detail: {src: url}}));
            }).delay(500, url);
        });
    });
    document.body.querySelector('form#addItemform input[type="button"]').addEventListener('click', (evt)=> {
        evt.preventDefault();
        evt.stopPropagation();
        document.body.querySelector('form#addItemform textarea[name="addItem"]').value = '';
    });

    watchListElem.addEventListener('watchlist-data-change', (e)=> {
        let highBidderElem = e.detail.row.querySelector('td.highbidder');

        if(e.detail.data.auctionInfo.bidder.id.trim() !== e.detail.data.auctionInfo.item.itemHighBidder.trim()) {
            highBidderElem.classList.add('not-high-bidder');
        }else {
            highBidderElem.classList.remove('not-high-bidder');
        }
    });
})(classes.AuctionWatchList, classes.AuctionItemRow, classes.Auction, classes.AuctionItem, utils);

// items = [
//             'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples422/12',
//             'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples422/27',
//             'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples422/57',
//             'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples427/7376',
//             'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples414/1068', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples414/1076', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/665', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/677', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/730', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/652', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/698', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/651', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/403 ', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/407', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/408', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/411', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/423', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/424', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/452', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/461', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/523', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/527', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/531', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/553', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples430/239', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples430/137', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples430/142', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples430/119', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples430/120', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples430/70', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples430/53', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples430/33', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples412/1079', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples412/1062', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples412/1028', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples412/1015', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples412/1220', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples412/1270', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples412/1274', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples412/2500', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples429/242', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples429/245', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples429/32', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples429/24', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples429/118', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples428/2027/3', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples428/2074', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples428/2034', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples428/2263', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples423/37', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples423/144', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples423/155', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples423/158', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples423/312', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples423/457', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples423/472', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples430/2', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples430/6', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples430/13', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples427/7760', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/757', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/757', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/425', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/509', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/529', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples422/12', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples422/27', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples422/57', 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples412/1149'
//         ].map(l=>{return new URL(l);}),

