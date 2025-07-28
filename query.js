/**
 * TODO: Switch to events
 * TODO: Fix removing a list item. Right now it removes the entire list.
 *
 */

if(!Function.prototype.delay) {
    Function.prototype.delay = function delay(thsPtr, time) {
        let args = Array.prototype.slice.call(arguments, 2);

        time = parseInt(time) || 0;

        return new Promise((resolve)=> {
            setTimeout((...args)=> {
                resolve(this.apply(thsPtr, args));
            }, time, ...args);
        });
    };
}

if(!Function.prototype.defer) {
    Function.prototype.defer = function defer(thsPtr) {
        Array.prototype.splice.call(arguments, 1, 0, 0)
        return this.delay.apply(this, arguments);
    };
}

if(!Function.prototype.chain) {
    Function.prototype.chain = function chain(iter) {
        let itm = iter.next();
        if(!itm.done) {
            return Promise.resolve(this(itm.value)).then(()=> {
                return chain.call(this, iter);
            });
        }
        return Promise.resolve();
    };
}

if(!Array.prototype.chain) {
    Array.prototype.chain = function chain(fnc, i=0) {
        let itm = this[i];
        if(itm) {
            return Promise.resolve(fnc(itm)).then(()=> {
                return chain.call(this, fnc, i+1);
            });
        }
        return Promise.resolve();
    };
}

if(!localStorage.getItem('watchlists')) {
	localStorage.setItem('watchlists', JSON.stringify([
	{
		"name": "Appliances",
		"items": [
			"9barista",
			"coffee",
			"crusher",
			"dryer",
			"espresso",
			"express",
			"fan",
			"fridge",
			"grill",
			"ice",
			"machine",
			"printer",
			"refrigerator",
			"tea",
			"toaster",
			"waffle",
			"washer",
			"washing"
		]
	},
	{
		"name": "Holliday",
		"items": [
			"christmas",
			"decorations",
			"easter",
			"fall",
			"halloween",
			"xmas"
		]
	},
	{
		"name": "Household",
		"items":[
			"bathroom",
			"beach",
			"blanket",
			"camp",
			"camping",
			"cane",
			"climber",
			"cord",
			"crochet",
			"extension",
			"fire",
			"fireplace",
			"garbage",
			"press",
			"science",
			"scuba",
			"stair",
			"stepper",
			"storage",
			"surge",
			"tarp",
			"tent",
			"toilet",
			"trash",
			"umbrella",
			"vacuum"
		] 
	},
	{
		"name": "Kids",
		"items":[
			"bicycle",
			"bike",
			"helmet",
			"lego",
			"legos",
			"paint",
			"pool",
			"skates",
			"toy",
			"toys",
			"train",
			"trains",
			"tricycle"
		] 
	},
	{
		"name": "Modern",
		"items": [
			"bluetooth",
			"calculator",
			"cell",
			"computer",
			"dell",
			"ipad",
			"laptop",
			"phone",
			"speaker",
			"tablet",
			"ups"
		]
	},
	{
		"name": "Music ",
		"items": [
			"cello",
			"keyboard",
			"music",
			"piano",
			"sheet",
			"violin"
		]
	},
	{
		"name": "Retro",
		"items": [
			"1541",
			"2007fp",
			"64",
			"amiga",
			"amiga500",
			"apple",
			"arcade",
			"atari",
			"c64",
			"cassette",
			"commodore",
			"dreamcast",
			"express",
			"famicom",
			"gamecube",
			"genesis",
			"geo",
			"led",
			"lynx",
			"macintosh",
			"monitor",
			"neo",
			"neogeo",
			"nintendo",
			"nintendo64",
			"nomad",
			"playstation",
			"ps3",
			"ps4",
			"ps5",
			"psp",
			"saturn",
			"sega",
			"segacd",
			"sharp",
			"speak",
			"spell",
			"system",
			"tandy",
			"tapes",
			"television",
			"toshiba",
			"turbo",
			"turboexpress",
			"turbografx",
			"tv",
			"vcr",
			"vfd",
			"vhs",
			"vita",
			"x68000",
			"xbox"
		]
	},
	{
		"name": "tools",
		"items": [
			"air",
			"axe",
			"bow",
			"buffer",
			"chainsaw",
			"drill",
			"drillpress",
			"flashlight",
			"gun",
			"hammer",
			"ladder",
			"lath",
			"lathe",
			"lawn",
			"lawnmower",
			"motor",
			"mower",
			"power",
			"router",
			"sander",
			"sanders",
			"saw",
			"shovel",
			"tile",
			"toolbox",
			"trim",
			"trimmer",
			"watering",
			"weld",
			"welder",
			"welding",
			"wagon"
		]
	},
	{
		"name": "Furniture",
		"items": [
			"table"
		]
	}
	], null, null));
}

