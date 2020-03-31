import { verify } from 'jsonwebtoken';
import { User } from '../models/user';
import { createToken } from '../services/tokenService';

module.exports = {
    authMiddleware: async(req, res, next) => {
        const refreshToken = req.cookies["refreshToken"];
        const accessToken = req.cookies["accessToken"];
        if (!refreshToken && !accessToken) {
            return next();
        }

        try {
            const data = verify(accessToken, process.env.JWT_SECRET);
            req.userId = data.userId;
            return next();
        } catch {}


        if (!refreshToken) {
            return next();
        }

        let data;
        try {
            data = verify(refreshToken, process.env.JWT_SECRET);
        } catch {
            return next();
        }

        const user = await User.findOne({ '_id': data.userId });
        if (!user || user.refreshTokenCounter !== data.refreshTokenCounter) {
            return next();
        }

        const tokens = createToken(user);

        res.cookie("refreshToken", tokens.refreshToken);
        res.cookie("accessToken", tokens.accessToken);
        req.userId = user.id;

        next();
    }
}