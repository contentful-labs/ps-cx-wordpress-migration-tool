const reader = require('xml-reader')
const fs = require('fs')
const { Article } = require('../domain/Article')
const nodes = require('../data/drupal/nodes.json')
const { DrupalNode } = require('../domain/DrupalNode')

class DrupalRepository {


    /**
     * 
     * @param {string} drupalNodesFile 
     */
    constructor() {
    }

    /**
     * 
     * @returns {Article[]}
     */
    async getAllNodes() {

        return this.parseNodes(nodes)

    }


    parseNode(node) {

        return DrupalNode.fromRawDataSource(node)
    }


    async parseNodes(nodes) {


        const promises = [nodes[1]].map((node) => this.parseNode(node))

        return Promise.all(promises)

    }



    parseXML() {
        const xml = this.readNodesFile(this.drupalNodesFile)
        reader.create()

        return reader.parseSync(xml)
    }



}

module.exports = { DrupalRepository: DrupalRepository }