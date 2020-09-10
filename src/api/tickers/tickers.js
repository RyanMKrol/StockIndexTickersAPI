import cheerio from 'cheerio'
import curl from 'curl'
import arrayRange from 'array-range'
import Cache from 'noodle-cache'

import indexData from './../../../config/indexes'

const PAGINATION_SEPARATOR = ' of '
const PAGINATION_IDENTIFIER = '.page-last'

// caching responses for one week
const cacheTtlSeconds = 60 * 60 * 24 * 7
const CACHE = new Cache(cacheTtlSeconds)

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

async function getRawTickersForAllPages(stockIndex) {
  const url = indexData[stockIndex]

  const numPages = await getNumberOfPages(stockIndex)

  if (!url) {
    throw new Error(`Could not find where to grab stock data for ${stockIndex}`)
  }

  const tickerTasks = arrayRange(1, numPages + 1).map(pageNumber => {
    return new Promise((resolve, reject) => {
      // fetch info from page
      curl.get(`${url}?page=${pageNumber}`, (err, response, body) => {
        // attempt to parse tickers
        try {
          const $ = cheerio.load(body)
          const tickers = $('tbody tr')
            .map((i, elem) => {
              return $(elem)
                .find('a')
                .eq(0)
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
  return Promise.all(tickerTasks)
}

async function fetchTickers(stockIndex) {
  const getRawTickersDataWrapper = () => getRawTickersForAllPages(stockIndex)
  const baseTickers = await CACHE.processItem(
    `ticker-data-${stockIndex}`,
    getRawTickersDataWrapper
  )

  // modify tickers to expected format
  const tickers = baseTickers
    .flat()
    .map(ticker => (ticker.endsWith('.') ? `${ticker}L` : `${ticker}.L`))

  console.log(tickers.length)
  return tickers
}

export { fetchTickers }
