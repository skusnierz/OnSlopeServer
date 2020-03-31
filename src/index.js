import { ApolloServer } from "apollo-server-express";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import express from "express";
import mongoose from 'mongoose';
import dbConfig from './config/database';
import auth from './middlewares/auth';
import { resolvers } from "./resolvers";
import { typeDefs } from "./typeDefs";
dotenv.config({ path: '.env' });


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
    app.use(auth.authMiddleware);

    server.applyMiddleware({ app });

    app.listen({ port: 4000 }, () =>
        console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
    );
};

runServer();