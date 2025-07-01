"use client";
import React, { useEffect, useState } from "react";
import { app, firestore } from "@/lib/firebase";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import Users from "./components/Users";
import ChatRoom from "./components/ChatRoom";

function page() {
  const auth = getAuth(app);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [selectedChatroom, setSelectedChatroom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userChatrooms, setUserChatrooms] = useState([]);

  useEffect(() => {
    // Use onAuthStateChanged to listen for changes in authentication state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(firestore, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setUser(data);
        } else {
          console.log("No such document!");
        }
      } else {
        setUser(null);
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

  //get chatrooms
  useEffect(() => {
    setLoading(true);
    if (!user?.id) return;
    const chatroomsQuery = query(
      collection(firestore, "chatrooms"),
      where("users", "array-contains", user.id)
    );
    const unsubscribeChatrooms = onSnapshot(chatroomsQuery, (snapshot) => {
      const chatrooms = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLoading(false);
      setUserChatrooms(chatrooms);
      console.log("Chatrooms:", chatrooms);
    });

    console.log("User Data:", user);

    // Cleanup function for chatrooms
    return () => unsubscribeChatrooms();
  }, [user]);

  useEffect(() => {
    // Early return if user is not set
    if (!user) return;
    // Check if a chatroom already exists for the user
    createChat(user);
  }, [user]);

  // Early return after all hooks
  if (user == null) return <div className="text-4xl">Loading...</div>;

  // Logout function
  const logoutClick = () => {
    signOut(auth)
      .then(() => {
        router.push("/login");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  // Create a chatroom
  const createChat = async (user) => {
    // Check if a chatroom already exists for these users
    const existingChatroomsQuery = query(
      collection(firestore, "chatrooms"),
      where("users", "==", [user.id])
    );

    try {
      const existingChatroomsSnapshot = await getDocs(existingChatroomsQuery);

      if (existingChatroomsSnapshot.docs.length > 0) {
        // Chatroom already exists, handle it accordingly (e.g., show a message)
        console.log("Chatroom already exists for these users.");
        // toast.error("Chatroom already exists for these users.");
        openChat({
          id: existingChatroomsSnapshot.docs[0].id,
        });
        return;
      }

      // Chatroom doesn't exist, proceed to create a new one
      const usersData = {
        [user.id]: user,
      };

      const chatroomData = {
        users: [user.id],
        usersData,
        timestamp: serverTimestamp(),
        lastMessage: null,
      };

      const chatroomRef = await addDoc(
        collection(firestore, "chatrooms"),
        chatroomData
      );
      console.log("Chatroom created with ID:", chatroomRef.id);
      // setActiveTab("chatrooms");
      openChat({ id: chatroomRef.id });
    } catch (error) {
      console.error("Error creating or checking chatroom:", error);
    }
  };

  //open chatroom
  const openChat = async (chatroom) => {
    const data = {
      id: chatroom.id,
      myData: user,
    };
    setSelectedChatroom(data);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b p-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-800">Chat App</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">
            Welcome, {user?.name || user?.email}
          </span>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
            onClick={logoutClick}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Left side users */}
        {/* <div className="flex-shrink-0 w-3/12">
        <Users userData={user} setSelectedChatroom={setSelectedChatroom}/>
      </div> */}

        {/* Right side chat room */}
        <div className="flex-grow w-9/12">
          {selectedChatroom ? (
            <>
              <ChatRoom user={user} selectedChatroom={selectedChatroom} />
            </>
          ) : (
            <>
              <div className="flex items-center justify-center h-full">
                <div className="text-2xl text-gray-400">Select a chatroom</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default page;
