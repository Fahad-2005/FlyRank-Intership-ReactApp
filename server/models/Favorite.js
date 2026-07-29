import mongoose from 'mongoose'

const favoriteSchema = new mongoose.Schema(
  {
    // Scopes favorites per browser/device until real user accounts exist
    clientId: { type: String, required: true, trim: true, index: true },
    city: { type: String, required: true, trim: true },
    country: { type: String, default: '', trim: true },
    temperature: { type: Number },
    condition: { type: String },
    weatherCode: { type: Number },
    humidity: { type: Number },
    windSpeed: { type: Number },
    rainProbability: { type: Number },
  },
  { timestamps: true },
)

favoriteSchema.index({ clientId: 1, city: 1, country: 1 }, { unique: true })

export default mongoose.model('Favorite', favoriteSchema)
