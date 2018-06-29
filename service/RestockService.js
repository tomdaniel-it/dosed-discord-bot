const RestockScraper = require('../network/RestockScraper.js');
const RestockDao = require('../database/restock/RestockDao.js');

// Array of restock items
let displayedRestocks = [];

module.exports = class RestockService {
    
    constructor() {
        this.restockScraper = new RestockScraper();
        this.restockDao = new RestockDao();
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
        if (displayedRestocks.length === 0) return this.getRestocksSince(botStartTime, region, callback);
        return this.getRestocksSince(displayedRestocks.reduce((max, obj) => obj.timestamp > max ? obj.timestamp : max, displayedRestocks[0].timestamp), region, callback);
    }
    
    // Add restocks to displayedRestocks array
    addDisplayedRestocks(restocks) {
        displayedRestocks = displayedRestocks.concat(restocks);
    }

    // Saves a messageid to the database
    saveMessageId(channelId, id, timestamp) {
        this.restockDao.addMessageId(channelId, id, timestamp);
    }

    getMessageIds(channelId, callback) {
        return this.restockDao.getMessageIds(channelId, callback);
    }

    removeMessageIds(channelId, ids) {
        this.restockDao.removeMessageIds(channelId, ids);
    }
};
