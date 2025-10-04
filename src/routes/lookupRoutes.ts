// src/routes/lookupRoutes.ts
import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import {
  getManufacturers,
  getStorageLocations,
  getReagentTypes,
  getLatestExchangeRate,
} from '../controllers/lookupController'

const lookupRoutes = Router()

lookupRoutes.get('/latest-rate', getLatestExchangeRate)

lookupRoutes.use(authMiddleware)
lookupRoutes.get('/manufacturers', getManufacturers)
lookupRoutes.get('/storage-locations', getStorageLocations)
lookupRoutes.get('/reagent-types', getReagentTypes)

export default lookupRoutes
