import {AuctionItemRow} from './AuctionItemRow.js';

class AuctionWatchList extends HTMLElement{
    static TAG_NAME = 'auction-watch-list';
    static DEFAULT_REFRESH_RATE_MS = 10 * 1000;

    static get observedAttributes() { return ['data-refresh-rate']; }

    refreshIntervalId = null;
    refreshRate = AuctionItemRow.DEFAULT_REFRESH_RATE_MS;
    running = false;

    constructor() {
        super();
        let template = document.getElementById('auction-watch-list-template'),
            templateContent = template.content;

        this.appendChild(templateContent.cloneNode(true));
        this._registerEventListeners();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch(name) {
            case 'data-refresh-rate':
                this.refreshRate =  (parseInt(newValue) || 0) * 1000 || AuctionWatchList.DEFAULT_REFRESH_RATE_MS;
                this._startRefresh();
                break;
        }
    }

    _registerEventListeners() {
        this.addEventListener('add-item', this._onAddItem.bind(this));
        this.addEventListener('start-refresh', this._onStartRefresh.bind(this));
        this.addEventListener('stop-refresh', this._stopRefresh.bind(this));
        this.addEventListener('sort', this._onSort.bind(this));
        this._addDragListeners();
    }

    _startRefresh() {
        if(this.running) return;
        this.running = true;
        return this._commenceRefresh();
    }
    _commenceRefresh() {
        if(!this.running) return;
        this.refreshIntervalId = setTimeout(()=> {
            this._refresh().then(this._commenceRefresh.bind(this));
        }, this.refreshRate);
    }
    _stopRefresh() {
        //Does nothing. Would need to break the promise chain.
        clearTimeout(this.refreshIntervalId);
        this.refreshIntervalId = null;
        this.running = false;
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

                this._addRowEventListeners(row);

                this.querySelector('table > tbody').appendChild(row);
            }
        }catch(e) {
            console.error(e);
        }
    }

    containsItem(url) {
        return !!this.getRowByURL(url);
    }

    getRowByURL(url) {
        let id = AuctionItemRow.getAuctionIdFromURL(url).fullId;

        return this.querySelector(`table > tbody > tr[id="${id}"]`);
    }

    _createRow(oData) {
        let newRow = document.createElement('tr', {is: AuctionItemRow.TAG_NAME});
        newRow.__auctionItemRow = new AuctionItemRow(newRow);
        newRow.setAttribute('src', oData.sourceURL);
        newRow.classList.add('DataRow');
        newRow.setAttribute('id', oData.data.fullId);
        newRow.setAttribute('draggable', 'true');

        newRow.addEventListener('data-change', (e)=> {
            let changes = AuctionItemRow.whatDataChanged(e.detail.oldData, e.detail.data);

            if(!e.detail.oldData) return;
            if(Object.keys(changes).length === 1 && changes['itemTimeRemaining']) return;

            newRow.classList.add('changed');
            newRow.addEventListener('mouseenter', function onHover() {
                newRow.classList.remove('changed');
                newRow.removeEventListener('hover', onHover);
            });
        });
        newRow.addEventListener('update-start', ()=> {
            //newRow.classList.add('updating-animated');
            newRow.classList.add('updating');
        });
        // newRow.addEventListener('animationend', (e)=> {
        //     e.preventDefault();
        //     newRow.classList.remove('updating-animated');
        // });
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
                    row:     newRow,
                    data:    e.detail.data,
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

    _sort(field, direction) {
        this._stopRefresh();
        let rows = Array.prototype.slice.call(this.querySelectorAll('table > tbody > tr') || [], 0);
        console.log(field, direction, rows.length);
        this._startRefresh();
    }

    _onSort(e) {
        this._sort(e.detail.sort.field, e.detail.sort.direction);
    }

    _onStartRefresh() {
        this._startRefresh();
    }

    _onStopRefresh() {
        this._stopRefresh();
    }

    _onAddItem(evt) {
        this._addItem(evt.detail.src);
    }

    _addRowEventListeners(row) {
        this._addHideRowOnAddListener(row);

        return this;
    }

    _addHideRowOnAddListener(row) {
        row.classList.add('invisible');
        row.addEventListener('update-end', function show() {
            row.classList.remove('invisible');
            row.removeEventListener('update-end', show);
        });

        return this;
    }

    _addDragListeners() {
        let dragged = null;

        this.addEventListener('dragstart', function(event) {
            // store a ref. on the dragged elem
            dragged = event.target;
            // make it half transparent
            event.target.style.opacity = .5;
        }, false);

        this.addEventListener('dragend', function(event) {
            // reset the transparency
            event.target.style.opacity = '';
        }, false);

        this.addEventListener('drag', ()=> {}, false);

        this.addEventListener('dragover', (event)=> {
            // prevent default to allow drop
            event.preventDefault();
        }, false);

        this.addEventListener('dragenter', function(event) {
            // highlight potential drop target when the draggable element enters it
            if(event.target === dragged) return;
            if(event.target.parentNode === dragged) return;

            if(event.target.tagName.toLowerCase() === 'tr') {
                event.target.style.background = 'gray';
            }else if(event.target.parentNode.tagName.toLowerCase() === 'tr') {
                event.target.parentNode.style.background = 'gray';
            }
        }, false);
        this.addEventListener('dragleave', function(event) {
            // reset background of potential drop target when the draggable element leaves it
            if(event.target === dragged) return;
            if(event.target.parentNode === dragged) return;
            if (event.target.tagName.toLowerCase() === 'tr') {
                event.target.style.background = '';
            }else if(event.target.parentNode.tagName.toLowerCase() === 'tr') {
                event.target.parentNode.style.background = '';
            }
        }, false);

        this.addEventListener('drop', function(event) {
            // prevent default action (open as link for some elements)
            event.preventDefault();
            if(event.target === dragged) return;
            if(event.target.parentNode === dragged) return;

            // move dragged elem to the selected drop target
            if (event.target.tagName.toLowerCase() === 'tr') {
                event.target.style.background = '';
                dragged.parentNode.removeChild(dragged);
                event.target.insertAdjacentElement('afterend', dragged );
                dragged = null;
            }else if(event.target.parentNode.tagName.toLowerCase() === 'tr') {
                event.target.parentNode.style.background = '';
                dragged.parentNode.removeChild(dragged);
                event.target.parentNode.insertAdjacentElement('afterend', dragged );
                dragged = null;
            }
        }, false);
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
                        <th align="center"><font color="#ffffff"><strong>Time <br> Remaining</strong></font></th>
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
            .invisible {
                visibility: hidden; 
            }
        </style>
    `
}

export {AuctionWatchList};
