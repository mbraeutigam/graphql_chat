const express = require("express");
const http = require("http");
const { ApolloServer, gql, PubSub } = require("apollo-server-express");
const GraphQLISODate = require("graphql-iso-date");
const { GraphQLDateTime } = GraphQLISODate;

const PORT = 8000;
const pubsub = new PubSub();

const messages = [];
const MESSAGE_ADDED = "MESSAGE_ADDED";

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

  type Subscription {
    messageAdded: Message
  }
`;

const resolvers = {
  GraphQLDateTime,
  Query: {
    messages: () => messages,
  },
  Mutation: {
    postMessage: (parent, args, context) => {
      const id = messages.length;
      const { user, content } = args;
      const dataset = {
        id,
        user,
        content,
        date: new Date(),
      };
      messages.push(dataset);

      pubsub.publish(MESSAGE_ADDED, { messageAdded: dataset });
      return id;
    },
  },
  Subscription: {
    messageAdded: {
      subscribe: () => pubsub.asyncIterator([MESSAGE_ADDED]),
    },
  },
};

const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // subscriptions: {
  //   onConnect: (connectionParams, webSocket, context) => {
  //     console.log(webSocket);
  //   },
  //   onDisconnect: (webSocket, context) => {
  //     console.log(webSocket);
  //   },
  // },
});

server.applyMiddleware({ app });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen(PORT, () => {
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  );
  console.log(
    `🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`
  );
});
