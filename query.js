#!/usr/bin/env node
/*
	<div class="container">
			<div class="align-items-center  d-flex flex-wrap justify-content-md-between mb-2">
					Menu
			</div>
			<div id="divSearchResult">
					<div class="wrapper-main mb-3">
							<div class="current-auction mb-3">
									<div class="search-listitem mb-2">
											Result Rows
											<div class="bg-white border mt-2 px-1 py-3 d-flex  flex-wrap">Row</div>
									</div>
							</div>
					</div>
			</div>
	</div>

	<details>
		<summary>Section title</summary>
	</details>
*/
watchlists = [
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
			"welding"
		]
	}
];

(()=> {
	function Watchlist(name, items=[]) {
		if(!Array.isArray(items)) throw new Error('items must be an array.');
		this.name = name || 'No name';
		this.items = items;

		this.toString = function toString() {
			return this.items.toString();
		};
		this.toJSON = function toJSON() {
			return JSON.stringify({name: this.name, items: this.items});
		};
		this.serialize = this.toJSON;
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

	function appendWatchlist(wl){
		const watchlistElm = document.createElement('details'),
			watchlistTitleElm = document.createElement('summary');

		watchlistTitleElm.innerText = wl.name;
		watchlistTitleElm.classList.add('watchlist-title');
		watchlistElm.appendChild(summaryElm);
		watchlistElm.classList.add('watchlist');

		searchItem('chair').then(listItemElm => {
			const detailsElm = document.createElement('details'),
				summaryElm = document.createElement('summary');

			summaryElm.innerText = 'Chair';
			detailsElm.appendChild(summaryElm);
			detailsElm.appendChild(listItemElm);

			document.body.querySelector('.current-auction').innerHTML = '';
			document.body.querySelector('.current-auction').appendChild(detailsElm)
		});
	}
})();
