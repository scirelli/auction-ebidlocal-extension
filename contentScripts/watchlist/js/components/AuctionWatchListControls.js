class AuctionWatchListControls extends HTMLElement{
    static TAG_NAME = 'auction-watch-list-controls';

    constructor() {
        super();
        let div = document.createElement('div'),
            template;

        div.innerHTML = AuctionWatchListControls.template;
        template = div.querySelector('template');

        this.appendChild(template.content.cloneNode(true));
        this.addEventListener('add-item', (evnt)=>{
            this.__addItem([].concat(evnt.detail.items || []));
        });
    }

    __addItem(items) {
        this.querySelector('textarea').value += '\n' + items.filter(Boolean).join('\n');
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
        </style>
    `

    static template = `
        <template id="auction-watch-list-controls-template">
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