const styles = `
<style>
	body {
			font-family: Arial, sans-serif;
			padding: 20px;
			background: #f5f5f5;
	}

	details {
			background: white;
			border: 1px solid #ddd;
			border-radius: 8px;
			padding: 16px;
			margin: 20px 0;
	}

	.watchlist-title .title {
		text-transform: capitalize;
		font-size: 1.2em;
	}

	summary {
			display: flex;
			justify-content: space-between;
			align-items: center;
			cursor: pointer;
			list-style: none; /* Hide default arrow */
			padding: 4px;
			border-radius: 4px;
			transition: background-color 0.2s ease;
	}

	summary:hover {
			background-color: #f8f9fa;
	}

	/* Custom arrow */
	summary::before {
			content: '▶';
			margin-right: 8px;
			transition: transform 0.2s ease;
	}

	summary.item-title {
		text-transform: capitalize;
	}
	summary.item-title .count::before {
		content: "(";
	}
	summary.item-title .count::after {
		content: ")";
	}

	details[open] > summary::before {
			transform: rotate(90deg);
	}

	summary > span {
			flex: 1; /* Takes up available space */
	}

	summary > button {
			margin-left: auto; /* Pushes to the right */
			padding: 8px 16px;
			background: #007bff;
			color: white;
			border: none;
			border-radius: 4px;
			cursor: pointer;
			transition: background 0.2s ease;
	}

	summary > button:hover {
			background: #0056b3;
	}

	/* Content area */
	details > p {
			margin: 16px 0 0 0;
			color: #666;
	}

	details.watchlist .watchlist-list {
		background: white;
		border-radius: 8px;
		padding: 20px;
		margin: 0 auto;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}

	details.watchlist .watchlist-list .items-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 8px;
		margin-bottom: 16px;
	}

	details.watchlist .watchlist-list .remove-button {
				display: flex;
				align-items: center;
				gap: 6px;
				padding: 8px 12px;
				background: #f8f9fa;
				border: 1px solid #dee2e6;
				border-radius: 20px;
				cursor: pointer;
				transition: all 0.2s ease;
				font-size: 14px;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
	}

	details.watchlist .watchlist-list .remove-button:hover {
		background: #ffebee;
		border-color: #f44336;
		color: #d32f2f;
	}

	details.watchlist .watchlist-list .remove-icon {
		font-size: 12px;
		font-weight: bold;
		color: #666;
		transition: color 0.2s ease;
	}

	details.watchlist .watchlist-list .remove-button:hover .remove-icon {
		color: #d32f2f;
	}

	details.watchlist .watchlist-list .add-section {
		display: flex;
		gap: 0;
		align-items: center;
		margin-top: 16px;
		border: 2px solid #4caf50;
		border-radius: 25px;
		background: #f1f8e9;
		overflow: hidden;
	}

	details.watchlist .watchlist-list .add-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 41px;
		background: #4caf50;
		color: white;
		border: none;
		cursor: pointer;
		transition: background 0.2s ease;
		font-size: 16px;
	}

	details.watchlist .watchlist-list .add-button:hover {
		background: #45a049;
	}

	details.watchlist .watchlist-list .add-input {
		flex: 1;
		padding: 10px 16px;
		border: none;
		background: transparent;
		outline: none;
		font-size: 14px;
	}

	details.watchlist .watchlist-list .add-input::placeholder {
		color: #81c784;
	}
</style>
`;

