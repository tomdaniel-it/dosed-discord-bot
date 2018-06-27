module.exports = class RestockService {
    
    constructor() {
        // Array of restock items
        this.displayedRestocks = [];
    }
    
    // Returns all restock items
    // Regions: 'eu', 'us', 'jpn'
    getRestocksSince(timestamp, region) { 
        return [];
    }
    
    // Returns all new restock items which haven't been displayed yet
    // botStartTime:Date => Time that the bot was started
    // Regions: 'eu', 'us', 'jpn'
    getNewRestocks(botStartTime, region) {
        if (this.displayedRestocks.length === 0) return this.getRestocksSince(botStartTime, region);
        return this.getRestocksSince(this.displayedRestocks.reduce((max, obj) => obj.timestamp > max ? obj.timestamp : max, data[0].timestamp), region);
    }
    
    // Add restocks to displayedRestocks array
    addDisplayedRestocks(restocks) {
        this.displayedRestocks = this.displayedRestocks.concat(restocks);
    }
};
