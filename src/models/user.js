import mongoose from 'mongoose';

const UserSchema = mongoose.Schema({
    username: {
        type: String
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: true
    },
    password: {
        type: String
    }
})

export const User = mongoose.model('User', UserSchema);