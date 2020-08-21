import React, { useState } from "react";
import { Form, Input, Button } from "antd";
import { gql, useMutation } from "@apollo/client";

const POST_MESSAGE = gql`
  mutation($user: String!, $content: String!) {
    postMessage(user: $user, content: $content)
  }
`;

const ChatInputForm = (props) => {
  const [form] = Form.useForm();
  const { user } = props;
  const [postMessage] = useMutation(POST_MESSAGE);

  const onFinish = (values) => {
    console.log(values);
    postMessage({
      variables: { user: values.name, content: values.content },
    });
  };

  const onReset = () => {
    form.resetFields();
  };

  return (
    <Form layout="inline" form={form} name="chat-input" onFinish={onFinish}>
      <Form.Item
        name="name"
        label="Name"
        rules={[{ required: true, message: "Name is required" }]}
        initialValue={user}>
        <Input placeholder="Please enter a name..." />
      </Form.Item>
      <Form.Item
        name="content"
        label="Message"
        rules={[{ required: true, message: "Message is required" }]}>
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

export default ChatInputForm;
