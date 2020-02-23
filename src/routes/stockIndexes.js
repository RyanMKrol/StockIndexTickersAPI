import express from 'express'
import { fetchStockIndexes } from './../api/stockIndexes'

const router = express.Router()

router.get('/', async (req, res, next) => {
  res.send(fetchStockIndexes())
})

export default router
