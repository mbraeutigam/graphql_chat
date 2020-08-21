import React from "react";
import {
  ApolloClient,
  InMemoryCache,
  gql,
  ApolloProvider,
  useQuery,
} from "@apollo/client";
import { Timeline } from "antd";

import "./Chat.css";

const client = new ApolloClient({
  uri: "http://localhost:8000/graphql",
  cache: new InMemoryCache(),
});

const GET_MESSAGES = gql`
  query {
    messages {
      id
      user
      content
      date
    }
  }
`;

const Messages = ({ user }) => {
  const { data } = useQuery(GET_MESSAGES);
  if (!data) {
    return null;
  }

  return (
    <div>
      <Timeline mode="alternate" pending>
        {data.messages.map(({ id, user: messageUser, content, date }) => (
          <Timeline.Item
            key={id}
            position={user === messageUser ? "left" : "right"}
            label={
              <div>
                <b>{messageUser}</b>
                <br />
                {date}
              </div>
            }
          >
            {content}
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );
};

function Chat() {
  return (
    <div>
      <Messages user="Marc" />
    </div>
  );
}

export default () => (
  <ApolloProvider client={client}>
    <Chat />
  </ApolloProvider>
);
