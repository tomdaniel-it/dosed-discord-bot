const config = require('../config.js');
const RestockService = require('../service/RestockService.js');
const ChatManager = require('./ChatManager.js');
const logService = require('../service/LogService.js');

module.exports = class RestockChecker {
    constructor(bot, botStartTime) {
        this.botStartTime = botStartTime;
        this.eventActive = false;
        this.service = new RestockService();
        this.chatManager = new ChatManager(bot);
    }

    start() {
        this.interval_eu = setInterval(this.checkRestock.bind(this, config.restocks.regions.eu), config.restocks.update_interval * 1000);
        this.interval_us = setInterval(this.checkRestock.bind(this, config.restocks.regions.us), config.restocks.update_interval * 1000);
        this.interval_jpn = setInterval(this.checkRestock.bind(this, config.restocks.regions.jpn), config.restocks.update_interval * 1000);
    }

    stop() {
        clearTimeout(this.interval_event_timer);
        clearInterval(this.interval_eu);
        clearInterval(this.interval_us);
        clearInterval(this.interval_jpn);
    }

    startEvent() {
        this.stop();
        this.eventActive = true;
        this.interval_eu = setInterval(this.checkRestock.bind(this, config.restocks.regions.eu), config.restocks.event_update_interval * 1000);
        this.interval_us = setInterval(this.checkRestock.bind(this, config.restocks.regions.us), config.restocks.event_update_interval * 1000);
        this.interval_jpn = setInterval(this.checkRestock.bind(this, config.restocks.regions.jpn), config.restocks.event_update_interval * 1000);
        this.interval_event_timer = setInterval(this.stopEvent.bind(this), config.restocks.event_duration * 1000);
    }

    stopEvent() {
        clearTimeout(this.interval_event_timer);
        this.eventActive = false;
        this.stop();
        this.start();
    }

    checkRestock(region) {
        let callback = (error, newRestocks) => {
            if (error) {
                logService.logWarning('ui/RestockChecker.js:46 => Check restock request failed, error: ' + logService.objToString(error));
                return;
            }
            logService.log('HTTP GET request (' + region + ') => received ' + newRestocks.length + ' new items.');
            newRestocks.forEach(restockItem => {
                console.log(restockItem);
                this.chatManager.displayRestockItem(restockItem);
            });
            this.service.addDisplayedRestocks(newRestocks);
            if (newRestocks.length !== 0 && this.eventActive) {
                clearTimeout(this.interval_event_timer);
                this.interval_event_timer = setInterval(this.stopEvent.bind(this), config.restocks.event_duration * 1000);
            } else if (newRestocks.length !== 0) {
                this.startEvent();
            }
        };
        this.service.getNewRestocks(this.botStartTime, region, callback);
    }
}