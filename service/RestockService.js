const RestockScraper = require('../network/RestockScraper.js');

module.exports = class RestockService {
    
    constructor() {
        // Array of restock items
        this.displayedRestocks = [];
        this.restockScraper = new RestockScraper();
    }
    
    // Returns all restock items
    // Regions: 'eu', 'us', 'jpn'
    // callback will have 3 parameters: error, restocks and region.
    getRestocksSince(timestamp, region, callback) { 
        this.restockScraper.get(region, timestamp, callback);
    }
    
    // Returns all new restock items which haven't been displayed yet
    // botStartTime:Date => Time that the bot was started
    // Regions: 'eu', 'us', 'jpn'
    // callback will have 3 parameters: error, restocks and region.
    getNewRestocks(botStartTime, region, callback) {
        if (this.displayedRestocks.length === 0) return this.getRestocksSince(botStartTime, region, callback);
        return this.getRestocksSince(this.displayedRestocks.reduce((max, obj) => obj.timestamp > max ? obj.timestamp : max, this.displayedRestocks[0].timestamp), region, callback);
    }
    
    // Add restocks to displayedRestocks array
    addDisplayedRestocks(restocks) {
        this.displayedRestocks = this.displayedRestocks.concat(restocks);
    }
};
