import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'
import Favorite from './models/Favorite.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

function getClientId(req) {
  const headerId = req.headers['x-client-id']
  const bodyId = req.body?.clientId
  const queryId = req.query?.clientId
  const clientId = String(headerId || bodyId || queryId || '').trim()
  return clientId || null
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Weather API is running' })
})

app.get('/api/favorites', async (req, res) => {
  try {
    const clientId = getClientId(req)
    if (!clientId) {
      return res.status(400).json({ message: 'Missing x-client-id header' })
    }

    const favorites = await Favorite.find({ clientId }).sort({ createdAt: -1 })
    res.json(favorites)
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load favorites' })
  }
})

app.post('/api/favorites', async (req, res) => {
  try {
    const clientId = getClientId(req)
    if (!clientId) {
      return res.status(400).json({ message: 'Missing x-client-id header' })
    }

    const {
      city,
      country,
      temperature,
      condition,
      weatherCode,
      humidity,
      windSpeed,
      rainProbability,
    } = req.body

    if (!city) {
      return res.status(400).json({ message: 'City is required' })
    }

    const existing = await Favorite.findOne({
      clientId,
      city,
      country: country || '',
    })
    if (existing) {
      return res.status(409).json({ message: 'City already saved', favorite: existing })
    }

    const favorite = await Favorite.create({
      clientId,
      city,
      country: country || '',
      temperature,
      condition,
      weatherCode,
      humidity,
      windSpeed,
      rainProbability,
    })

    res.status(201).json(favorite)
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to save favorite' })
  }
})

app.delete('/api/favorites/:id', async (req, res) => {
  try {
    const clientId = getClientId(req)
    if (!clientId) {
      return res.status(400).json({ message: 'Missing x-client-id header' })
    }

    const deleted = await Favorite.findOneAndDelete({
      _id: req.params.id,
      clientId,
    })
    if (!deleted) {
      return res.status(404).json({ message: 'Favorite not found' })
    }
    res.json({ message: 'Favorite removed', id: req.params.id })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to remove favorite' })
  }
})

async function start() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.error('Missing MONGODB_URI in environment / server/.env')
    process.exit(1)
  }

  try {
    await mongoose.connect(uri)
    console.log('Connected to MongoDB')

    // Drop old global unique index from before per-client favorites
    try {
      await Favorite.collection.dropIndex('city_1_country_1')
      console.log('Dropped old city+country unique index')
    } catch {
      // Index may already be gone — ignore
    }
    await Favorite.syncIndexes()

    const host = process.env.HOST || '0.0.0.0'
    app.listen(PORT, host, () => {
      console.log(`API running on http://${host}:${PORT}`)
    })
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
    process.exit(1)
  }
}

start()
