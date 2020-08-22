class Auction{
    static AUCTIONID_ID_REG = /(([a-zA-Z]+)([0-9]+))\/([0-9]+)/;
    static FULL_ID = 0;
    static AUCTION_ID = 1;
    static CLIENT = 2;
    static AUCTION_NUM = 3;
    static ITEM_ID = 4;

    auctionName;
    auctionId;
    auctionNum;

    constructor(name, num, id) {
        if(typeof(name) === 'string') {
            this.auctionName = name;
            this.auctionId = id;
            this.auctionName = num;
        }else {
            this.copy(name);
        }
    }

    copy(a) {
        this.auctionName = a.auctionName;
        this.auctionNum = a.auctionNum;
        this.auctionId = a.auctionId;
        return this;
    }

    clone() {
        return new Auction(this);
    }

    static parseAuctionID(id) {
        let fullID = Auction.AUCTIONID_ID_REG.exec(id),
            client = '',
            auctionId = '',
            itemId = '',
            auctionNum = '';

        if(fullID) {
            client = fullID[Auction.CLIENT] || '';
            auctionId = fullID[Auction.AUCTION_ID] || '';
            itemId = fullID[Auction.ITEM_ID] || '';
            auctionNum = fullID[Auction.AUCTION_NUM] || '';
        }

        return {
            auctionId:   auctionId,
            auctionNum:  auctionNum,
            auctionName: client,
            itemId:      itemId
        };
    }
}

export {Auction};
