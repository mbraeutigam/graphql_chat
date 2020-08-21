const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const GraphQLISODate = require("graphql-iso-date");
const { GraphQLDateTime } = GraphQLISODate;

const messages = [];

const typeDefs = gql`
  scalar GraphQLDateTime

  type Message {
    id: ID!
    user: String!
    content: String!
    date: GraphQLDateTime!
  }

  type Query {
    messages: [Message!]
  }

  type Mutation {
    postMessage(user: String!, content: String!): ID!
  }
`;

const resolvers = {
  GraphQLDateTime,
  Query: {
    messages: () => messages,
  },
  Mutation: {
    postMessage: (parent, { user, content }) => {
      const id = messages.length;
      messages.push({
        id,
        user,
        content,
        date: new Date(),
      });
      return id;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
server.applyMiddleware({ app });

app.listen({ port: 8000 }, () =>
  console.log(`🚀 Server ready at http://localhost:8000${server.graphqlPath}`)
);
