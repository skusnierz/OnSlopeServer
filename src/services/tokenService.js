import jwt from 'jsonwebtoken'

export const createToken = (user) => {
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '10s' })
    const refreshToken = jwt.sign({ userId: user.id, refreshTokenCounter: user.refreshTokenCounter }, process.env.JWT_SECRET, { expiresIn: '5d' })
    return { accessToken, refreshToken }
}