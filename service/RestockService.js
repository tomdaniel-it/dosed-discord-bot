// Array of restock items
export let displayedRestocks = [];

// Returns all restock items
// Regions: 'eu', 'us', 'jpn'
export function getRestocksSince(timestamp, region) { 
    return [];
}

// Returns all new restock items which haven't been displayed yet
// botStartTime:Date => Time that the bot was started
// Regions: 'eu', 'us', 'jpn'
export function getNewRestocks(botStartTime, region) { 
    if (displayedRestocks.length === 0) return getRestocksSince(botStartTime, region);
    return getRestocksSince(displayedRestocks.reduce((max, obj) => obj.timestamp > max ? obj.timestamp : max, data[0].timestamp), region);
}

// Add restocks to displayedRestocks array
export function addDisplayedRestocks(restocks) {
    displayedRestocks = displayedRestocks.concat(restocks);
}