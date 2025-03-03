import * as extras from './extras/index.js'; //eslint-disable-line no-unused-vars
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

function addAllToWatchListControls(items) {
    document.body.querySelector(AuctionWatchListControls.TAG_NAME).dispatchEvent(new CustomEvent('add-item', {detail: {items: items}}));
}
export addAllToWatchListControls;

export function replacePage(allAuctionItems=allAuctionItems, bidderId=bidderId) {
		allAuctionItems = Array.isArray(allAuctionItems) ? allAuctionItems : [];
		bidderId = bidderId ? bidderId : '';

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
				if(!e.detail.data || !e.detail.data.auctionInfo || !e.detail.data.auctionInfo.bidder || !e.detail.data.auctionInfo.bidder.id) return;

        let highBidderElem = e.detail.row.querySelector('td.highbidder'),
            bId = e.detail.data.auctionInfo.bidder.id.trim();

        if( bId !== e.detail.data.auctionInfo.item.itemHighBidder.trim()) {
            highBidderElem.classList.add('not-high-bidder');
        }else {
            highBidderElem.classList.remove('not-high-bidder');
        }
    });
}
