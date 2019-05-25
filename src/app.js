import express from 'express'
import * as scraperLib from './PageScraper'
const app = express()

// initial permissions fetching
app.get('/constituents/:index', function(req, res) {
  const index = req.params.index;

  scraperLib.getNumberOfPages(index).then((result) => {
    console.log(result)
  })
})

app.listen(8000, () => {
  console.log('Example app listening on port 8000!')
})
