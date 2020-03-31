import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { User } from './models/user';
import { ApolloServer } from "apollo-server-express";
import express from "express"
import { resolvers } from "./resolvers";
import { typeDefs } from "./typeDefs";
import cookieParser from "cookie-parser"
import dbConfig from './config/database';
import mongoose from 'mongoose';
import { verify } from 'jsonwebtoken';
import { createToken } from './services/tokenService';

mongoose.connect(dbConfig.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (err) => {
    console.log(err);
    console.log('Could not connect to the database. Exiting now...');
    process.exit();
});

const runServer = async() => {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req, res }) => ({ req, res })
    });

    const app = express();

    app.use(cookieParser());
    app.use(async(req, res, next) => {
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
    });

    server.applyMiddleware({ app });

    app.listen({ port: 4000 }, () =>
        console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
    );
};

runServer();