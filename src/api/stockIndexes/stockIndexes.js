import indexData from './../../../config/indexes'

function fetchStockIndexes() {
  return Object.keys(indexData)
}

export { fetchStockIndexes }
