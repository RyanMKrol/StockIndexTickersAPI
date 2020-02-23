import express from 'express'
import { fetchTickers } from './../api/tickers'

const router = express.Router()

router.get('/:index', async (req, res, next) => {
  res.send(fetchTickers())
})

export default router
