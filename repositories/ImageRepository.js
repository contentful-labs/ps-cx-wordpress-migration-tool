const axios = require('axios')
const uuid = require('uuid/v4')
const fs = require('fs')
const path = require('path')
const { MapEntry } = require('../domain/MapEntry')
const { ImageMap } = require('../domain/ImageMap')

const TEMP_IMAGE_FOLDER = "temp_image"
class ImageRepository {



    /**
     * 
     * @param {ContentfulRepository} contentfulRepo 
     */
    constructor(contentfulRepo) {
        this.contentfulRepo = contentfulRepo
    }


    async tmp_downloadImage(url) {
        const fileId = uuid()
        const downloadFileLocation = `${TEMP_IMAGE_FOLDER}/${fileId}`

        axios({
            url,
            responseType: 'stream',
        }).then(
            (response) =>
                new Promise((resolve, reject) => {
                    response.data
                        .pipe(fs.createWriteStream(downloadFileLocation))
                        .on('finish', () => resolve(downloadFileLocation))
                        .on('error', (e) => reject(e))
                }),
        )

    }

    async ensureDirectoryExistence(dirname) {
        if (fs.existsSync(dirname)) {
            return true;
        }
        fs.mkdirSync(dirname, {recursive: true});
    }


    /**
     * 
     * @param {String[]} images 
     */
    async downloadImages(images){
        const mapEntries =  await Promise.all(images.map( image => this.downloadImage(image)))

        return new ImageMap(mapEntries)
    }

    async downloadImage(url) {

        const cleanedUrl = url.trim('`')
        const imageFolder = `${TEMP_IMAGE_FOLDER}`
        await this.ensureDirectoryExistence(imageFolder)
        const downloadFileLocation = `${imageFolder}/` + path.basename(cleanedUrl)

        try {
            await axios({
                url: cleanedUrl,
                responseType: 'stream',
            }).then(
                (response) =>
                    new Promise((resolve, reject) => {
                        response.data
                            .pipe(fs.createWriteStream(downloadFileLocation))
                            .on('finish', () => resolve(downloadFileLocation))
                            .on('error', (e) => reject(e))
                    }),
            )

        } catch (exp) {
            console.error(`unable to download url: ${cleanedUrl}`)
            console.error(`exception: ${exp}`)
            return new MapEntry(cleanedUrl)

        }

        return new MapEntry(cleanedUrl, downloadFileLocation)


    }

}


module.exports = { ImageRepository }