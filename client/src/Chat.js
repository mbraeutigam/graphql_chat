import React from "react";
import {
  ApolloClient,
  InMemoryCache,
  gql,
  ApolloProvider,
  useQuery,
} from "@apollo/client";

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
    }
  }
`;

const Messages = ({ user }) => {
  const { data } = useQuery(GET_MESSAGES);
  if (!data) {
    return null;
  }

  return JSON.stringify(data);
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
