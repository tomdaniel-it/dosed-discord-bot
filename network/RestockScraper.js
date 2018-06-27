const settings = require('../config.js');
const request = require('request');
const cheerio = require('cheerio');
const Restock = require('../domain/Restock.js');

class RestockScraper {

    get(region, newerThanTimestamp, callback, page = 1)
    {
        if(page == 1)
        {
            this.restocks = [];
            this.originalCallback = callback;
        }
        this.region = region;
        this.newerThanTimestamp = newerThanTimestamp;
        this.callback = callback;
        this.page = page;
        request(settings.restocks.url + region + "/" + page + "/", this.fetchRequest.bind(this));
    }

    fetchRequest(error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            this.shouldCheckNextPage = true;
            var restocksArray = $(".restocks").children().toArray();
            for(var index = 0; index < restocksArray.length; ++index)
            {
                var jQueryElement = $(restocksArray[index]);
                if(jQueryElement.hasClass('removed-scapp')) continue;
                var restockData = jQueryElement.data();
                restockData.timestamp = new Date(jQueryElement.find('.timeago').attr("datetime"));
                if(restockData.timestamp < this.newerThanTimestamp) {
                    this.shouldCheckNextPage = false;
                    break;
                };
                restockData.description = jQueryElement.find(".restock-colorway").text();
                restockData.url = "//supremenewyork.com/shop/dosed/" + restockData.itemid + "/" + restockData.styleid;
                restockData.region = this.region;
                this.restocks.push(new Restock(restockData.itemid, restockData.styleid, restockData.itemname, 
                    restockData.description, restockData.itemimg, restockData.timestamp, restockData.url, restockData.region));
            }
            if(this.shouldCheckNextPage)
            {
                setTimeout(()=>{
                    this.get(this.region, this.newerThanTimestamp, (results)=>{
                        this.restocks = this.restocks.concat(results);
                    }, this.page + 1);
                }, 1000);
            
            }
            else
            {
                this.restocks.reverse();
                this.originalCallback(null, this.restocks);
            }
        } else {
            if(error == null) error = "Error " + response.statusCode;
            this.callback(error, []);
        }
    }

}

module.exports = RestockScraper;