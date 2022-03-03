const turndown = require("turndown")
const turndownService = new turndown()
const { richTextFromMarkdown } = require('@contentful/rich-text-from-markdown')
const { ImageMap } = require("./ImageMap")
const moment = require('moment')
const fs = require('fs')

class DrupalNode {

  vid
  uid
  title
  status
  comment
  promote
  sticky
  vuuid
  nid
  type
  language
  created
  changed
  tnid
  translate
  uuid
  revision_timestamp
  fileld_body_no_summary
  title_field
  field_breadcrumb_value
  field_path_breadcrumb
  title_original
  entity_translation_handler_id
  metaTags
  path
  name
  picture
  data

  markdown
  images


  constructor() {
    this.images = []
  }

  getContentfulEntry() {


    return {

    }
  }

  /**
   * 
   * @param {ImageMap} imageMap 
   */
  async getRTEContent(imageMap) {
    return await richTextFromMarkdown(
      this.markdown,
      (node) => {
        if (node.type === 'image') {
          if (!imageMap.getEntryId(node.url)) {
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


  /**
   * 
   * @param {ImageMap} imageMap 
   */
  async getRTEContent(imageMap) {
    return await richTextFromMarkdown(
      this.markdown,
      (node) => {
        if (node.type === 'image') {
          if (!imageMap.getEntryId(node.url)) {
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


  static async fromRawDataSource(node) {


    const html = node.field_body_no_summary.und[0].value

    const drupalNode = new DrupalNode()

    console.log(html)

    let newLineFix = html.replaceAll(`\n`, '<br>')
    newLineFix = newLineFix.replaceAll(`\t`, '')
    newLineFix = newLineFix.replaceAll(`\r`, '')
    drupalNode.markdown = await turndownService.turndown(newLineFix)

    const images = [...drupalNode.markdown.matchAll(/!\[.*?\]\((.*?)\)/gm)]


    if (images && images.length > 0) {
      drupalNode.images = images.map(g => g[1])
    }

    drupalNode.nid = node.nid
    drupalNode.title = node.title

    return drupalNode
  }


}

module.exports = { DrupalNode: DrupalNode }