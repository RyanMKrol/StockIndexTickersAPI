import express from 'express'
import * as dataSource from './DataSourceLib'

const app = express()

app.get('/constituents/:index', async function(req, res) {
  const index = req.params.index;

  try {
    const tickers = await dataSource.fetchTickers(index)
    res.send(tickers)
  } catch (error) {
    res.status(500).send(error)
  }
})

app.get('/constituents', async function(req, res) {
  const config = require(`${__dirname}/../config.json`)
  res.send(Object.keys(config))
})

app.listen(8001, () => {
  console.log('Example app listening on port 8001!')
})
