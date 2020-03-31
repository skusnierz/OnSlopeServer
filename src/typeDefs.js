import { gql } from "apollo-server-express";

export const typeDefs = gql `
  type Query {
    hello: String!
    users: [User!]!
  }

  type User {
    id: ID!
    username: String!
    email: String!
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): User!,
    login(email: String!, password: String!): String!,
  }
`;