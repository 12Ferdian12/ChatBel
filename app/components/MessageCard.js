import React from "react";
import moment from "moment";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import "katex/dist/katex.min.css";

function MessageCard({ message, me }) {
  const isMessageFromMe = message.sender === me.id;

  const formatTimeAgo = (timestamp) => {
    const date = timestamp?.toDate();
    const momentDate = moment(date);
    return momentDate.fromNow();
  };

  // Preprocess LaTeX content for proper rendering
  const preprocessLatex = (content) => {
    if (!content) return content;

    let processedContent = content;

    // Replace block math \[ and \] with $$ (opening and closing separately)
    // processedContent = processedContent.replace(/\\\[/g, "$$");
    // processedContent = processedContent.replace(/\\\]/g, "$$");
    // Replace inline math \( ... \) with $ ... $
    processedContent = processedContent.replace(
      /\\\(([\s\S]*?)\\\)/g,
      "$$$1$$"
    );

    processedContent = processedContent.replace(
      /\\\[([\s\S]*?)\\\]/g,
      "$$$$$1$$$"
    );

    // Replace LaTeX commands with double backslash
    // Replace \text{...} with just ...
    // processedContent = processedContent.replace(/\\text\{([^}]*)\}/g, "$1");
    processedContent = processedContent.replace(/\\frac/g, "\\\\frac");
    processedContent = processedContent.replace(/\\times/g, "\\\\times");
    processedContent = processedContent.replace(/\\sqrt/g, "\\\\sqrt");
    processedContent = processedContent.replace(/\\approx/g, "\\\\approx");
    processedContent = processedContent.replace(/\\cdot/g, "\\\\cdot");
    processedContent = processedContent.replace(/\\sin/g, "\\\\sin");
    processedContent = processedContent.replace(/\\cos/g, "\\\\cos");
    processedContent = processedContent.replace(/\\tan/g, "\\\\tan");
    processedContent = processedContent.replace(/\\theta/g, "\\\\theta");
    processedContent = processedContent.replace(/\\pi/g, "\\\\pi");
    processedContent = processedContent.replace(/\\sum/g, "\\\\sum");
    processedContent = processedContent.replace(/\\int/g, "\\\\int");
    processedContent = processedContent.replace(/\\infty/g, "\\\\infty");
    processedContent = processedContent.replace(/\\alpha/g, "\\\\alpha");
    processedContent = processedContent.replace(/\\beta/g, "\\\\beta");
    processedContent = processedContent.replace(/\\gamma/g, "\\\\gamma");
    processedContent = processedContent.replace(/\\delta/g, "\\\\delta");
    processedContent = processedContent.replace(/\\epsilon/g, "\\\\epsilon");
    processedContent = processedContent.replace(/\\lambda/g, "\\\\lambda");
    processedContent = processedContent.replace(/\\mu/g, "\\\\mu");
    processedContent = processedContent.replace(/\\sigma/g, "\\\\sigma");
    processedContent = processedContent.replace(/\\omega/g, "\\\\omega");

    return processedContent;
  };

  // console.log("MessageCard rendered", message.content);

  return (
    <div
      key={message.id}
      className={`flex mb-4 ${
        isMessageFromMe ? "justify-end" : "justify-start"
      }`}
    >
      {/* Avatar */}
      {!isMessageFromMe && (
        <div
          className={`w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] flex-shrink-0 mr-2`}
        >
          <img
            className="object-cover w-full h-full rounded-full"
            src={"../ICON.png"}
            alt="Avatar"
          />
        </div>
      )}

      {/* Message bubble */}
      <div
        className={`py-2 px-3 rounded-xl max-w-[80%] ${
          isMessageFromMe
            ? "bg-CR text-DB shadow-md self-end"
            : "bg-CR text-DB shadow-md self-start"
        }`}
      >
        {message.image && (
          <img src={message.image} className="mb-4 rounded max-h-60 w-60" />
        )}
        <div className="prose-sm prose break-words max-w-none prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              code({ inline, children, className }) {
                return inline ? (
                  <code className="px-1 text-yellow-300 bg-gray-800 rounded">
                    {children}
                  </code>
                ) : (
                  <pre className="p-3 overflow-auto text-sm text-green-400 bg-black rounded">
                    <code>{children}</code>
                  </pre>
                );
              },
            }}
          >
            {preprocessLatex(message.content)}
            {/* {message.content} */}
          </ReactMarkdown>
          {/* <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {"$$ L = \\frac{1}{2} \\rho v^2 S C_L $$"}
          </ReactMarkdown> */}
        </div>
        <div className="mt-1 text-xs text-DB">
          {formatTimeAgo(message.time)}
        </div>
      </div>
    </div>
  );
}

export default MessageCard;
