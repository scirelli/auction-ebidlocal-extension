//TODO: Chrome Extensions does not support Custom Elements. Need to remove it from this code.
const utils = require('./utils/auction-categories_All-Page.js'),
    AuctionItemRow = require('./components/AuctionItemRow.js'),
    AuctionWatchList = require('./components/AuctionWatchList.js');

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
    refreshRate = 10;

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

/*
items = 'https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples422/12, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples422/27, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples422/57, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples427/7376, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples414/1068, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples414/1076, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/665, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/677, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/730, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/652, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/698, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/651, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/403 , https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/407, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/408, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/411, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/423, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/424, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/452, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/461, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/523, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/527, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/531, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/553, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples430/239, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples430/137, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples430/142, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples430/119, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples430/120, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples430/70, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples430/53, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples430/33, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples412/1079, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples412/1062, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples412/1028, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples412/1015, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples412/1220, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples412/1270, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples412/1274, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples412/2500, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples429/242, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples429/245, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples429/32, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples429/24, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples429/118, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples428/2027/3, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples428/2074, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples428/2034, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples428/2263, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples423/37, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples423/144, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples423/155, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples423/158, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples423/312, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples423/457, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples423/472, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples430/2, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples430/6, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples430/13, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples427/7760, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/757, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/757, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/425, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/509, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples421/529, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples422/12, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples422/27, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples422/57, https://auction.ebidlocal.com/cgi-bin/mmlist.cgi?staples412/1149'
    .split(', ').map(l=>{return new URL(l);});
*/
