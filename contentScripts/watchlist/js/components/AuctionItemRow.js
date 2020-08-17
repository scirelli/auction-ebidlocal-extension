import {Auction} from './Auction.js';
import {AuctionItem} from './AuctionItem.js';

class AuctionItemRow{
    static TAG_NAME = 'tr';
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

    constructor(elem) {
        this.elem = elem;

        let template = document.getElementById('auction-item-row-template'),
            templateContent = template.content;

        this._registerForAttributeChanges(elem);

        elem.appendChild(templateContent.cloneNode(true));
        elem.addEventListener('refresh', this._onRefresh.bind(this));
    }

    _registerForAttributeChanges() {
        let observer = new MutationObserver((mutations)=> {
            mutations.forEach((mutation)=> {
                if (mutation.type === 'attributes') {
                    this.attributeChangedCallback(mutation.attributeName, mutation.oldValue, mutation.target.getAttribute(mutation.attributeName));
                }
            });
        });

        observer.observe(this.elem, {
            attributes:        true,
            attributeOldValue: true,
            attributeFilter:   this.observedAttributes
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch(name) {
            case 'src':
                this.elem.dispatchEvent(new CustomEvent('update-start', {}));
                AuctionItemRow.requestItemInfo(new URL(newValue))
                    .then((data)=> {
                        this._setLinksAndImages(data);
                        this._update(data);
                        if(this.elem.getAttribute('data-auto-refresh') !== null) {
                            this._stopRefresh();
                            this._startRefresh();
                        }
                    })
                    .then(()=> {
                        this.elem.dispatchEvent(new CustomEvent('update-end', {}));
                    })
                    .catch(e=> {
                        console.error(e);
                        this.elem.dispatchEvent(new CustomEvent('update-end', {}));
                        this.elem.remove();
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
            src = this.elem.getAttribute('src');

        if(!src) return Promise.resolve();

        this.elem.dispatchEvent(new CustomEvent('update-start', {}));
        return AuctionItemRow.requestItemInfo(new URL(src))
            .catch(e=> {
                console.error(new Error('Unable to parse data'));
                throw e;
            })
            .then((data)=>{
                if(this._hasDataChanged(this.oldData.auctionInfo.item, data.auctionInfo.item)) {
                    this._update(data);
                    this.elem.dispatchEvent(new Event('change'));
                    this.elem.dispatchEvent(new CustomEvent('data-change', {detail: {data: data}}));
                }
            })
            .then(done)
            .catch(done);

        function done(m) {
            if(m) console.error(m);
            self.elem.dispatchEvent(new CustomEvent('update-end', {}));
        }
    }

    _setLinksAndImages(data) {
        let itemElem = this.elem.querySelector('.item a'),
            photoAnchorElem = this.elem.querySelector('.photo a'),
            photoIconElem = this.elem.querySelector('.photo a img.icon-small'),
            photoIconLargeElem = this.elem.querySelector('.photo a img.icon-large'),
            bidsAnchorElem = this.elem.querySelector('.bids a'),
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
        let itemElem = this.elem.querySelector('.item a'),
            descriptionElem = this.elem.querySelector('.description'),
            bidsElem = this.elem.querySelector('.bids a span'),
            highBiddersElem = this.elem.querySelector('.highbidder span'),
            currentAmountElem = this.elem.querySelector('.currentamount span'),
            nextBidRequiredElem = this.elem.querySelector('.nextbidrequired span'),
            yourBidElem = this.elem.querySelector('.yourbid span'),
            yourMaxBidElem = this.elem.querySelector('.yourmaximum span'),

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

    static __register(doc) {
        doc.insertAdjacentHTML('beforeend', AuctionItemRow.template);
        doc.insertAdjacentHTML('beforeend', AuctionItemRow.styles);
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

export { AuctionItemRow };
