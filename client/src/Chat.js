import React, { useState } from "react";

import "./Chat.css";
import Messages from "./Messages";
import ChatInputForm from "./ChatInputForm";

const Chat = () => {
  const [chatMessage, setChatMessage] = useState({ user: "Marc", content: "" });
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <ChatInputForm user={chatMessage.user} />
      </div>
      <div>
        <Messages user={chatMessage.user} />
      </div>
    </div>
  );
};

export default Chat;
