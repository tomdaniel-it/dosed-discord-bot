const config = require('../config.js');
const Proxy = require('../domain/Proxy.js');

module.exports = class ProxyService {
    constructor() {
        try {
            this.proxies = this.convertToProxies(JSON.parse(JSON.stringify(config.proxies)));
            this.disabledProxies = [];
            this.index = 0;
            this.interval = setInterval(() => {
                this.index = this.index >= this.proxies.length ? 0 : this.index + 1; 
            }, config.restocks.proxy_switch_interval * 1000);
        } catch (err) {
            logService.logErrorObject(err);
        }
    }

    getProxy() {
        this.classifyProxies();
        if (this.index >= this.proxies.length) this.index = 0;
        return this.proxies[this.index];
    }

    disableProxy(proxy) {
        proxy.active = false;
        this.classifyProxies();
    }

    enableProxy(proxy) {
        proxy.active = true;
        this.classifyProxies();
    }

    classifyProxies() {
        try {
            let tempActive = [];
            let tempDisabled = [];
            let classifier = (proxy) => {
                if (proxy.active) {
                    tempActive.push(proxy);
                } else {
                    tempDisabled.push(proxy);
                }
            };
            this.proxies.forEach(proxy => classifier);
            this.disabledProxies.forEach(proxy => classifier);
            this.proxies = tempActive;
            this.disabledProxies = tempDisabled;
        } catch (err) {
            logService.logErrorObject(err);
        }
    }

    convertToProxies(objects) {
        try {
            let proxies = [];
            objects.forEach(obj => {
                proxies.push(new Proxy(obj.ip, obj.port, true));
            });
            return proxies;
        } catch (err) {
            logService.logErrorObject(err);
        }
    }
}