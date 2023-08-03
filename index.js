const constants = require("./constants");
const { ContentfulRepository } = require("./repositories/ContentfulRepository");
const { WordpressRepository } = require("./repositories/WordpressRepository.js");
const masterList = require('./masterlist.json');

(async () => {
    const wordpressRepo = new WordpressRepository(constants.wordpressFile)
    const contentfulRepo = new ContentfulRepository()



    const articles = await wordpressRepo.getAllArticles()

    for (article of articles) {

        try{
        await contentfulRepo.saveArticle(article)
        }catch(exp){
            console.error(`unable to process article ${article.title}`)
            console.error(exp)
        }
    }

})()