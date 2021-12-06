const reader = require('xml-reader')
const fs = require('fs')
const { Article } = require('../domain/Article')

class WordpressRepository {


    /**
     * 
     * @param {string} rawWordpressFile 
     */
    constructor(rawWordpressFile) {
        this.wordpressFileName = rawWordpressFile
    }

    /**
     * 
     * @returns {Article[]}
     */
    async getAllArticles() {

        const xml = this.parseXML()
        const articles = await this.parseArticles(xml)
        return articles

    }


    readXML(fileName) {
        var data = fs.readFileSync(fileName, 'utf8')

        return data
    }


    parseArticle(blogNode) {
        const articleJson = {}


        blogNode.children.forEach((c) => {

            const value = c.children[0] ? c.children[0].value : undefined

            if (c.name === 'category') {
                if (c.attributes.domain === 'category') {
                    if (articleJson[c.name]) {
                        articleJson[c.name] = articleJson[c.name] + '|' + value
                    } else {
                        articleJson[c.name] = value
                    }
                }
                else if (c.attributes.domain === 'post_tag') {
                    if (articleJson['tags']) {
                        articleJson['tags'] = articleJson['tags'] + '|' + value
                    } else {
                        articleJson['tags'] = value
                    }

                }
            } else {
                articleJson[c.name] = value
            }


        })

        return Article.fromWordpressNode(articleJson)
    }


    async parseArticles(rawXml) {
        const articlePromises = rawXml.children[0].children
            .filter((c) => c.name === 'item')
            .map((cn) => this.parseArticle(cn))

        const articles = await Promise.all( articlePromises)

        const publishedArticles = articles.filter(
            (article) => article.isPublished()
        )

        return publishedArticles
    }



    parseXML() {
        const xml = this.readXML(this.wordpressFileName)
        reader.create()

        return reader.parseSync(xml)
    }



}

module.exports = { WordpressRepository }