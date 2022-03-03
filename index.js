const constants = require("./constants");
const { ContentfulRepository } = require("./repositories/ContentfulRepository");
const { DrupalRepository } = require("./repositories/DrupalRepository");

(async () => {

    try {
        const drupalRepo = new DrupalRepository()
        const contentfulRepo = new ContentfulRepository()

        const nodes = await drupalRepo.getAllNodes()

        for(const node of nodes){
            await contentfulRepo.saveDurpalNode(node)
        }

        console.log(nodes)


    } catch (exp) {
        console.error(exp)
    }


})()