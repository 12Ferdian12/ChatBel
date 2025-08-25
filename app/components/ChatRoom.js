import React, { useState, useEffect, useRef } from "react";
import MessageCard from "./MessageCard";
import MessageInput from "./MessageInput";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import axios from "axios";

function ChatRoom({ selectedChatroom }) {
  const me = selectedChatroom?.myData;
  const other = selectedChatroom?.otherData;
  const chatRoomId = selectedChatroom?.id;

  const [message, setMessage] = useState([]);
  const [messages, setMessages] = useState([]);
  const messagesContainerRef = useRef(null);
  const [image, setImage] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  //get messages
  useEffect(() => {
    if (!chatRoomId) return;
    const unsubscribe = onSnapshot(
      query(
        collection(firestore, "messages"),
        where("chatRoomId", "==", chatRoomId)
      ),
      (snapshot) => {
        const messages = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => {
            // Sort by time ascending (oldest first)
            if (!a.time || !b.time) return 0;
            return a.time.toMillis() - b.time.toMillis();
          });
        //console.log(messages);
        setMessages(messages);
      }
    );

    return unsubscribe;
  }, [chatRoomId]);

  //put messages in db
  const sendMessage = async () => {
    if (message === "" || isSending) return;

    const newMessage = {
      chatRoomId: chatRoomId,
      sender: me.id,
      content: message,
      emailSender: me.email,
    };

    try {
      // Set AI thinking
      setIsSending(true);
      setIsThinking(true);

      // Send to external API
      await axios.post(
        "https://n8n-krjfuxilwis5.cica.sumopod.my.id/webhook/abc44ece-f7e2-49f9-aa11-f23611c72b98",
        newMessage
      );

      // Update chatroom last message
      const chatroomRef = doc(firestore, "chatrooms", chatRoomId);
      await updateDoc(chatroomRef, {
        lastMessage: message || "Image",
      });

      // Clear input
      setMessage("");
      setImage("");
    } catch (error) {
      console.error("Error sending message:", error.message);
    } finally {
      // Turn off thinking
      setIsThinking(false);
      setIsSending(false);
    }

    // Scroll to bottom
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  return (
    <div className="flex flex-col h-[90vh] w-full bg-LW text-DB">
      {/* Messages container with overflow and scroll */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-scroll sm:p-10 p-5"
      >
        {messages?.map((message) => (
          <MessageCard
            key={message.id}
            message={message}
            me={me}
            other={other}
          />
        ))}
        {isThinking && (
          <div className="text-gray-500 italic mt-2">AI is thinking...</div>
        )}
      </div>

      {/* Input box at the bottom */}
      <MessageInput
        sendMessage={sendMessage}
        message={message}
        setMessage={setMessage}
        image={image}
        setImage={setImage}
        isSending={isSending}
      />
    </div>
  );
}

export default ChatRoom;
