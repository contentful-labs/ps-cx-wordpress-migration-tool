const path = require('path')
const { Article } = require("../domain/Article");
const { ImageRepository } = require("./ImageRepository");
const contentful = require('contentful-management');
const constants = require("../constants");
const fs = require('fs')
const imageRepo = new ImageRepository()


class LocationRepository {

  spaceId
  environment

  constructor() {

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

  async getAllLocations(){

    const client = await this.getEnv() 
  
    const BATCH_SIZE = 300
  
    let skip = 0
    let fetchMore = true
    const allArticles = []
  
    while (fetchMore) {
  
      // eslint-disable-next-line no-await-in-loop
      const result = await client.getEntries({
        content_type: 'location',
        include: 1,
        skip,
        limit: BATCH_SIZE,
      })
  
      fetchMore = result.items.length > 0
      skip += BATCH_SIZE
  
      allArticles.push(...result.items)
    }
  
    return allArticles
  }

  async updateLocation(storeNumber, slug){
    const env = await this.getEnv()


    const  entries = await env.getEntries( {
      content_type: 'location',
      'fields.storeNumber': storeNumber
    })

    if( entries.items[0] ){
      const location = entries.items[0]

      location.fields.slug = {'en-US': slug}

      await location.update()

      const entry = await env.getEntry(location.sys.id)
      await entry.publish()
      console.log(`Store with ${storeNumber} slug changed to: ${slug}`)


    }else{
      console.error(`Store with store number ${storeNumber} not found`)
    }




    // find the store

  }

  async getLocation(storeNumber){
    const env = await this.getEnv()

    const  entries = await env.getEntries( {
      content_type: 'location',
      'fields.storeNumber': storeNumber
    })

    return entries.items[0]

    // find the store

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


module.exports = { LocationRepository }