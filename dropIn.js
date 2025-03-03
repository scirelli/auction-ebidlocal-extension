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

	function appendStyles() {
		const s = document.createElement('style')
		s.innerText = `
			.watchlist {
			}
			.watchlist > details {
				margin-left: 25px;
			}
			.watchlist-title {
				font-weight: bold;
				font-size: 1.5vw;
			}
			.item-title {
				text-transform: capitalize;
				font-weight: bold;
			}
			.search-listitem.mb-2 {
				margin-left: 25px;
			}
		`;
		document.head.appendChild(s);
	}

	function clearContent() {
		Array.prototype.slice.apply(document.body.querySelectorAll('.container')).pop().innerHTML = '';
	}

	function appendWatchlist(wl) {
		const watchlistElm = document.createElement('details'),
			watchlistTitleElm = document.createElement('summary');

		watchlistTitleElm.innerText = wl.name;
		watchlistTitleElm.classList.add('watchlist-title');
		watchlistElm.appendChild(watchlistTitleElm);
		watchlistElm.classList.add('watchlist');
		Array.prototype.slice.apply(document.body.querySelectorAll('.container')).pop().appendChild(watchlistElm);

		return wl.items.chain(item => {
			return searchItem(item).then(listItemElm => {
				const detailsElm = document.createElement('details'),
					summaryElm = document.createElement('summary');

				summaryElm.innerText = item;
				summaryElm.classList.add('item-title');
				detailsElm.appendChild(summaryElm);
				detailsElm.appendChild(listItemElm);
				watchlistElm.appendChild(detailsElm);
			});
		});
	}

	clearContent();
	appendStyles();
	watchlists.chain(l => {
		return appendWatchlist(l);
	});

})();
