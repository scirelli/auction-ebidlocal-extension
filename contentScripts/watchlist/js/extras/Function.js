if(!Function.prototype.delay) {
    Function.prototype.delay = function delay(time) {
        let args = Array.prototype.slice.call(arguments, 1);

        time = parseInt(time) || 0;

        return new Promise((resolve)=> {
            setTimeout((...args)=> {
                resolve(this.apply(this, args));
            }, time, ...args);
        });
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
