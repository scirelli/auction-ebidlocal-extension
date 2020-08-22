document.querySelector('button#saveBtn').addEventListener('click', ()=> {
    let bidderId = document.querySelector('input#bidderId').value || '';

    chrome.storage.sync.set({bidderId: bidderId}, (e)=> {
        console.log('Set new bidder id.');
        notifyBidderId(bidderId);
        document.querySelector('label.success').classList.remove('hidden');
        setTimeout(()=> {
            document.querySelector('label.success').classList.add('hidden');
        }, 2000);
    });
});

document.addEventListener('DOMContentLoaded', ()=>{
    chrome.storage.sync.get(['bidderId'], function(result) {
        document.querySelector('input#bidderId').value = result.bidderId || '';
    });
});

function notifyBidderId(id) {
    chrome.tabs.query({url: '*://auction.ebidlocal.com/cgi-bin/mmlist.cgi*'}, function(tabs) {
        tabs.forEach(tab=> {
            chrome.tabs.sendMessage(tab.id, {message: 'save-bidder', bidderId: id}, function handler(response) {
                if(chrome.runtime.lastError) {
                    console.error(JSON.stringify(chrome.runtime.lastError));
                }else{
                    console.debug(JSON.stringify(response));
                }
            });
        });
    });
}
