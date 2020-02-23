import express from 'express'

const router = express.Router()

router.get('/:index', async (req, res, next) => {
  res.send("Sending back some data")
})

export default router
