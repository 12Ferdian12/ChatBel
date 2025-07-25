import React from "react";
import moment from "moment";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { InlineMath, BlockMath } from "react-katex";

import "katex/dist/katex.min.css";

// import { marked } from "marked";

function MessageCard({ message, me }) {
  const isMessageFromMe = message.sender === me.id;

  const formatTimeAgo = (timestamp) => {
    const date = timestamp?.toDate();
    const momentDate = moment(date);
    return momentDate.fromNow();
  };

  return (
    <div
      key={message.id}
      className={`flex mb-4 ${
        isMessageFromMe ? "justify-end" : "justify-start"
      }`}
    >
      {/* Avatar on the left or right based on the sender */}
      <div className={`w-10 h-10 ${isMessageFromMe ? "ml-2 mr-2" : "mr-2"}`}>
        {isMessageFromMe && (
          <img
            className="w-full h-full object-cover rounded-full"
            src={me.avatarUrl}
            alt="Avatar"
          />
        )}
        {!isMessageFromMe && (
          // bot avatar
          <img
            className="w-full h-full object-cover rounded-full"
            src={
              "https://media.istockphoto.com/id/1329751110/vector/chatbot-concept-dialogue-help-service.jpg?s=612x612&w=0&k=20&c=5aLsLEghDrDRjZ_bu-kAaSLU5dVv56g688HlCtR_TYA="
            }
            alt="Avatar"
          />
        )}
      </div>

      {/* Message bubble on the right or left based on the sender */}
      <div
        className={` text-white p-2 rounded-md ${
          isMessageFromMe ? "bg-blue-500 self-end" : "bg-[#19D39E] self-start"
        }`}
      >
        {message.image && (
          <img src={message.image} className="max-h-60 w-60 mb-4" />
        )}
        {/* <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: marked(message.content) }}
        /> */}
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          components={{
            math({ value }) {
              return <BlockMath math={value ?? ""} />;
            },
            inlineMath({ value }) {
              return <InlineMath math={value ?? ""} />;
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
        <div className="text-xs text-gray-200">
          {formatTimeAgo(message.time)}
        </div>
      </div>
    </div>
  );
}

export default MessageCard;
