const requestPromise = require('request-promise');
const cheerio = require('cheerio');
const Restock = require('../domain/Restock.js');

class RestockScraper {

    constructor(url, waitBetweenPagesInterval)
    {
        this.url = url;
        this.waitBetweenPagesInterval = waitBetweenPagesInterval;
    }

    // Get all restocks from a region that were made after the given timestamp.
    // callback will have 3 parameters: error, restocks and region.
    get(region, newerThanTimestamp, callback, page = 1, restocks = [])
    {
        if(page == undefined) page = 1;
        if(restocks == undefined) restocks = [];
        var requestMethod = requestPromise;
        return requestMethod({
            uri: this.url + region + "/" + page + "/",
            transform: function (body) {
                return cheerio.load(body);
            }
        }).then(($) => {
            var shouldCheckNextPage = true;
            var restocksArray = $(".restocks").children().toArray();
            var currentPageRestocks = [];
            for(var index = 0; index < restocksArray.length; ++index)
            {
                var jQueryElement = $(restocksArray[index]);
                if(jQueryElement.hasClass('removed-scapp')) continue;
                var restockData = jQueryElement.data();
                restockData.timestamp = new Date(jQueryElement.find('.timeago').attr("datetime"));
                if(restockData.timestamp < newerThanTimestamp) {
                    shouldCheckNextPage = false;
                    break;
                };
                restockData.description = jQueryElement.find(".restock-colorway").text();
                restockData.url = "//supremenewyork.com/shop/dosed/" + restockData.itemid + "/" + restockData.styleid;
                restockData.region = region;
                currentPageRestocks.push(new Restock(restockData.itemid, restockData.styleid, restockData.itemname,
                    restockData.description, restockData.itemimg, restockData.timestamp, restockData.url, restockData.region));
            }
            restocks = restocks.concat(currentPageRestocks);
            if(shouldCheckNextPage) {
                setTimeout(() => {
                    this.get(region, newerThanTimestamp, callback, page + 1, restocks);
                }, this.waitBetweenPagesInterval * 1000);
            } else {
                callback(null, restocks, region);
            }
        }).catch((err)=>{
            callback(err, restocks, region);
        });
    }
}

module.exports = RestockScraper;