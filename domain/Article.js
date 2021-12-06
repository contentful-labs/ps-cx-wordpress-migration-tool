const turndown = require("turndown")
const turndownService = new turndown()
const { richTextFromMarkdown } = require('@contentful/rich-text-from-markdown')
const { ImageMap } = require("./ImageMap")
const moment = require('moment')

class Article {

    title
    link
    pubDate
    author
    guid
    description
    content
    excerpt
    id
    name
    status
    categories
    markdown

    constructor(){
        this.images = []
    }

    getContentfulEntry(){


        return {

        }
    }

    /**
     * 
     * @param {ImageMap} imageMap 
     */
    async getRTEContent(imageMap){
        return await richTextFromMarkdown(
            this.markdown,
            (node) => {
              if (node.type === 'image') {
                if( !imageMap.getEntryId(node.url)){
                  console.error(`image missing ${node.url} -- skipping`) 
                  return
                }
                return {
                  nodeType: 'embedded-asset-block',
                  content: [],
                  data: {
                    target: {
                      sys: {
                        id: imageMap.getEntryId(node.url),
                        type: 'Link',
                        linkType: 'Asset',
                      },
                    },
                  },
                }
              } else {
                return undefined
              }
            },
          )
    }



    isPublished() {
        return this.status === 'publish'
    }

    static async fromWordpressNode(data) {

        if( !data){
            return new Article()
        }

        if (data && data['wp:post_type'] !== 'post') {
            return new Article()
        }


        const article = new Article()

        article.title = data.title
        article.link = data.link
        article.pubDate = moment(data.pubDate).toDate()
        article.author = data['dc:creator']
        article.guid = data.guid
        article.description = data.description
        article.content = data['content:encoded']
        article.excerpt = data.excerpt
        article.id = data['wp:post_id']
        article.name = data['wp:post_name']
        article.status = data['wp:status']
        article.categories = data.category
        article.tags = data.tags

        // transform raw content to rte content

        const newLineFix = article.content.replaceAll(`\n`, '<br>')
        article.markdown = await turndownService.turndown(newLineFix)
        const images = [...article.markdown.matchAll(/!\[.*?\]\((.*?)\)/gm)]


        if( images && images.length > 0){
            article.images = images.map( g => g[1])
        }


        return article
    }


}

module.exports = { Article }