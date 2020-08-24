const express = require("express");
const http = require("http");
const { ApolloServer, gql, PubSub } = require("apollo-server-express");
const GraphQLISODate = require("graphql-iso-date");
const { GraphQLDateTime } = GraphQLISODate;
const { v4: uuidv4 } = require("uuid");

const PORT = 8000;
const pubsub = new PubSub();

const MESSAGES = "MESSAGES";
const subscribers = [];
const onMessageUpdates = (fn) => subscribers.push(fn);

const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "./db/chat.sqlite",
  },
  useNullAsDefault: true,
});
const TBL_CHATMESSAGES = "ChatMessages";

const typeDefs = gql`
  scalar GraphQLDateTime

  type Message {
    id: ID!
    user: String!
    message: String!
    date: GraphQLDateTime!
  }

  type Query {
    messages: [Message!]
  }

  type Mutation {
    postMessage(user: String!, message: String!, room: String): ID!
    deleteMessage(id: String!): Boolean
  }

  type Subscription {
    messages: [Message!]
  }
`;

const getMessages = async (room) => {
  const result = await knex(TBL_CHATMESSAGES).where("room", room);
  return result;
};

const resolvers = {
  GraphQLDateTime,
  Query: {
    messages: async (parent, args, context, info) => {
      const { room = "default" } = args;
      const msgs = await getMessages(room);

      return msgs;
    },
  },
  Mutation: {
    postMessage: async (parent, args, context, info) => {
      const id = uuidv4();
      const { user, message, room = "default" } = args;
      const dataset = {
        id,
        user,
        message,
        date: new Date().toISOString(),
        room,
      };

      try {
        await knex(TBL_CHATMESSAGES).insert(dataset);
        subscribers.forEach((fn) => fn());
      } catch (error) {
        console.error(error);
      }
      return id;
    },
    deleteMessage: async (parent, args, context, info) => {
      const { id } = args;

      try {
        await knex(TBL_CHATMESSAGES).delete().where("id", id);
        console.log(`Deleted ${id}`);
        subscribers.forEach((fn) => fn());
      } catch (error) {
        console.error(error);
      }
    },
  },
  Subscription: {
    messages: {
      subscribe: async (parent, args, { pubsub }, info) => {
        // currently NO USE of withFilter() - everybody will get notified about
        const { room = "default" } = args;

        onMessageUpdates(async () => {
          const messages = await getMessages(room);
          pubsub.publish(MESSAGES, { messages });
        });
        setTimeout(async () => {
          // on subscribe send messages instantly
          const messages = await getMessages(room);
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
