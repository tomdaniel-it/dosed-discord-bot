const config = require('../config.js');
const RestockService = require('../service/RestockService.js');
const ChatManager = require('./ChatManager.js');
const logService = require('../service/LogService.js');
const Restock = require('../domain/Restock.js');

module.exports = class RestockChecker {
    constructor(bot, botStartTime) {
        try {
            this.botStartTime = botStartTime;
            this.eventActive = false;
            this.interval_eu = null;
            this.interval_us = null;
            this.interval_jpn = null;
            this.service = new RestockService();
            this.chatManager = new ChatManager(bot);
            this.failSafeTimeout = false;
        } catch (err) {
            logService.logErrorObject(err);
        }
    }

    start() {
        setTimeout(this.checkRestock.bind(this, config.restocks.regions.eu), 1);
        setTimeout(this.checkRestock.bind(this, config.restocks.regions.us), 2001);
        setTimeout(this.checkRestock.bind(this, config.restocks.regions.jpn), 4001);
        let eu = () => { clearInterval(this.interval_eu); this.interval_eu = setInterval(this.checkRestock.bind(this, config.restocks.regions.eu), config.restocks.update_interval * 1000); };
        let us = () => { clearInterval(this.interval_us); this.interval_us = setInterval(this.checkRestock.bind(this, config.restocks.regions.us), config.restocks.update_interval * 1000); };
        let jpn = () => { clearInterval(this.interval_jpn); this.interval_jpn = setInterval(this.checkRestock.bind(this, config.restocks.regions.jpn), config.restocks.update_interval * 1000); };
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
        try {
            this.stop();
            this.eventActive = true;
            let eu = () => { clearInterval(this.interval_eu); this.interval_eu = setInterval(this.checkRestock.bind(this, config.restocks.regions.eu), config.restocks.event_update_interval * 1000); };
            let us = () => { clearInterval(this.interval_us); this.interval_us = setInterval(this.checkRestock.bind(this, config.restocks.regions.us), config.restocks.event_update_interval * 1000); };
            let jpn = () => { clearInterval(this.interval_jpn); this.interval_jpn = setInterval(this.checkRestock.bind(this, config.restocks.regions.jpn), config.restocks.event_update_interval * 1000); };
            eu();
            setTimeout(us, 1000);
            setTimeout(jpn, 2000);
            this.interval_event_timer = setInterval(this.stopEvent.bind(this), config.restocks.event_duration * 1000);
        } catch (err) {
            logService.logErrorObject(err);
            this.stop();
            this.start();
        }
    }

    stopEvent() {
        clearTimeout(this.interval_event_timer);
        this.eventActive = false;
        this.stop();
        this.start();
    }

    checkRestock(region) {
        try {
            if (this.failSafeTimeout) return;
            let callback = (error, newRestocks) => {
                try {
                    if (error) {
                        logService.logWarning('ui/RestockChecker.js:58 => Check restock request failed, error: ' + logService.objToString(error));
                        this.failSafeTimeout = true;
                        setTimeout(() => { this.failSafeTimeout = false; }, config.restocks.request_block_timeout * 1000);
                        return;
                    }
                    newRestocks.forEach(restockItem => {
                        this.chatManager.displayRestockItem(restockItem, (channelId, id) => {
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
                } catch (err) {
                    logService.logErrorObject(err);
                }
            };
            this.service.getNewRestocks(this.botStartTime, region, callback);
        } catch (err) {
            logService.logErrorObject(err);
        }
    }
}