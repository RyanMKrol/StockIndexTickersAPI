import cheerio from 'cheerio'
import curl from 'curl'

function getNumberOfPages(stockIndex) {
  const url = require(`${__dirname}/../../config.json`)[stockIndex]

  return new Promise((resolve, reject) => {
    if (url) {
        curl.get(url, (err, response, body) => {
          try {
            const $ = cheerio.load(body)
            const pages = $('.paging').first().find('p').first().text()
            const numPages = parseInt(pages.split(" of ").pop())

            resolve(numPages)
          } catch (err) {
            reject(`Could not grab number of pages needed from page: ${url}, error: ${err}`)
          }
      })
    } else {
      reject(`Could not find where to grab stock data for ${stockIndex}`)
    }
  })
}

export {
  getNumberOfPages
}
