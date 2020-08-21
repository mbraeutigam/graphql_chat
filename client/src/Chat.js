import React, { useState } from "react";
import {
  ApolloClient,
  InMemoryCache,
  gql,
  ApolloProvider,
  useQuery,
  useMutation,
} from "@apollo/client";
import { Form, Timeline, Input, Button } from "antd";
import { format } from "date-fns";

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

const POST_MESSAGE = gql`
  mutation($user: String!, $content: String!) {
    postMessage(user: $user, content: $content)
  }
`;

const Messages = ({ user }) => {
  const { data } = useQuery(GET_MESSAGES);
  if (!data) {
    return null;
  }

  return (
    <div className="chat__content">
      <Timeline mode="alternate" pending>
        {data.messages.map(({ id, user: messageUser, content, date }) => (
          <Timeline.Item
            key={id}
            position={user === messageUser ? "left" : "right"}
            label={
              <div>
                <b>{messageUser}</b>
                <br />
                {format(new Date(date), "yyyy-MM-dd hh:mm")}
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

const ChatInputForm = (props) => {
  const [form] = Form.useForm();
  const { user } = props;
  const [postMessage, { data }] = useMutation(POST_MESSAGE);

  const onFinish = (values) => {
    console.log(values);

    postMessage({ variables: { user: values.name, content: values.content } });
  };

  const onReset = () => {
    form.resetFields();
  };

  return (
    <Form layout="inline" form={form} name="chat-input" onFinish={onFinish}>
      <Form.Item
        name="name"
        label="Name"
        initialValue={user}
        rules={[{ required: true, message: "Name is required" }]}
      >
        <Input placeholder="Please enter a name..." />
      </Form.Item>
      <Form.Item
        name="content"
        label="Message"
        rules={[{ required: true, message: "Message is required" }]}
      >
        <Input placeholder="Please enter a message..." />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Send Message
        </Button>{" "}
        <Button htmlType="button" onClick={onReset}>
          Reset
        </Button>
      </Form.Item>
    </Form>
  );
};

const Chat = () => {
  const [user, setUser] = useState({ user: "Marc", content: "" });
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <ChatInputForm user={user.user} />
      </div>
      <div>
        <Messages user={user.user} />
      </div>
    </div>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <Chat />
  </ApolloProvider>
);
