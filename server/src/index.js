const express = require("express");
const http = require("http");
const { ApolloServer, gql, PubSub } = require("apollo-server-express");
const GraphQLISODate = require("graphql-iso-date");
const { GraphQLDateTime } = GraphQLISODate;

const PORT = 8000;
const pubsub = new PubSub();

const messages = [];
const MESSAGE_ADDED = "MESSAGE_ADDED";
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
      const id = messages.length;
      const { user, content } = args;
      const dataset = {
        id,
        user,
        content,
        date: new Date(),
      };
      messages.push(dataset);
      subscribers.forEach((fn) => fn());
      // pubsub.publish(MESSAGE_ADDED, { messageAdded: dataset });
      return id;
    },
  },
  Subscription: {
    messages: {
      subscribe: (parent, arg, { pubsub }) => {
        onMessageUpdates(() => pubsub.publish(MESSAGE_ADDED, { messages }));
        setTimeout(() => {
          // on subscribe send messages instantly
          pubsub.publish(MESSAGE_ADDED, { messages });
        }, 0);
        return pubsub.asyncIterator([MESSAGE_ADDED]);
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
