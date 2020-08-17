class AuctionItem{
    itemId;
    itemIcon;
    itemDescription;
    itemNumOfBids;
    itemHighBidder;
    itemCurrentAmount;
    itemNextBidRequired;
    itemYourBid;
    itemYourMaxBid;

    constructor(item) {
        if(typeof(item) === 'string') {
            this.itemId = item;
        }else{
            this.copy(item);
        }
    }

    copy(itm) {
        this.itemId = itm.itemId;
        this.itemIcon = itm.itemIcon;
        this.itemDescription = itm.itemDescription;
        this.itemNumOfBids = itm.itemNumOfBids;
        this.itemHighBidder = itm.itemHighBidder;
        this.itemCurrentAmount = itm.itemCurrentAmount;
        this.itemNextBidRequired = itm.itemNextBidRequired;
        this.itemYourBid = itm.itemYourBid;
        this.itemYourMaxBid = itm.itemYourMaxBid;

        return this;
    }

    clone() {
        return new AuctionItem(this);
    }
}

export {AuctionItem};
