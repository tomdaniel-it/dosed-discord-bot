const config = require('../config.js');
const RestockService = require('../service/RestockService.js');
const ChatManager = require('./ChatManager.js');
const logService = require('../service/LogService.js');
const Restock = require('../domain/Restock.js');

module.exports = class RestockChecker {
    constructor(bot, botStartTime) {
        this.botStartTime = botStartTime;
        this.eventActive = false;
        this.service = new RestockService();
        this.chatManager = new ChatManager(bot);
        this.failSafeTimeout = false;

        let now = new Date();
        this.chatManager.displayRestockItem(new Restock(1234, 1234, "Test item", "A description", "https://st2.depositphotos.com/2398103/5516/v/950/depositphotos_55167265-stock-illustration-vector-test-icon.jpg", now, "https://st2.depositphotos.com/2398103/5516/v/950/depositphotos_55167265-stock-illustration-vector-test-icon.jpg", "us"), (channelId, id) => {
            this.service.saveMessageId(channelId, id, now);
        });
    }

    start() {
        setTimeout(this.checkRestock.bind(this, config.restocks.regions.eu), 1);
        setTimeout(this.checkRestock.bind(this, config.restocks.regions.us), 2001);
        setTimeout(this.checkRestock.bind(this, config.restocks.regions.eu), 4001);
        let eu = () => { this.interval_eu = setInterval(this.checkRestock.bind(this, config.restocks.regions.eu), config.restocks.update_interval * 1000); };
        let us = () => { this.interval_us = setInterval(this.checkRestock.bind(this, config.restocks.regions.us), config.restocks.update_interval * 1000); };
        let jpn = () => { this.interval_jpn = setInterval(this.checkRestock.bind(this, config.restocks.regions.jpn), config.restocks.update_interval * 1000); };
        eu();
        setTimeout(us, 2000);
        setTimeout(jpn, 4000);
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
        let eu = () => { this.interval_eu = setInterval(this.checkRestock.bind(this, config.restocks.regions.eu), config.restocks.event_update_interval * 1000); };
        let us = () => { this.interval_us = setInterval(this.checkRestock.bind(this, config.restocks.regions.us), config.restocks.event_update_interval * 1000); };
        let jpn = () => { this.interval_jpn = setInterval(this.checkRestock.bind(this, config.restocks.regions.jpn), config.restocks.event_update_interval * 1000); };
        eu();
        setTimeout(us, 1000);
        setTimeout(jpn, 2000);
        this.interval_event_timer = setInterval(this.stopEvent.bind(this), config.restocks.event_duration * 1000);
    }

    stopEvent() {
        clearTimeout(this.interval_event_timer);
        this.eventActive = false;
        this.stop();
        this.start();
    }

    checkRestock(region) {
        if (this.failSafeTimeout) return;
        let callback = (error, newRestocks) => {
            if (error) {
                logService.logWarning('ui/RestockChecker.js:46 => Check restock request failed, error: ' + logService.objToString(error));
                this.failSafeTimeout = true;
                setTimeout(() => { this.failSafeTimeout = false; }, config.restocks.request_block_timeout * 1000);
                return;
            }
            logService.log('HTTP GET request (' + region + ') => received ' + newRestocks.length + ' new items.');
            newRestocks.forEach(restockItem => {
                this.chatManager.displayRestockItem(restockItem, channelId, id => {
                    this.service.saveMessageId(channelId, id, restockItem.timestamp);
                });
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