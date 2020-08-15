
class AuctionWatchListControls extends HTMLElement{
    constructor() {
        super();
        let frag = document.createDocumentFragment(),
            div = frag.appendChild(document.createElement('div')),
            template = document.getElementById('auction-watch-list-controls-template'),
            templateContent = template.content;

        this.appendChild(templateContent.cloneNode(true));
        this.addEventListener('add-item', this._onAddItem.bind(this));
    }
    static styles = `
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
    `;
    static template = `
        <template id="auction-watch-list-controls-template">
            <div>
                <section class="add-item-section">
                    <form id="addItemform" action="#">
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
                <section class="add-item-section">
                    <form id="refreshRateForm" action="#">
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

module.exports = AuctionWatchListControls;
