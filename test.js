if(!String.prototype.mustache) {
    String.prototype.mustache = function(o) {
        return this.replace(/{{([^{}]*)}}/g, function(a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r:a;
        });
    };
}

var classes = (()=> {
    class AuctionItemRow extends HTMLTableRowElement{
        static TAG_NAME = 'auction-item-row';

        constructor() {
            super();
        }

        static __register() {
            customElements.define(AuctionItemRow.TAG_NAME, AuctionItemRow, {extends: 'tr'});
        }
    }

    class Auction{
        static AUCTIONID_ID_REG = /(([a-zA-Z]+)([0-9]+))\/([0-9]+)/;
        static CLIENT = 2;
        static AUCTION_ID = 1;
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

    return {AuctionItemRow, Auction, AuctionItem};
})();

((AuctionItemRow, Auction, AuctionItem)=> {
    const //PAGE_ORIGIN = new URL(window.location.href).origin,
        //ITEM_LINK = new URL('/cgi-bin/mmlist.cgi', PAGE_ORIGIN),
        DATA_TABLE_ID = 'DataTable';

    AuctionItemRow.__register();

    let items = [
            new URL('https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples422/12'),
            new URL('https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples422/27'),
            new URL('https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples422/57'),
            new URL('https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples427/7376')
        ],
        tableTemplate = `
        <style>
            table {
                margin:4px;
            }
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
                background-color: #FFDDFF;
                transition: background-color 0.2s ease-out;
            }
            tbody tr{
                transition: background-color 0.2s ease-out;
            }
        </style>
        <table id="{{tableID}}" class="listbody" cellpadding="3" cellspacing="1">
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
        `,
        rowTemplate = `
           <td class="item"><a target="_blank" href="/cgi-bin/mmlist.cgi?{{auctionId}}/{{itemId}}">{{itemId}}</a></td>
           <td align="center" class="photo">
               <a target="_blank" href="/cgi-bin/mmlist.cgi?{{auctionId}}/{{itemId}}">
                   <img src="{{itemIcon}}"/>
                   <img class="icon-large" src="{{itemIcon}}"/>
               </a>
           </td>
           <td class="description">{{itemDescription}}</td>
           <td align="right" class="bids"><a  target="_blank" href="/cgi-bin/mmhistory.cgi?{{auctionId}}/{{itemId}}"><span id="{{itemId}}_bids">{{itemNumOfBids}}</span></a></td>
           <td align="right" class="highbidder"><span id="{{itemId}}_highbidder">{{itemHighBidder}}</span></td>
           <td align="right" class="currentamount"><span id="{{itemId}}_currentprice">{{itemCurrentAmount}}</span></td>
           <td align="right" class="nextbidrequired"><span id="{{itemId}}_nextrequired">{{itemNextBidRequired}}</span></td>
           <td align="right" class="yourbid"><span id="{{itemId}_yourbid">{{itemYourBid}}</span></td>
           <td align="center" class="yourmaximum"><span id="{{auctionNum}}_yourmax">{{itemYourMaxBid}}</span></td>
       `;

    window.RefreshBids = ()=>{};
    document.title = 'Watch List: ' + document.title;
    document.body.innerHTML = tableTemplate.mustache({tableID: DATA_TABLE_ID});
    items.forEach(itm=>test(itm).then(insertRow));

    function test(url) {
        return requestItemInfo(url)
            .then((data)=> {
                let actionInfo = getAuctionIdFromURL(url);
                return {actionInfo: actionInfo, data: data, sourceURL: url};
            });
    }

    function insertRow(oData) {
        let tbodyElem = document.body.querySelector('table > tbody');

        if(!tbodyElem.querySelector(`tr[id="${oData.data.auctionInfo.item.itemId}"]`)) {
            createRow();
        }

        update();

        function createRow() {
            let newRow = document.createElement('tr', {is: AuctionItemRow.TAG_NAME});
            //src="{{src}}" class="DataRow" id="{{itemId}}" valign="top"
            newRow.setAttribute('src', oData.sourceURL);
            newRow.classList.add('DataRow');
            newRow.setAttribute('id', oData.data.auctionInfo.item.itemId);
            newRow.setAttribute('valign', 'top');
            newRow.innerHTML = rowTemplate.mustache({...oData.data.auctionInfo.item, ...oData.data.auctionInfo.auction});

            tbodyElem.appendChild(newRow);
            return newRow;
        }
        function update() {
            //TODO: After creation start updates. Done in component
        }
    }

    // function test1(n) {
    //     let url = items[n];
    //     return request(url)
    //         .then((req)=>{
    //             let div = document.createElement('div');
    //             div.innerHTML = req.responseText;
    //             return div;
    //         })
    //         .then((elem)=> {
    //             let actionInfo = getAuctionIdFromURL(url),
    //                 getBidsURL = buildGetBidsURL(actionInfo);

    //             return {elem: elem, infoURL: getBidsURL, actionInfo: actionInfo, sourceURL: url};
    //         });
    // }



    function requestItemInfo(url) {
        return request(url)
            .then((req)=>{
                let div = document.createElement('div');
                div.innerHTML = req.responseText;
                return div;
            })
            .then(getAllInfoFromElem);
    }

    function getAllInfoFromElem(elem) {
        let table = elem.querySelector(`table#${DATA_TABLE_ID}`),
            trData = table.querySelector('tbody > tr:first-child'),

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
            auctionNum = Auction.AUCTIONID_ID_REG.exec(auctionId + '/' + itemId);

        return {
            elem:        elem,
            auctionInfo: {
                auction: new Auction(auctionName, auctionNum, auctionId), //c, , event
                item:    new AuctionItem({
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

    function getAuctionIdFromURL(url) {
        let fullID = Auction.AUCTIONID_ID_REG.exec(url.search),
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
            c:          client,
            event:      auctionId,
            contents:   itemId,
            auctionNum: auctionNum
        };
    }
    // function buildGetBidsURL(actionInfo) {
    //     let getBidsURL = new URL('/cgi-bin/v6.cgi', PAGE_ORIGIN);
    //     actionInfo['a'] = 'getBids';
    //     for (let p in actionInfo) {
    //         getBidsURL.searchParams.append(p, actionInfo[p]);
    //     }
    //     return getBidsURL;
    // }

    function request(url) {
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
})(classes.AuctionItemRow, classes.Auction, classes.AuctionItem);
