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

let refreshRate = 10,
    isReplaced = false,
    allAuctionItems = [],
    bidderId = null;

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
                addAllItems([message.url]);
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
                        addAllItems(items);
                    }
                })
                .catch(e=> {
                    sendResponseCallback({message: 'Failed All Add.', error: e});
                });
            break;

        case 'save-bidder':
            bidderId = message.bidderId;
            break;

        default:
            sendResponseCallback({message: 'Unable to handle message.'});
    }
    return true;
});

function replacePage() {
    document.body.innerHTML = '';

    document.title = 'Watch List: ' + document.title;
    AuctionItemRow.__register(document.body);
    AuctionWatchList.__register(document.body);
    AuctionWatchListControls.__register(document.body);
    document.body.insertAdjacentHTML('beforeend', styles);
    document.body.insertAdjacentHTML('beforeend', '<auction-watch-list-controls></auction-watch-list-controls>');
    document.body.insertAdjacentHTML('beforeend', '<auction-watch-list data-refresh-rate="10"></auction-watch-list>');

    if(allAuctionItems.length) {
        addAllToWatchListControls(allAuctionItems.join('\n'));
    }

    let watchListElem = document.body.querySelector('auction-watch-list');

    document.body.querySelector('form.refreshRateForm').addEventListener('submit', (evt)=> {
        evt.preventDefault();
        evt.stopPropagation();
        let rate = parseInt(evt.currentTarget.querySelector('input[name="refreshRate"]').value) || refreshRate;

        watchListElem.setAttribute('data-refresh-rate', rate);
    });
    document.body.querySelector('form.addItemform').addEventListener('submit', (evt)=> {
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

        addAllToWatchList(items);
    });
    document.body.querySelector('form.addItemform input[type="button"]').addEventListener('click', (evt)=> {
        evt.preventDefault();
        evt.stopPropagation();
        document.body.querySelector('form.addItemform textarea[name="addItem"]').value = '';
    });

    watchListElem.addEventListener('watchlist-data-change', (e)=> {
        let highBidderElem = e.detail.row.querySelector('td.highbidder'),
            bId = bidderId || e.detail.data.auctionInfo.bidder.id.trim();

        if( bId !== e.detail.data.auctionInfo.item.itemHighBidder.trim()) {
            highBidderElem.classList.add('not-high-bidder');
        }else {
            highBidderElem.classList.remove('not-high-bidder');
        }
    });
}

function addAllItems(items) {
    addAllToWatchListControls(items);
    addAllToWatchList(items);
}

function addAllToWatchList(items) {
    items.chain((url)=> {
        return ((url)=>{
            document.body.querySelector('auction-watch-list').dispatchEvent(new CustomEvent('add-item', {detail: {src: url}}));
        }).delay(500, url);
    });
}

function addAllToWatchListControls(items) {
    document.body.querySelector(AuctionWatchListControls.TAG_NAME).dispatchEvent(new CustomEvent('add-item', {detail: {items: items}}));
}
