class AuctionWatchListControls extends HTMLElement{
    static TAG_NAME = 'auction-watch-list-controls';
    static REFRESH_RATE = 10;

    itemQueue = [];

    constructor() {
        super();
        let div = document.createElement('div'),
            template;

        div.innerHTML = AuctionWatchListControls.template;
        template = div.querySelector('template');

        this.appendChild(template.content.cloneNode(true));

        this.__attachEventListeners();
    }

    static get observedAttributes() { return ['data-watch-list-id']; }

    attributeChangedCallback(name/*, oldValue, newValue*/) {
        switch(name) {
            case 'data-watch-list-id':
                break;
        }
    }

    getLinkedWatchListElement() {
        let id = this.getAttribute('data-watch-list-id'),
            auctionWatchList = document.body.querySelector(`auction-watch-list#${id}`);

        if(!auctionWatchList) throw new Error('Must link a watch list to this watch list controls.');

        return auctionWatchList;
    }

    __onAddItems(evnt) {
        this.__addItemUrlsToTextarea(
            this.__addItems(evnt.detail.items)
        );
    }

    __addItems(items) {
        items = this.__filterItemList(items || []);

        this.__addAllToWatchList.defer(this, items).then(()=> {
            this.dispatchEvent(new CustomEvent('all-items-added', {detail: {items: items}}));
        });

        return items;
    }

    __filterItemList(items) {
        return this.__filterAlreadyAddedItems(items.filter((item)=> {
            try{
                return new URL(item);
            }catch(e) {
                return false;
            }
        })).filter(Boolean);
    }

    __filterAlreadyAddedItems(items) {
        let auctionWatchList = this.getLinkedWatchListElement();
        return [].concat(items)
            .filter((item)=> {
                return !auctionWatchList.containsItem(item);
            });
    }

    __addItemUrlsToTextarea(items) {
        this.querySelector('textarea').value += '\n' + items.join('\n');
        return this;
    }

    __attachEventListeners() {
        this.addEventListener('add-item', (evnt)=>{
            this.__onAddItems(evnt);
        });

        this.querySelector('form.refreshRateForm').addEventListener('submit', (evt)=> {
            evt.preventDefault();
            evt.stopPropagation();
            let rate = parseInt(evt.currentTarget.querySelector('input[name="refreshRate"]').value) || AuctionWatchListControls.REFRESH_RATE;

            this.getLinkedWatchListElement().setAttribute('data-refresh-rate', rate);
        });

        document.body.querySelector('form.addItemform').addEventListener('submit', (evt)=> {
            evt.preventDefault();
            evt.stopPropagation();
            let items = evt.currentTarget.querySelector('textarea[name="addItem"]').value;

            this.__addItems(items.split(/[\t\n \r]/));
        });

        document.body.querySelector('form.addItemform input[type="button"]').addEventListener('click', (evt)=> {
            evt.preventDefault();
            evt.stopPropagation();
            this.querySelector('form.addItemform textarea[name="addItem"]').value = '';
        });
    }

    __addAllToWatchList(items) {
        let self = this;
        return items.chain((url)=> {
            return ((url)=>{
                self.getLinkedWatchListElement().dispatchEvent(new CustomEvent('add-item', {detail: {src: url}}));
            }).delay(self, 500, url);
        });
    }

    static __register(doc) {
        customElements.define(AuctionWatchListControls.TAG_NAME, AuctionWatchListControls);
        doc.insertAdjacentHTML('beforeend', AuctionWatchListControls.styles);
    }

    static styles = `
        <style>
            form.addItemform label, form.addItemform input {
                vertical-align: top;
            }
            .not-high-bidder {
                color: red
            }

            form.addItemform > div {
                display: inline-block;
                vertical-align: top;
            }
            form.addItemform > div > input {
                display: block;
            }
            .auction-watch-list-controls-container {
                padding: 4px;
            }
            textarea {
                width: 350px;
            }
            section.add-item-section {
                margin-bottom: 4px;
            }

            #logo-link a{
                visibility: initial;
                display: block;
                float: right;
            }

            #logo-link img{
                display: inline-block;
            }
        </style>
    `

    static template = `
        <template id="auction-watch-list-controls-template">
            
            <div id="logo-link">
                <a href="https://www.ebidlocal.com/">
                    <img src="/images/logo1.png" alt="Ebid Local Online Auctions"/>
                </a>
            </div>
            <div class="auction-watch-list-controls-container">
                <section class="add-item-section">
                    <form class="addItemform" action="#">
                        <fieldset>
                            <label for="addItem">Add Item</label>
                            <textarea name="addItem"></textarea>
                            <div>
                                <input type="submit" value="Add"/>
                                <input type="button" value="Clear"/>
                            </div>
                        </fieldset>
                    </form>
                </section>
                <section class="refresh-rate-section">
                    <form class="refreshRateForm" action="#">
                        <fieldset>
                            <label for="refreshRate">Refresh rate:</label>
                            <input type="number" min="1" max="10" name="refreshRate" value="10"/>
                            <input type="submit" value="Set"/>
                        </fieldset>
                    </form>
                </section>
            </div>
        </template>
    `;
}

export {AuctionWatchListControls};
