var utils = (()=> {
    function buildItemList(doc) {
        let viewFormElem = doc.querySelector('form[name="viewform"]'),
            baseURL = viewFormElem.action,
            auction = (viewFormElem.querySelector('input[name="auction"]') || {}).value,
            pageCount = parseInt((viewFormElem.querySelector('input[name="pages"]') || {}).value || '');

        return Array.prototype.filter.call(viewFormElem.querySelectorAll('input'), (e)=> {
            return parseInt(e.name.substr(1)) <= parseInt(pageCount);
        }).filter(Boolean).reduce((acc, e)=> {
            return acc.concat(e.value.split('/'));
        }, []).map((v)=> {
            return baseURL + '?' + auction + '/' + v;
        });
    }

    function pageItems() {
        return Array.prototype.reduce.call(document.querySelectorAll('.morepics a'), (acc, e)=>{ acc.push(e.href); return acc;}, []).join('\n');
    }

    return {
        buildItemList: buildItemList,
        pageItems:     pageItems
    };
})();

if(module && module.exports) module.exports = utils;
