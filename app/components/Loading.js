import React from "react";

function Loading({ message = "Loading..." }) {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="flex flex-col my-auto items-center space-y-4 ">
        <div className="w-10 h-10 border-4 border-blue-500  border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  );
}

export default Loading;
