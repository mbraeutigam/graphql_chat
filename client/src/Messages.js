import React, { useEffect } from "react";
import { gql, useSubscription, useMutation } from "@apollo/client";
import { Timeline } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import { format } from "date-fns";

// GraphQL subscription queries & mutations
const GET_MESSAGES = gql`
  subscription {
    messages {
      id
      user
      message
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
  const [deleteMessage] = useMutation(DELETE_MESSAGE);

  if (!data) {
    return null;
  }

  return (
    <div className="chat__messages">
      <Timeline mode="alternate" pending>
        {data.messages.map(({ id, user: messageUser, message, date }) => (
          <Timeline.Item
            className="chat__message"
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
                <CloseCircleOutlined
                  onClick={() =>
                    deleteMessage({
                      variables: { id },
                    })
                  }
                />
              ) : null
            }
          >
            {message}
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );
};

export default Messages;
