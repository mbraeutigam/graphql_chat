import React, { useEffect } from "react";
import { gql, useSubscription } from "@apollo/client";
import { Timeline } from "antd";
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

const Messages = ({ user }) => {
  const { data } = useSubscription(GET_MESSAGES);

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
            }>
            {content}
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );
};

export default Messages;