const watchlistTempl = `
<template id="watchlist-template">
	<details class="watchlist">
		<summary class="watchlist-title">
			<span class="title"></span>
		</summary>
		<div class="watchlist-list">
			<h2>List Manager</h2>
			<div class="items-grid"></div>

			<div class="add-section">
				<button class="add-button" title="Add item">+</button>
				<input type="text" class="add-input" name="newListItem" placeholder="Add item"/>
			</div>
		</div>
	</details>
</template>
`;

const deleteButtonTemplate = `
<template id="delete-btn-template">
	<button class="remove-button" title="Remove">
			<span class="remove-icon">✕</span>
			<span class="text"></span>
	</button>
</template>
`;

const watchlistItemTempl = `
<template id="watchlist-item-template">
	<details class="watchlist-item">
		<summary class="item-title">
			<span><span class="title"></span> <span class="count"></span></span>
			<button class="remove-btn">Remove</button>
		</summary>
	</details>
</template>
`;


(()=> {
	function Watchlist(name, items=[]) {
		if(name.name && Array.isArray(name.items)){
			items = name.items.slice(0);
			name = name.name;
		}
		if(typeof(name) !== 'string') throw new Error('Param \'name\' must be a string or another WatchLlist');
		if(!Array.isArray(items)) throw new Error('Param \'items\' must be an array.');

		this.name = name || 'No name';
		this.items = items.filter(item=>typeof(item) === 'string');


		this.toString = function toString() {
			return this.items.toString();
		};
		this.toJSON = function toJSON() {
			return JSON.stringify({name: this.name, items: this.items});
		};
		this.serialize = this.toJSON;
		this.hasItem = function hasItem(item) {
			return this.items.includes(item);
		};
		this.addItem = function addItem(item) {
			if(this.items.includes(item)) return;
			this.items.push(item);
			return this;
		};
		this.removeItem = function removeItem(item) {
			let i = this.items.indexOf(item);
			if(i>=0) this.items.splice(i, 1);
			return this;
		}
	}

	function ImmutableWatchlist(name, items) {
		_name = name || 'No name';
		if(!Array.isArray(items)) {
			throw new Error('items must be an array.');
		}
		_items = items;

		this.toString = function toString() {
			return _items.toString();
		};
		this.toJSON = function toJSON() {
			return JSON.stringify({name: _name, items: _items});
		};
		this.serialize = this.toJSON;

		Object.defineProperty(this, "name", {
			get: function() { return _name; },
		});
		Object.defineProperty(this, "items", {
			get: function() { return _items.slice(); },
		});
	}

	function searchItem(item) {
		let url = new URL('https://auction.ebidlocal.com/Public/GlobalSearch/GetGlobalSearchResults');
		url.search = new URLSearchParams({
			pageNumber: 1,
			pagesize:   10000,
			filter:     'Current',
			sortBy:     'enddate_asc',
			search:     item,
		});

		return fetch(url, {
			"headers": {
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin",
				"x-requested-with": "XMLHttpRequest"
			},
			"method": "GET",
			"mode": "cors",
			"credentials": "include"
		}).then(r => r.text())
		.then(sText => {
			let parser = new DOMParser();
			return parser.parseFromString(sText, "text/html");
		})
		.then(doc => doc.body.querySelector('div.search-listitem'))
	}

	function getTemplateContentElem(elemId) {
		let template = null;
		if(typeof(elemId) === 'string'){
			template = document.getElementById(elemId);
		}else{
			template = elemId;
		}
		return template.content.cloneNode(true).firstElementChild;
	}

	function appendStyles(elem) {
		elem.insertAdjacentHTML('beforeend', styles);
	}

	function appendTemplates(elem) {
		elem.insertAdjacentHTML('beforeend', watchlistTempl);
		elem.insertAdjacentHTML('beforeend', watchlistItemTempl);
		elem.insertAdjacentHTML('beforeend', deleteButtonTemplate);
	}

	function clearContent() {
		Array.prototype.slice.apply(document.body.querySelectorAll('.container')).pop().innerHTML = '';
	}

	function appendWatchlist(wl) {
		const watchlistElm = getTemplateContentElem('watchlist-template'),
			watchlistTitleElmSpan = watchlistElm.querySelector('details.watchlist > .watchlist-title span.title');

		const wlListContainer = watchlistElm.querySelector('.watchlist-list'),
			itemsGrid = wlListContainer.querySelector('.items-grid'),
			addButton = wlListContainer.querySelector('.add-section .add-button'),
			inputElm = wlListContainer.querySelector('.add-section .add-input');

		watchlistElm._watchlist = new Watchlist(wl);

		addButton.addEventListener('click', e => {
			e.preventDefault();
			addItem(inputElm.value, itemsGrid, watchlistElm);
			inputElm.value = '';
		});
		inputElm.addEventListener('keypress', e => {
			 if (event.key === 'Enter') {
				 addItem(inputElm.value, itemsGrid, watchlistElm);
				 inputElm.value = '';
			 }
		});

		watchlistTitleElmSpan.innerText = wl.name;
		Array.prototype.slice.apply(document.body.querySelectorAll('.container')).pop().appendChild(watchlistElm);

		return wl.items.chain(item => {
			return addItem(item, itemsGrid, watchlistElm);
		});
	}

	function saveItem(item, watchlist) {
		watchlist = new Watchlist(watchlist);
		if(watchlist.hasItem(item)) return;
		watchlist.addItem(item);

		let watchlists = JSON.parse(localStorage.getItem('watchlists') || '[]');
		watchlists = watchlists.filter(wl=>wl.name !== watchlist.name);
		watchlists.push({name: watchlist.name, items: watchlist.items});
		localStorage.setItem('watchlists', JSON.stringify(watchlists, null, null));
	}

	function addItem(item, itemsGrid, watchlistElm) {
		if(!item) return;
		saveItem(item, watchlistElm._watchlist);
		addItemToGrid(itemsGrid, item);
		return searchItem(item).then(searchResultsElm => {
			if(searchResultsElm.querySelectorAll('.bg-white.border.mt-2.px-1.py-3.d-flex.flex-wrap').length) {
				watchlistElm.appendChild(createWlItemElm(searchResultsElm, item, watchlistElm));
			}
		});
	}

	function createWlItemElm(searchResultsElm, item, watchlistElm) {
		const cnt = searchResultsElm.querySelectorAll('.bg-white.border.mt-2.px-1.py-3.d-flex.flex-wrap').length;
		const detailsElm = getTemplateContentElem('watchlist-item-template'),
			summaryElm  = detailsElm.querySelector('summary.item-title'),
			summarySpan =  summaryElm.querySelector('span.title'),
			summaryCnt  =  summaryElm.querySelector('span.count'),
			summaryRmBtn = summaryElm.querySelector('button.remove-btn');

		summarySpan.innerText = `${item}`
		summaryCnt.innerText = `${cnt}`;
		summaryRmBtn.addEventListener('click', evnt => {
			watchlistElm.remove();
		});
		detailsElm.appendChild(searchResultsElm);
		return detailsElm;
	}

	function createWlItemMgrItm(item) {
		const rmItemBtn = getTemplateContentElem('delete-btn-template'),
			text = rmItemBtn.querySelector('.text');
			text.innerText = item;

		rmItemBtn.addEventListener('click', e => {
			e.preventDefault();
			console.log('Remove clicked');
			removeItemBtn(rmItemBtn);
		});

		return rmItemBtn;
	}

	function removeItemBtn(button) {
		button.style.transform = 'scale(0.8)';
		button.style.opacity = '0';
		setTimeout(() => {
				button.remove();
		}, 200);
	}

	function addItemToGrid(grid, text) {
	 if (text === '') return;
	 
	 const newButton = createWlItemMgrItm(text);
	 
	 // Add with animation
	 newButton.style.opacity = '0';
	 newButton.style.transform = 'scale(0.8)';
	 grid.appendChild(newButton);
	 
	 setTimeout(() => {
		 newButton.style.transition = 'all 0.2s ease';
		 newButton.style.opacity = '1';
		 newButton.style.transform = 'scale(1)';
	 }, 10);
	}

	clearContent();
	appendTemplates(document.body);
	appendStyles(document.head);
	JSON.parse(localStorage.getItem('watchlists')).chain(l => {
		return appendWatchlist(l);
	});
})();
