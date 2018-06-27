class Restock {
    
    constructor(id, styleId, name, description, imageURL, timestamp, url, region)
    {
        this.id = id;
        this.styleId = styleId;
        this.name = name;
        this.description = description;
        this.imageURL = imageURL;
        this.timestamp = timestamp;
        this.url = url;
        this.region = region;
    }

}

module.exports = Restock;