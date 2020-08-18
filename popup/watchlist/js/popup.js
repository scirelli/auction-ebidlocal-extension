
// chrome.storage.sync.set({
//    favoriteColor: color,
//    likesColor: likesColor
//  }, function() {
//    // Update status to let user know options were saved.
//    var status = document.getElementById('status');
//    status.textContent = 'Options saved.';
//    setTimeout(function() {
//      status.textContent = '';
//    }, 750);
//  });
// chrome.storage.sync.get({
//     favoriteColor: 'red',
//     likesColor: true
// }, function(items) {
//     document.getElementById('color').value = items.favoriteColor;
//     document.getElementById('like').checked = items.likesColor;
// });
//
//document.addEventListener('DOMContentLoaded', restore_options);
//document.getElementById('save').addEventListener('click', save_options);
//
import {Auction} from '/contentScripts/watchlist/js/components/Auction.js';

document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelector('#go-to-options').addEventListener('click', ()=> {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('options.html'));
        }
    });

    document.querySelector('button#open-watch-list-button').addEventListener('click', ()=> {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            let tab = tabs[0];
            chrome.tabs.sendMessage(tab.id, {message: 'open-watch-list'}, function handler(response) {
                if(chrome.runtime.lastError) {
                    console.error(JSON.stringify(chrome.runtime.lastError));
                }else{
                    console.debug(JSON.stringify(response));
                }
            });
        });
    });

    document.querySelector('button#add-current-page-url-button').addEventListener('click', ()=> {
        document.body.querySelector('.lds-spinner-container').classList.toggle('hidden');
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            let currentTab = tabs[0],
                url = Auction.parseAuctionID(currentTab.url);
            if(url.itemId) {
                sendMessageToAll({message: 'add-url', url: currentTab.url});
            }else if(currentTab.url.indexOf('/category/ALL') >= 0) {
                sendMessageToAll({message: 'add-all', url: currentTab.url});
            }else {
                let label = document.body.querySelector('form#watch-list-form label[for="addCurrentPageURL"]');
                if(label) {
                    label.classList.add('error');
                    label.textContent = 'Not able to add this page.';
                    label.classList.remove('hidden');
                    setTimeout(()=> {
                        label.classList.remove('error');
                        label.textContent = '';
                        label.classList.add('hidden');
                    }, 3000);
                }
            }
        });

        function sendMessageToAll(message) {
            chrome.tabs.query({url: '*://auction.ebidlocal.com/cgi-bin/mmlist.cgi*'}, function(tabs) {
                tabs.forEach(tab=> {
                    chrome.tabs.sendMessage(tab.id, message, function handler(response) {
                        if(chrome.runtime.lastError) {
                            console.error(JSON.stringify(chrome.runtime.lastError));
                        } else if(response.message) {
                            console.log(response.message);
                        }
                    });
                    document.body.querySelector('.lds-spinner-container').classList.toggle('hidden');
                });
            });
        }
    });
});
