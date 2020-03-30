import { ApolloServer, gql } from "apollo-server-express";
import express from "express"

import dbConfig from './config/database';
import mongoose from 'mongoose';

mongoose.connect(dbConfig.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (err) => {
    console.log(err);
    console.log('Could not connect to the database. Exiting now...');
    process.exit();
});


const Cat = mongoose.model('Cat', { name: String });

const app = express();

const typeDefs = gql `
    type Query {
        hello: String!
    }
`;

const resolvers = {
    Query: {
        hello: () => "hello"
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers
});

server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
    console.log('server is ready')
);