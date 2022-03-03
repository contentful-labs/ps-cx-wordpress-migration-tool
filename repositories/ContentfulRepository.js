const path = require('path')
const { DrupalNode } = require("../domain/DrupalNode");
const { ImageRepository } = require("./ImageRepository");
const contentful = require('contentful-management');
const constants = require("../constants");
const fs = require('fs')
const imageRepo = new ImageRepository()


class ContentfulRepository {

  spaceId
  environment

  constructor(config) {

    this.spaceId = constants.spaceId
    this.environment = constants.environment
    this.accessToken = constants.accessToken

  }

  async getEnv() {
    const client = await contentful.createClient({
      // This is the access token for this space. Normally you get the token in the Contentful web app
      accessToken: this.accessToken,
    })

    const space = await client.getSpace(this.spaceId)
    return await space.getEnvironment(this.environment)
  }

 /**
   * 
   * @param {DrupalNode} node 
   */
  async saveDurpalNode(node) {

    const env = await this.getEnv()

    // start processing the images - we need it before RTE transformation

    if (node.images.length > 0) {
      
      const imageMap = await imageRepo.downloadImages(node.images)

      // now go through all the imageMaps and add the entryIds
      for (const mapEntry of imageMap.data) {
        if (mapEntry.downloadSuccessful()) {

          const entryId = await this.saveImage(mapEntry.url, mapEntry.downloadLocation)
          mapEntry.addEntryId(entryId)
        }
      }

      const rteContent = await node.getRTEContent(imageMap)

      const drupalNode = {
        fields: {
          nid: {
            'en-US': node.nid,
          },
          title: {
            'en-US': node.title,
          },
          content: {
            'en-US': rteContent,
          },
        },
      }

      const entry = await env.createEntry('drupalNode', drupalNode)
      await entry.publish()

      console.log(drupalNode)

    }

  }




  /**
   * 
   * @param {Article} article 
   */
  async saveArticle(article) {

    const env = await this.getEnv()

    // start processing the images - we need it before RTE transformation

    if (article.images.length > 0) {
      const imageMap = await imageRepo.downloadImages(article.images)

      // now go through all the imageMaps and add the entryIds
      for (const mapEntry of imageMap.data) {
        if (mapEntry.downloadSuccessful()) {

          const entryId = await this.saveImage(mapEntry.url, mapEntry.downloadLocation)
          mapEntry.addEntryId(entryId)
        }
      }

      const rteContent = await article.getRTEContent(imageMap)

      const articleEntry = {
        fields: {
          name: {
            'en-US': article.name,
          },
          id: {
            'en-US': article.id,
          },
          content: {
            'en-US': rteContent,
          },
          publishedDate: {
            'en-US': article.pubDate
          }
        },
      }

      const entry = await env.createEntry('article', articleEntry)
      await entry.publish()

      console.log(articleEntry)

    }

  }

  /**
   * 
   * @param {string} image 
   */
  async saveImage(url, imageLocation) {

    const env = await this.getEnv()

    const existingAsset = await env.getAssets( { 
      'fields.description' : url
    })

    if( existingAsset.total > 0 ){
      console.log(`Image with url ${url} already in contentful, using that...`)
      return existingAsset.items[0].sys.id
    }

    const imageName = path.basename(url)

    const asset = await env.createAssetFromFiles({
      fields: {
        title: {
          'en-US': imageName,
        },
        file: {
          'en-US': {
            contentType: 'image/' + imageName.split('.').pop(),
            fileName: imageName,
            file: fs.readFileSync(imageLocation),
          },
        },
        description: {
          'en-US': url
        }
      },
    })

    const assetReady = await asset.processForAllLocales()
    await assetReady.publish()

    return assetReady.sys.id

  }

  /**
   * 
   * @param {Article} article 
   * @param {Array[string]} images 
   */
  uploadArticle(article, images) {

  }

}


module.exports = { ContentfulRepository }