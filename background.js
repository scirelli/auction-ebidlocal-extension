const ACTION_HOST = 'auction.ebidlocal.com';

// Called when the url of a tab changes.
// Listen for any changes to the URL of any tab.
// chrome.tabs.onUpdated.addListener(function checkForValidUrl(tabId, changeInfo, tab) {
//     if(tab.url.indexOf(`${ACTION_HOST}/cgi-bin/mmlist.cgi`) > -1 ||
//        tab.url.indexOf(`${ACTION_HOST}/cgi-bin/mmlist`) > -1) {
//         chrome.pageAction.setPopup({
//             tabId: tabId,
//             popup: 'extension/watchlist/popup.html'
//         });
//         chrome.pageAction.show(tabId);
//     }
// });

chrome.webNavigation.onCompleted.addListener(function(details) {
    chrome.pageAction.setPopup({
        tabId: details.tabId,
        popup: 'popup/watchlist/popup.html'
    });
    chrome.pageAction.show(details.tabId);
}, {url: [{hostContains: ACTION_HOST, pathPrefix: '/cgi-bin/mmlist.cgi'}]});

chrome.runtime.onMessage.addListener(function(oResponse, sender, sendResponse) {
    console.log(oResponse);
    //chrome.tabs.executeScript({file: 'contentScripts/watchlist/content.js'});
    //chrome.storage.local.set({variable: variableInformation});
    return true;
});
//chrome.runtime.sendMessage(string extensionId, any message, object options, function responseCallback)

chrome.runtime.onSuspend.addListener(function() {
    //Do some last minute saving.
    //chrome.storage.local.set({variable: variableInformation});
    console.log('Unloading.');
    chrome.browserAction.setBadgeText({text: ''});
});

/*
chrome.cookies.onChanged.addListener(function(info) {
  console.log("onChanged" + JSON.stringify(info));
});
*/
