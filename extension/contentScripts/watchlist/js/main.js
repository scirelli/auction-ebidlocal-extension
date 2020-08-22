/*
* TODO: Chrome Extensions does not support Custom Elements. Need to remove it from this code.
* Need to use shadow dom with this custom elements library.
* Only way to get custom elements partially working was to use a library. ...Annoying need to remove it and find another way.
* Need to add bidder number to options screen.
*/
import * as extras from './extras/index.js'; //eslint-disable-line no-unused-vars
import * as utils from './utils/auction-categories_All-Page.js';
import {AuctionItemRow} from './components/AuctionItemRow.js';
import {AuctionWatchList} from './components/AuctionWatchList.js';
import {AuctionWatchListControls} from './components/AuctionWatchListControls.js';

const styles = `
    <style>
        body {
            padding: 4px;
        }
        table {
            width: 100%;
        }
    </style>
`;

let isReplaced = false,
    allAuctionItems = [],
    bidderId = {
        _bidderId: null,
        get bidderId() {
            return this._bidderId;
        },
        set bidderId(id) {
            this._bidderId = id + '';
        }
    };

//chrome.runtime.sendMessage(extensionId, message, options, responseCallback)//responseCallback(responseObj)
chrome.runtime.onMessage.addListener((message, sender, sendResponseCallback)=> {
    switch(message.message) {
        case 'open-watch-list':
            if(!isReplaced) {
                replacePage();
                isReplaced = true;
                sendResponseCallback({message: 'inserted'});
            }else{
                sendResponseCallback({message: 'already inserted'});
            }
            break;
        case 'add-url':
            allAuctionItems.push(message.url);

            sendResponseCallback({message: 'Added'});

            if(isReplaced) {
                addAllToWatchListControls([message.url]);
            }
            break;
        case 'add-all':
            AuctionItemRow.request(message.url)
                .then((req)=> {
                    let div = document.createElement('div');
                    div.innerHTML = req.responseText;
                    return div;
                })
                .then((elem)=> {
                    let items = utils.buildItemList(elem);

                    allAuctionItems.push(items.join('\n'));
                    sendResponseCallback({message: 'All Added'});

                    return items;
                })
                .then(items=> {
                    if(isReplaced) {
                        addAllToWatchListControls(items);
                    }
                })
                .catch(e=> {
                    sendResponseCallback({message: 'Failed All Add.', error: e});
                });
            break;

        case 'save-bidder':
            bidderId.bidderId = message.bidderId;
            break;

        default:
            sendResponseCallback({message: 'Unable to handle message.'});
    }
    return true;
});

chrome.storage.sync.get(['bidderId'], function(result) {
    bidderId.bidderId = result.bidderId || '';
});

function replacePage() {
    let itemIdSpans = Array.prototype.map.call(document.body.querySelectorAll('tbody tr.DataRow'), (e)=> {
        return `<span id="${e.getAttribute('id')}_endtime"></span>`;
    });

    document.body.removeAttribute('onmousemove');
    document.body.innerHTML = `<div style="display:none">${itemIdSpans.join('')}<input name="client"/><input name="auction"/><input name="contents"/></div>`;

    document.title = 'Watch List: ' + document.title;
    AuctionItemRow.__register(document.body);
    AuctionWatchList.__register(document.body);
    AuctionWatchListControls.__register(document.body);
    document.body.insertAdjacentHTML('beforeend', styles);
    document.body.insertAdjacentHTML('beforeend', '<auction-watch-list-controls data-watch-list-id="a-watch-list"></auction-watch-list-controls>');
    document.body.insertAdjacentHTML('beforeend', '<auction-watch-list id="a-watch-list" data-refresh-rate="10"></auction-watch-list>');

    if(allAuctionItems.length) {
        addAllToWatchListControls(allAuctionItems.join('\n'));
    }

    document.querySelector('auction-watch-list#a-watch-list').addEventListener('watchlist-data-change', (e)=> {
        let highBidderElem = e.detail.row.querySelector('td.highbidder'),
            bId = bidderId.bidderId || e.detail.data.auctionInfo.bidder.id.trim();

        if( bId !== e.detail.data.auctionInfo.item.itemHighBidder.trim()) {
            highBidderElem.classList.add('not-high-bidder');
        }else {
            highBidderElem.classList.remove('not-high-bidder');
        }
    });
}

function addAllToWatchListControls(items) {
    document.body.querySelector(AuctionWatchListControls.TAG_NAME).dispatchEvent(new CustomEvent('add-item', {detail: {items: items}}));
}
