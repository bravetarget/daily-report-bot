import mongoose from 'mongoose';
export default mongoose.model('characters', {
    id: String,
    name: String,
    xp: Number,
    total_xp: Number,
    gold: Number,
    level: Number,
    rank: String,
    contributions: Number,
    checked_in: Boolean,
    enlisted: Boolean,
    latest_update: String,
    streak: Number,
    demerits: Number,
    previous_demerits: Number,
});