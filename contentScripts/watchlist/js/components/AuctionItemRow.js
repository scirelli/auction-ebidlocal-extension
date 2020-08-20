/*
Bid url
<input type="text" name="m71" size="8" placeholder="your max">
<input type="hidden" name="auction" value="staples430">
<input type="hidden" name="contents" value="71/">
<input type="text" name="bidder" size="8">
<input type="password" name="password" size="8">


-------------------------------------------------------------------------------------------------
Request Method: POST
action="/cgi-bin/mmlistb.cgi"

Form data
autoconfirm=&71=&m71=5&auction=staples430&contents=71%2F&bidder=18848&password=<password>&confirm=Submit+Bids

Second time form data
auction=staples430&bidder=18848&password=<password>&contents=71%2F&firsttry=firsttry&confirm=confirm&pages=&searchtitle=&searchcount=&page=&m71=5

Headers
Content-Type: application/x-www-form-urlencoded
Referer: https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples430/71
Sec-Fetch-Dest: document
Sec-Fetch-Mode: navigate
Sec-Fetch-Site: same-origin
Sec-Fetch-User: ?1

-------------------------------------------------------------------------------------------------
Request URL: https://auction.ebidlocal.com/cgi-bin/mmlistfauth.cgi
Request Method: POST

Form Data
auction=staples430&bidder=18848&password=<password>&contents=71%2F&confirm=confirm&pages=&searchtitle=&searchcount=&page=&m71=5&getcheck=on&forward=Continue

Headers
Content-Type: application/x-www-form-urlencoded
Referer: https://auction.ebidlocal.com/cgi-bin/mmlistb.cgi
Sec-Fetch-Dest: document
Sec-Fetch-Mode: navigate
Sec-Fetch-Site: same-origin
Sec-Fetch-User: ?1

-------------------------------------------------------------------------------------------------

Headers
Sec-Fetch-Dest: document
Sec-Fetch-Mode: navigate
Sec-Fetch-Site: same-origin
Sec-Fetch-User: ?1
Content-Type: application/x-www-form-urlencoded

Form Data
71=&m71=5.00&auction=staples430&contents=71%2F&bidder=18848&password=<password>&item=71&search=71&bid=Submit+Bids
71:
m71: 5.00
auction: staples430
contents: 71/
bidder: 18848
password: <password>
item: 71
search: 71
bid: Submit Bids

*/
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
        'itemNextBidRequired',
        'itemTimeRemaining',
        'itemBidStatus'
    ];

    static get observedAttributes() { return ['src', 'data-refresh-rate', 'data-auto-refresh']; }

    refreshIntervalId = 0;
    refreshRate = AuctionItemRow.DEFAULT_REFRESH_RATE_MS;
    oldData;

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
                this._refresh()
                    .then((data)=> {
                        this._setLinksAndImages(data);
                        if(this.elem.getAttribute('data-auto-refresh') !== null) {
                            this._stopRefresh();
                            this._startRefresh();
                        }
                    })
                    .catch(e=> {
                        this.elem.dispatchEvent(new CustomEvent('update-failed', {detail: {error: e, elem: this.elem}}));
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
            this._refresh()
                .then(this._startRefresh.bind(this))
                .catch(()=>{});
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

        this.elem.dispatchEvent.defer(this.elem, new CustomEvent('update-start', {}));
        return AuctionItemRow.requestItemInfo(new URL(src))
            .catch(e=> {
                console.error(new Error('Unable to parse data'));
                throw e;
            })
            .then((data)=>{
                let oldData = this.oldData;

                if(!this.oldData || this._hasDataChanged(this.oldData, data)) {
                    this._update(data);
                    this.elem.dispatchEvent(new Event('change'));
                    this.elem.dispatchEvent.defer(this.elem, new CustomEvent('data-change', {detail: {data: data, oldData: oldData}}));
                }
                self.elem.dispatchEvent.defer(self.elem, new CustomEvent('update-end', {detail: {data: data}}));
                return data;
            })
            .catch((e)=> {
                console.error(e);
                self.elem.dispatchEvent.defer(self.elem, new CustomEvent('update-end', {detail: {data: {}, error: e}}));
                throw e;
            });
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
        let oldData = this._updateData(data);
        this._updateStyles(data, oldData);
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
            allData = {...item, ...auction},
            oldData = this.oldData;

        itemElem.textContent = allData.itemId;
        descriptionElem.textContent = item.itemDescription;
        bidsElem.textContent = allData.itemNumOfBids;
        highBiddersElem.textContent = allData.itemHighBidder;
        currentAmountElem.textContent = allData.itemCurrentAmount;
        nextBidRequiredElem.textContent = allData.itemNextBidRequired;
        yourBidElem.textContent = allData.itemYourBid;
        yourMaxBidElem.textContent = allData.itemTimeRemaining + ' ' + allData.itemBidStatus;

        this.oldData = newData;

        return oldData;
    }

    _updateStyles(/*newData, oldData*/) {
    }

    _hasDataChanged(oldData, newData) {
        if(!oldData || !newData) return true;

        oldData = oldData.auctionInfo.item;
        newData = newData.auctionInfo.item;

        return AuctionItemRow.CHANGE_WATCH_PROPS.reduce((acc, prop)=> {
            return acc || oldData[prop] !== newData[prop];
        }, false);
    }

    _onRefresh() {
        this._refresh();
    }

    static whatDataChanged(oldData, newData) {
        oldData = oldData ? oldData.auctionInfo.item : {};
        newData = newData.auctionInfo.item;
        return AuctionItemRow.CHANGE_WATCH_PROPS.reduce((acc, prop)=> {
            if(!oldData || oldData[prop] !== newData[prop]) {
                acc[prop] = newData[prop];
            }
            return acc;
        }, {});
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

            client          = elem.querySelector('input[name="client"]') || {},
            auction         = elem.querySelector('input[name="auction"]') || {},
            contents        = elem.querySelector('input[name="contents"]') || {},
            icon            = trData.querySelector('td.photo img') || {},
            description     = trData.querySelector('td.description') || {},
            bids            = trData.querySelector('td.bids') || {},
            highbidder      = trData.querySelector('td.highbidder') || {},
            currentAmount   = trData.querySelector('td.currentamount') || {},
            nextBidRequired = trData.querySelector('td.nextbidrequired') || {},
            yourBid         = trData.querySelector('td.yourbid') || {},
            yourMaxBid      = trData.querySelector('td.yourmaximum span:nth-of-type(2)') || {},
            bidStatus       = trData.querySelector('td.yourmaximum span:nth-of-type(3)') || {},
            yourBidNumber   = submitTable.querySelector('td.sbidcurbid strong') || {},
            yourBidNumber2  = submitTable.querySelector('td.sbidbidder input[name="bidder"]') || {},

            itemId = (contents.value || '').replace('/', ''),  //contents
            itemIcon = icon.src || '',
            itemDescription = (description.textContent || '').trim(),
            itemNumOfBids = (bids.textContent || '').trim(),
            itemHighBidder = (highbidder.textContent || '').trim(),
            itemCurrentAmount = (currentAmount.textContent || '').trim(),
            itemNextBidRequired = (nextBidRequired.textContent || '').trim(),
            itemYourBid = (yourBid.textContent || '').trim(),
            itemTimeRemaining = (yourMaxBid.textContent || '').replace('submit bid', '').replace('refresh', '').replace('watch', '').replace('remaining', '').trim(),
            itemBidStatus = (bidStatus.textContent || '').trim(),
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
                    itemTimeRemaining,
                    itemBidStatus
                })
            }
        };
    }

    static getAuctionIdFromURL(url) {
        url = new URL(url);

        return AuctionItemRow.parseAuctionIds(url.search);
    }

    static parseAuctionIds(queryString) {
        let fullID = Auction.AUCTIONID_ID_REG.exec(queryString),
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
            console.error(new Error('Unable to parse URL: ' + queryString));
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
           <td class="remove"><button class="pointer"><span class="far"></span></button></td>
           <td class="item"><a target="_blank" href="#">###</a></td>
           <td class="photo">
               <a target="_blank" href="#">
                   <img class="icon-small" src="" alt="no image"/>
                   <img class="icon-large" src=""/>
               </a>
           </td>
           <td class="description"                  >XYZ</td>
           <td class="bids"           ><a target="_blank" href=""><span>##</span></a></td>
           <td class="highbidder"     ><span>Empty</span></td>
           <td class="currentamount"  ><span>#.##</span></td>
           <td class="nextbidrequired"><span>#.##</span></td>
           <td class="yourbid"        ><span>#.##</span></td>
           <td class="yourmaximum"    ><span>#.##</span></td>
       </template>
   `;

    static styles = `
        <style>
            .pointer {cursor: pointer;}
            .remove {
                text-align: center;
                margin: 0;
                padding: 0;
                vertical-align: middle; 
            }
            .far:before{
                content: "\\f014";
            }
            .far {
                display: inline-block;
                font: normal normal normal 14px/1 FontAwesome;
                font-size: 14px;
                text-rendering: auto;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            .description {
                vertical-align: top;
            }
        </style>
    `;
}

export { AuctionItemRow };
