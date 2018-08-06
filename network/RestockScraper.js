const requestPromise = require('request-promise');
const cheerio = require('cheerio');
const Restock = require('../domain/Restock.js');
const config = require('../config.js');
const logService = require('../service/LogService.js');

var first = true;

class RestockScraper {

    constructor()
    {
        this.url = config.restocks.url;
        this.waitBetweenPagesInterval = config.restocks.wait_between_pages_interval;
    }

    // Get all restocks from a region that were made after the given timestamp.
    // callback will have 3 parameters: error, restocks and region.
    get(region, newerThanTimestamp, callback, page = 1, restocks = [])
    {
        try {
            if (callback === undefined || callback === null) callback = function() {};
            if(page == undefined) page = 1;
            if(restocks == undefined) restocks = [];
            if (first) {
                restocks.push(new Restock(12345, 12345, "Test", "This is a test", "https://images.fireside.fm/podcasts/images/b/bc7f1faf-8aad-4135-bb12-83a8af679756/cover_medium.jpg" , new Date(), "https://images.fireside.fm/podcasts/images/b/bc7f1faf-8aad-4135-bb12-83a8af679756/cover_medium.jpg", config.restocks.regions.eu));
                first = false;
            }
            return requestPromise({
                uri: this.url + region + "/" + page + "/",
                transform: function (body) {
                    return cheerio.load(body);
                }
            }).then(($) => {
                try {
                    var shouldCheckNextPage = true;
                    var restocksArray = $(".restocks").children().toArray();
                    var currentPageRestocks = [];
                    for(var index = 0; index < restocksArray.length; ++index)
                    {
                        var jQueryElement = $(restocksArray[index]);
                        if(jQueryElement.hasClass('removed-scapp')) continue;
                        var restockData = jQueryElement.data();
                        restockData.timestamp = new Date(jQueryElement.find('.timeago').attr("datetime"));
                        if(restockData.timestamp <= newerThanTimestamp) {
                            shouldCheckNextPage = false;
                            break;
                        };
                        restockData.description = jQueryElement.find(".restock-colorway").text();
                        restockData.url = "https://supremenewyork.com/shop/dosed/" + restockData.itemid + "/" + restockData.styleid;
                        restockData.region = region;
                        currentPageRestocks.push(new Restock(restockData.itemid, restockData.styleid, restockData.itemname,
                            restockData.description, 'https:' + restockData.itemimg, restockData.timestamp, restockData.url, restockData.region));
                    }
                    restocks = restocks.concat(currentPageRestocks);
                    if(shouldCheckNextPage) {
                        setTimeout(() => {
                            this.get(region, newerThanTimestamp, callback, page + 1, restocks);
                        }, this.waitBetweenPagesInterval * 1000);
                    } else {
                        callback(null, restocks, region);
                    }
                } catch (err) {
                    logService.logErrorObject(err);
                }
            }).catch((err)=>{
                callback(err, restocks, region);
            });
        } catch (err) {
            logService.logErrorObject(err);
        }
    }
}

module.exports = RestockScraper;