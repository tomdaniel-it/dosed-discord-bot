// Array of restock items
export let displayedRestocks = [];

// Returns all restock items
export function getRestocksSince(timestamp) { 
    return [];
}

// Returns all new restock items which haven't been displayed yet
// botStartTime:Date => Time that the bot was started
export function getNewRestocks(botStartTime) { 
    if (displayedRestocks.length === 0) return getRestocksSince(botStartTime);
    return getRestocksSince(displayedRestocks.reduce((max, obj) => obj.timestamp > max ? obj.timestamp : max, data[0].timestamp));
}

// Add restocks to displayedRestocks array
export function addDisplayedRestocks(restocks) {
    displayedRestocks = displayedRestocks.concat(restocks);
}