import { verify } from 'jsonwebtoken';
import { createToken } from '../services/tokenService';
import cookieParser from "cookie-parser"

export default (async(req, res, next) => {
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

    const user = await User.findOne(data.userId);
    if (!user || user.count !== data.count) {
        return next();
    }

    const tokens = createTokens(user);

    res.cookie("refresh-token", tokens.refreshToken);
    res.cookie("access-token", tokens.accessToken);
    req.userId = user.id;

    next();
});