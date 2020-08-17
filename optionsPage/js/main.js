document.querySelector('button#saveBtn').addEventListener('click', ()=> {
    notifyBidderId(document.querySelector('input#bidderId').value);
});

document.querySelector('button#saveBtn').addEventListener('click', ()=> {
    chrome.storage.sync.set({bidderId: document.querySelector('input#bidderId').value}, ()=> {});
});

document.addEventListener('DOMContentLoaded', ()=>{
    chrome.storage.sync.get(['bidderId'], function(result) {
        document.querySelector('input#bidderId').value = result.bidderId;
    });
});

function notifyBidderId(id) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        let tab = tabs[0];
        chrome.tabs.sendMessage(tab.id, {message: 'save-bidder', bidderId: id}, function handler(response) {
            if(chrome.runtime.lastError) {
                console.error(JSON.stringify(chrome.runtime.lastError));
            }else{
                console.debug(JSON.stringify(response));
            }
        });
    });
}
