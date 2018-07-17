const RestockScraper = require('../network/RestockScraper.js');
const RestockDao = require('../database/restock/RestockDao.js');
const logService = require('../service/LogService.js');

// Array of restock items
let displayedRestocks = [];

module.exports = class RestockService {
    
    constructor() {
        try {
            this.restockScraper = new RestockScraper();
            this.restockDao = new RestockDao();
        } catch (err) {
            logService.logErrorObject(err);
        }
    }
    
    // Returns all restock items
    // Regions: 'eu', 'us', 'jpn'
    // callback will have 3 parameters: error, restocks and region.
    getRestocksSince(timestamp, region, callback) {
        try {
            if (callback === undefined || callback === null) callback = function() {};
            this.restockScraper.get(region, timestamp, callback);
        } catch (err) {
            logService.logErrorObject(err);
        }
    }
    
    // Returns all new restock items which haven't been displayed yet
    // botStartTime:Date => Time that the bot was started
    // Regions: 'eu', 'us', 'jpn'
    // callback will have 3 parameters: error, restocks and region.
    getNewRestocks(botStartTime, region, callback) {
        try {
            if (callback === undefined || callback === null) callback = function() {};
            if (displayedRestocks.length === 0) return this.getRestocksSince(botStartTime, region, callback);
            return this.getRestocksSince(displayedRestocks.reduce((max, obj) => obj.timestamp > max ? obj.timestamp : max, displayedRestocks[0].timestamp), region, callback);
        } catch (err) {
            logService.logErrorObject(err);
        }
    }
    
    // Add restocks to displayedRestocks array
    addDisplayedRestocks(restocks) {
        try {
            displayedRestocks = displayedRestocks.concat(restocks);
        } catch (err) {
            logService.logErrorObject(err);
        }
    }

    // Saves a messageid to the database
    saveMessageId(channelId, id, timestamp) {
        try {
            this.restockDao.addMessageId(channelId, id, timestamp);
        } catch (err) {
            logService.logErrorObject(err);
        }
    }

    getMessageIds(channelId, callback) {
        try {
            if (callback === undefined || callback === null) callback = function() {};
            return this.restockDao.getMessageIds(channelId, callback);
        } catch (err) {
            logService.logErrorObject(err);
        }
    }

    removeMessageIds(channelId, ids) {
        try {
            this.restockDao.removeMessageIds(channelId, ids);
        } catch (err) {
            logService.logErrorObject(err);
        }
    }
};
