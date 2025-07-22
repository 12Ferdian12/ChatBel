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
    // Check if the message is not empty
    if (message === "") {
      return;
    }

    const newMessage = {
      chatRoomId: chatRoomId,
      sender: me.id,
      content: message,
      // time: new Date().toISOString(),
    };

    try {
      // 2. Kirim ke API eksternal
      await axios.post(
        "https://n8n-krjfuxilwis5.cica.sumopod.my.id/webhook-test/abc44ece-f7e2-49f9-aa11-f23611c72b98",
        newMessage
      );

      // 3. Update chatroom last message
      const chatroomRef = doc(firestore, "chatrooms", chatRoomId);
      await updateDoc(chatroomRef, {
        lastMessage: message ? message : "Image",
      });

      // 4. Bersihkan input
      setMessage("");
      setImage("");
    } catch (error) {
      console.error("Error sending message:", error.message);
    }

    // Scroll ke bawah
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  return (
    <div className="flex flex-col h-[90vh] w-full bg-white dark:bg-gray-800">
      {/* Messages container with overflow and scroll */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-scroll p-10">
        {messages?.map((message) => (
          <MessageCard
            key={message.id}
            message={message}
            me={me}
            other={other}
          />
        ))}
      </div>

      {/* Input box at the bottom */}
      <MessageInput
        sendMessage={sendMessage}
        message={message}
        setMessage={setMessage}
        image={image}
        setImage={setImage}
      />
    </div>
  );
}

export default ChatRoom;
