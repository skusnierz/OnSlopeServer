import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
console.log(process.env.JWT_SECRET);

import { ApolloServer, gql } from "apollo-server-express";
import express from "express"
import { resolvers } from "./resolvers";
import { typeDefs } from "./typeDefs";

import dbConfig from './config/database';
import mongoose from 'mongoose';

mongoose.connect(dbConfig.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (err) => {
    console.log(err);
    console.log('Could not connect to the database. Exiting now...');
    process.exit();
});

const runServer = async() => {
    const app = express();

    const server = new ApolloServer({
        typeDefs,
        resolvers
    });
    server.applyMiddleware({ app });

    app.listen({ port: 4000 }, () =>
        console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
    );
};

runServer();