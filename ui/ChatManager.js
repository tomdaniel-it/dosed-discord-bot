const config = require('../config.js');
const logService = require('../service/LogService.js');

module.exports = class ChatManager {
    constructor(bot) {
        this.bot = bot;
    }

    displayRestockItem(restockItem) {
        try {
            this.bot.channels.array().forEach(channel => {
                if (config.restocks.channels[restockItem.region.toLowerCase()] === channel.id) {
                    let hours = parseInt(Math.abs((new Date()) - restockItem.timestamp) / 36e5);
                    if (hours > config.restocks.rich_embed_hours_ago_limit) {
                        channel.send({ embed: {
                            description: restockItem.description,
                            color: 8322942,
                            timestamp: restockItem.timestamp.toISOString(),
                            footer: {
                              text: "Supreme"
                            },
                            thumbnail: {
                              url: restockItem.imageURL
                            },
                            author: {
                              name: restockItem.name,
                              url: "http://supremenewyork.com/shop/dosed/" + restockItem.id + "/" + restockItem.styleId,
                              icon_url: "https://www.supremecommunity.com/s/img/sclogo_dark.png"
                            }
                        } });
                    } else {
                        channel.send({ embed: {
                            description: restockItem.description,
                            color: 8322942,
                            footer: {
                              text: "Supreme | " + hours + " hours ago"
                            },
                            thumbnail: {
                              url: restockItem.imageURL
                            },
                            author: {
                              name: restockItem.name,
                              url: "http://supremenewyork.com/shop/dosed/" + restockItem.id + "/" + restockItem.styleId,
                              icon_url: "https://www.supremecommunity.com/s/img/sclogo_dark.png"
                            }
                        } });
                    }
                }
            });
        } catch (err) {
            logService.logError("ui/ChatManager.js:50 => " + logService.objToString(err));
        }
    }
}