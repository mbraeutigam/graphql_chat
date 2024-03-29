import React from "react";
import { Form, Input, Button } from "antd";
import { gql, useMutation } from "@apollo/client";

const POST_MESSAGE = gql`
  mutation($user: String!, $message: String!, $room: String) {
    postMessage(user: $user, message: $message, room: $room)
  }
`;

const ChatInputForm = (props) => {
  const [form] = Form.useForm();
  const { chatMessage, setChatMessage } = props;
  const { user } = chatMessage;
  const [postMessage] = useMutation(POST_MESSAGE);

  const onFinish = (values) => {
    postMessage({
      variables: { user: values.name, message: values.message },
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
        rules={[{ required: true, message: "Benötigtes Feld!" }]}
        initialValue={user}>
        <Input
          placeholder="Ihr Name..."
          style={{ width: 150 }}
          onChange={(e) =>
            setChatMessage({ ...chatMessage, user: e.target.value })
          }
        />
      </Form.Item>
      <Form.Item
        name="message"
        label="Nachricht"
        rules={[
          {
            required: true,
            message: "Benötigtes Feld!",
          },
        ]}>
        <Input style={{ width: 200 }} placeholder="Ihre Nachricht..." />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Abschicken
        </Button>{" "}
        {/* <Button htmlType="button" onClick={onReset}>
          Zurücksetzen
        </Button> */}
      </Form.Item>
    </Form>
  );
};

export default ChatInputForm;
