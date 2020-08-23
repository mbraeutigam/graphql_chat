const express = require("express");
const http = require("http");
const { ApolloServer, gql, PubSub } = require("apollo-server-express");
const GraphQLISODate = require("graphql-iso-date");
const { GraphQLDateTime } = GraphQLISODate;
const { v4: uuidv4 } = require("uuid");

const PORT = 8000;
const pubsub = new PubSub();

let messages = [];
const MESSAGES = "MESSAGES";
const subscribers = [];
const onMessageUpdates = (fn) => subscribers.push(fn);

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
    deleteMessage(id: String!): Boolean
  }

  type Subscription {
    messages: [Message!]
  }
`;

const resolvers = {
  GraphQLDateTime,
  Query: {
    messages: () => messages,
  },
  Mutation: {
    postMessage: (parent, args, context) => {
      const id = uuidv4();
      const { user, content } = args;
      const dataset = {
        id,
        user,
        content,
        date: new Date(),
      };
      messages.push(dataset);
      subscribers.forEach((fn) => fn());
      return id;
    },
    deleteMessage: (parent, args, context) => {
      const { id } = args;
      messages = messages.filter((e) => e.id !== id);
      subscribers.forEach((fn) => fn());
    },
  },
  Subscription: {
    messages: {
      subscribe: (parent, arg, { pubsub }) => {
        onMessageUpdates(() => pubsub.publish(MESSAGES, { messages }));
        setTimeout(() => {
          // on subscribe send messages instantly
          pubsub.publish(MESSAGES, { messages });
        }, 0);
        return pubsub.asyncIterator([MESSAGES]);
      },
    },
  },
};

const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: { pubsub },
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
