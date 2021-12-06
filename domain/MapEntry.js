class MapEntry {
    /** @type {string} */
    url
    /** @type {string} */
    downloadLocation
    /** @type {string} */
    entryId

    constructor(url, downloadLocation) {
        this.url = url
        this.downloadLocation = downloadLocation
    }

    /**
     * 
     * @param {string} entryId 
     */
    addEntryId(entryId) {
        this.entryId = entryId
    }

    downloadSuccessful(){
        return this.downloadLocation !== undefined 
    }
}


module.exports = { MapEntry }