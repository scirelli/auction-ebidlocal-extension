// Called when the url of a tab changes.
// Listen for any changes to the URL of any tab.
const EBIDLOCAL_DOMAIN = 'auction.ebidlocal.com'

chrome.tabs.onUpdated.addListener(function checkForValidUrl(tabId, changeInfo, tab) {
    if(tab.url.indexOf(`${actionHost}/cgi-bin/mmlist.cgi`) > -1 ||
       tab.url.indexOf(`${actionHost}/cgi-bin/mmlist`) > -1) {
        chrome.pageAction.setPopup({
            tabId: tabId,
            popup: 'itemDetails/popup.html'
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
