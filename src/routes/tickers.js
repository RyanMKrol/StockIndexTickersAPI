import express from 'express'
import { fetchTickers } from './../api/tickers'

const router = express.Router()

router.get('/:index', async (req, res, next) => {
  const tickers = await fetchTickers(req.params.index)
  res.send(tickers)
})

export default router
