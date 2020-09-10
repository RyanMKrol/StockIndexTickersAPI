import cheerio from 'cheerio'
import curl from 'curl'
import arrayRange from 'array-range'

import indexData from './../../../config/indexes'

const PAGINATION_SEPARATOR = ' of '
const PAGINATION_IDENTIFIER = '.page-last'

function getNumberOfPages(stockIndex) {
  const url = indexData[stockIndex]

  if (!url) {
    throw new Error(`Could not find where to grab stock data for ${stockIndex}`)
  }

  return new Promise((resolve, reject) => {
    curl.get(url, (err, response, body) => {
      try {
        const $ = cheerio.load(body)
        const numPages = new URL(
          $(PAGINATION_IDENTIFIER)
            .first()
            .attr('href'),
          'https://example.com'
        ).searchParams.get('page')

        const intNumPages = parseInt(numPages)

        resolve(intNumPages)
      } catch (err) {
        console.log(err)
        reject(
          `Could not grab number of pages needed from page: ${url}, error: ${err}`
        )
      }
    })
  })
}

async function fetchTickers(stockIndex) {
  const url = indexData[stockIndex]
  const numPages = await getNumberOfPages(stockIndex)

  if (!url) {
    throw new Error(`Could not find where to grab stock data for ${stockIndex}`)
  }

  const tickerTasks = arrayRange(1, numPages).map(pageNumber => {
    return new Promise((resolve, reject) => {
      // fetch info from page
      curl.get(`${url}&page=${pageNumber}`, (err, response, body) => {
        // attempt to parse tickers
        try {
          const $ = cheerio.load(body)
          const tickers = $('tbody tr')
            .map((i, elem) => {
              return $(elem)
                .find('a')
                .eq(1)
                .text()
            })
            .get()

          resolve(tickers)
        } catch (err) {
          reject(
            `Could not grab number of pages needed from page: ${url}, error: ${err}`
          )
        }
      })
    })
  })

  // wait for all tasks to finish
  const baseTickers = await Promise.all(tickerTasks)

  // modify tickers to expected format
  const tickers = baseTickers
    .flat()
    .map(ticker => (ticker.endsWith('.') ? `${ticker}L` : `${ticker}.L`))

  return tickers
}

export { fetchTickers }
