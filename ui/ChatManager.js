const config = require('../config.js');
const logService = require('../service/LogService.js');
const RestockService = require('../service/RestockService.js');

let messageUpdateInterval;

module.exports = class ChatManager {
    constructor(bot) {
        this.bot = bot;
        this.service = new RestockService();
        if (messageUpdateInterval !== undefined && messageUpdateInterval !== null) {
            clearInterval(messageUpdateInterval);
        }
        setInterval(this.updateMessages.bind(this), config.restocks.message_update_interval * 1000);
    }

    // callback param: channel_id, id (of message)
    displayRestockItem(restockItem, callback) {
        try {
            this.bot.channels.array().forEach(channel => {
                if (config.restocks.channels[restockItem.region.toLowerCase()].indexOf(channel.id.toString()) !== -1) {
                    let now = new Date();
                    let amountAgo = parseInt(Math.abs((now.getTime() - restockItem.timestamp.getTime()) / 1000));
                    let datepart = "seconds";
                    if (amountAgo >= 60) {
                        amountAgo = parseInt(Math.floor(((Math.abs(now - restockItem.timestamp))/1000)/60));
                        datepart = "minutes";
                        if (amountAgo >= 60) {
                            amountAgo = parseInt(Math.abs(now - restockItem.timestamp) / 36e5);
                            datepart = "hours";
                        }
                    }
                    if (datepart === "hours" && amountAgo > config.restocks.rich_embed_hours_ago_limit) {
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
                              icon_url: "attachment://icon.png"
                            }
                        }, files: [{ attachment: 'img/dosed_logo.png', name: 'icon.png' }] }).then(message => {
                            callback(channel.id, message.id);
                        });
                    } else {
                        channel.send({ embed: {
                            description: restockItem.description,
                            color: 8322942,
                            footer: {
                              text: "Supreme | " + amountAgo + " " + datepart + " ago"
                            },
                            thumbnail: {
                              url: restockItem.imageURL
                            },
                            author: {
                              name: restockItem.name,
                              url: "http://supremenewyork.com/shop/dosed/" + restockItem.id + "/" + restockItem.styleId,
                              icon_url: "attachment://icon.png"
                            }
                        }, files: [{ attachment: 'img/dosed_logo.png', name: 'icon.png' }] }).then(message => {
                            callback(channel.id, message.id);
                        });
                    }
                }
            });
        } catch (err) {
            logService.logError("ui/ChatManager.js:74 => " + logService.objToString(err));
        }
    }

    updateMessages() {
        this.bot.channels.array().forEach(channel => {
            if (channel.type !== 'text') return;
            this.service.getMessageIds(channel.id.toString(), ids => {
                let delay = 0;
                ids.forEach(id => {
                    setTimeout(() => {
                        channel.fetchMessage(id.id).then(message => {
                            try {
                                if (message.embeds.length === 0) return;
                                let embed = message.embeds[0];
                                let time = embed.footer.text;
                                if (!/^[^\|]+\|\s*[0-9]{1,5}.*ago$/.test(time)) return;
                                let diff = this.getTimeDifference(id.timestamp);
                                if (!(!diff)) {
                                    time = time.split('|');
                                    time[time.length-1] = diff;
                                    time = time.join('|');
                                    if (time === embed.footer.text) return;
                                    message.edit({ embed: {
                                        description: embed.description,
                                        color: embed.color,
                                        footer: {
                                          text: time
                                        },
                                        thumbnail: {
                                          url: embed.thumbnail.url
                                        },
                                        author: {
                                          name: embed.author.name,
                                          url: embed.author.url,
                                          icon_url: "attachment://icon.png"
                                        }
                                    }, files: [{ attachment: 'img/dosed_logo.png', name: 'icon.png' }] });
                                } else {
                                    time = time.split('|');
                                    message.edit({ embed: {
                                        description: embed.description,
                                        color: embed.color,
                                        timestamp: id.timestamp.toISOString(),
                                        footer: {
                                            text: time[0]
                                        },
                                        thumbnail: {
                                            url: embed.thumbnail.url
                                        },
                                        author: {
                                            name: embed.author.name,
                                            url: embed.author.url,
                                            icon_url: "attachment://icon.png"
                                        }
                                    }, files: [{ attachment: 'img/dosed_logo.png', name: 'icon.png' }] });
                                    this.service.removeMessageIds(channel.id, [ message.id ]);
                                }
                            } catch (err) {
                                logService.logError("ChatManager.js:133 => " + logService.objToString(err));
                            }
                        }).catch(() => {
                            this.service.removeMessageIds(channel.id, [ id.id ]);
                        });
                    }, delay);
                    delay += 1000;
                });
            });
        });
    }

    getTimeDifference(timestamp) {
        let now = new Date();
        if (parseInt(Math.abs(now - timestamp) / 36e5) > config.restocks.rich_embed_hours_ago_limit) return false;
        let amountAgo = parseInt(Math.abs((now.getTime() - timestamp.getTime()) / 1000));
        let datepart = "seconds";
        if (amountAgo >= 60) {
            amountAgo = parseInt(Math.floor(((Math.abs(now - timestamp))/1000)/60));
            datepart = "minutes";
            if (amountAgo >= 60) {
                amountAgo = parseInt(Math.abs(now - timestamp) / 36e5);
                datepart = "hours";
                if (amountAgo >= 24) {
                    amountAgo = Math.floor((now - timestamp) / (1000 * 60 * 60 * 24));
                    datepart = "days";
                }
            }
        }
        if (amountAgo === 1) datepart = datepart.substring(0, datepart.length - 1);
        return " " + amountAgo + " " + datepart + " ago";
    }
}