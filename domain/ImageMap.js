const { MapEntry } = require("./MapEntry")

class ImageMap {

    /** @type {MapEntry[]} */
    data

    /**
     * 
     * @param {MapEntry[]} mapEntries 
     */
    constructor(mapEntries) {
        this.data = mapEntries
    }

    /**
     * 
     * @param {string} url 
     */
    getEntryId(url) {
        const mapEntry = this.data.find(d => d.url === url)
        if (mapEntry)
            return mapEntry.entryId
    }


    /**
     * 
     * @param {MapEntry} mapEntry 
     */
    addEntry(mapEntry) {
        if (mapEntry) {
            this.data.push(mapEntry)
        }
    }


}

module.exports = { ImageMap }