/*global chrome*/
const ACTION_HOST = 'auction.ebidlocal.com';

// Called when the url of a tab changes.
// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(function checkForValidUrl(tabId, changeInfo, tab) {
    if(tab.url.indexOf(`${ACTION_HOST}/cgi-bin/mmlist.cgi`) > -1 ||
       tab.url.indexOf(`${ACTION_HOST}/cgi-bin/mmlist`) > -1) {
        chrome.pageAction.setPopup({
            tabId: tabId,
            popup: 'extension/watchlist/popup.html'
        });
        chrome.pageAction.show(tabId);
    }
});

chrome.runtime.onMessage.addListener(function(oResponse, sender, sendResponse) {
    console.log(oResponse);

    return true;
});

/*
chrome.cookies.onChanged.addListener(function(info) {
  console.log("onChanged" + JSON.stringify(info));
});
*/
