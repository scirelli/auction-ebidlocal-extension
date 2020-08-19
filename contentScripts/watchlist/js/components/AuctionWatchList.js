import {AuctionItemRow} from './AuctionItemRow.js';

class AuctionWatchList extends HTMLElement{
    static TAG_NAME = 'auction-watch-list';
    static DEFAULT_REFRESH_RATE_MS = 10 * 1000;

    static get observedAttributes() { return ['data-refresh-rate']; }

    refreshIntervalId = null;
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
                if(this.refreshIntervalId === null) {
                    this._startRefresh();
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
        //Does nothing. Would need to break the promise chain.
        clearTimeout(this.refreshIntervalId);
        this.refreshIntervalId = 0;
    }

    _refresh() {
        let self = this,
            rows = Array.prototype.slice.call(this.querySelectorAll('table > tbody > tr') || [], 0);

        this.dispatchEvent(new CustomEvent('update-start'));
        return rows.chain(tr=>((tr)=>{
            if(tr) tr.dispatchEvent(new CustomEvent('refresh'));
        }).delay(null, 500, tr)).then(done).catch(done);

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
                let row = this._createRow(oData);
                this.querySelector('table > tbody').appendChild(row);
            }
        }catch(e) {
            console.error(e);
        }
    }

    _createRow(oData) {
        let newRow = document.createElement('tr', {is: AuctionItemRow.TAG_NAME});
        newRow.__auctionItemRow = new AuctionItemRow(newRow);
        newRow.setAttribute('src', oData.sourceURL);
        newRow.classList.add('DataRow');
        newRow.setAttribute('id', oData.data.fullId);

        newRow.addEventListener('data-change', (e)=> {
            let changes = AuctionItemRow.whatDataChanged(e.detail.oldData, e.detail.data);

            if(!e.detail.oldData) return;
            if(Object.keys(changes).length === 1 && changes['itemYourMaxBid']) return;

            newRow.classList.add('changed');
            newRow.addEventListener('mouseenter', function onHover() {
                newRow.classList.remove('changed');
                newRow.removeEventListener('hover', onHover);
            });
        });
        newRow.addEventListener('update-start', ()=> {
            newRow.classList.add('updating-animated');
        });
        newRow.addEventListener('animationend', (e)=> {
            e.preventDefault();
            newRow.classList.remove('updating-animated');
        });
        newRow.addEventListener('update-end', ()=> {
            //newRow.classList.remove('updating-animated');
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
                    data: e.detail.data,
                    oldData: e.detail.oldData
                }
            }));
        });
        newRow.querySelector('td.remove button').addEventListener('click', (e)=> {
            e.preventDefault();
            newRow.remove();
        });
        return newRow;
    }

    _onAddItem(evt) {
        this._addItem(evt.detail.src);
    }

    static __register(doc) {
        customElements.define(AuctionWatchList.TAG_NAME, AuctionWatchList);
        doc.insertAdjacentHTML('beforeend', AuctionWatchList.template);
        doc.insertAdjacentHTML('beforeend', AuctionWatchList.style);
    }

    static template = `
        <template id="auction-watch-list-template">
            <table class="listbody" cellpadding="3" cellspacing="1">
                <thead>
                    <tr bgcolor="#073c68">
                        <th width="40"><font color="#ffffff"></th>
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
                /*transition: background-color 0.2s ease-out;*/
            }

            tr:nth-of-type(odd).updating-animated {
                background: linear-gradient(0deg, #EEE, #DDFFDD, #EEE, #EEE);
                background-size: 400% 300%;

                -webkit-animation: UpdateAnimation 1s ease 1;
                -moz-animation: UpdateAnimation 1s ease 1;
                animation: UpdateAnimation 1s ease 1;
            }
            tr.updating-animated {
                background: linear-gradient(0deg, transparent, #DDFFDD, transparent, transparent);
                background-size: 400% 300%;

                -webkit-animation: UpdateAnimation 1s ease 1;
                -moz-animation: UpdateAnimation 1s ease 1;
                animation: UpdateAnimation 1s ease 1;
            }

            @-webkit-keyframes UpdateAnimation {
                0%{background-position:50% 0%}
                100%{background-position:50% -150%}
            }
            @-moz-keyframes UpdateAnimation {
                0%{background-position:50% 0%}
                100%{background-position:50% -150%}
            }
            @keyframes UpdateAnimation {
                0%{background-position:50% 0%}
                100%{background-position:50% -150%}
            }
        </style>
    `
}

export {AuctionWatchList};
