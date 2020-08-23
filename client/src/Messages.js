import React, { useEffect } from "react";
import { gql, useSubscription, useMutation } from "@apollo/client";
import { Timeline } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import { format } from "date-fns";

const GET_MESSAGES = gql`
  subscription {
    messages {
      id
      user
      content
      date
    }
  }
`;

const DELETE_MESSAGE = gql`
  mutation($id: String!) {
    deleteMessage(id: $id)
  }
`;

const Messages = ({ user }) => {
  const { data } = useSubscription(GET_MESSAGES);
  const [delMsg] = useMutation(DELETE_MESSAGE);

  const deleteMessage = (id) => {
    delMsg({
      variables: { id },
    });
  };

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
            dot={
              messageUser === user ? (
                <CloseCircleOutlined onClick={() => deleteMessage(id)} />
              ) : null
            }>
            {content}
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );
};

export default Messages;
