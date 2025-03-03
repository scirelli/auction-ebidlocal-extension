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
import {replacePage, addAllToWatchListControls} from './replacer.js'

let isReplaced = false,
    allAuctionItems = [],
    bidder = {
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
            bidder.bidderId = message.bidderId;
            break;

        default:
            sendResponseCallback({message: 'Unable to handle message.'});
    }
    return true;
});

chrome.storage.sync.get(['bidderId'], function(result) {
    bidder.bidderId = result.bidderId || '';
});
