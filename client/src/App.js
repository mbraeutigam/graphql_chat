import React from "react";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

import Chat from "./Chat";
import "./App.css";

const client = new ApolloClient({
  uri: "http://localhost:8000/graphql",
  cache: new InMemoryCache(),
});

function App() {
  return (
    <div className="App">
      <ApolloProvider client={client}>
        <Chat />
      </ApolloProvider>
    </div>
  );
}

export default App;
