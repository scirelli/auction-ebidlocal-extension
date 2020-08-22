// const script = document.createElement('script');
// const head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;

// script.setAttribute('type', 'module');
// script.setAttribute('src', chrome.extension.getURL('contentScripts/watchlist/js/main.js'));
// head.insertAdjacentElement('beforeend', script);

(async () => {
    const src = chrome.runtime.getURL('contentScripts/watchlist/js/main.js');
    await import(src); // returns the module if you want to call functions.
})();
