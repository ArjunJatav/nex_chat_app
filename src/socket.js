import { io } from "socket.io-client";
import { socketUrl } from "./Constant/Api";

let socketInstance = null;
export const socketInit = () => {
  if (!socketInstance) {
    socketInstance = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      serveClient: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 6000,
      reconnectionAttempts: Infinity,
      timeout: 10000,
      transports: ["websocket"],
      upgrade: false,
      rememberUpgrade: true,
    });
    if(globalThis.chatUserId){
      socketInstance.emit("join", { id: globalThis.chatUserId });
    }
    return socketInstance;
  } else {
    return socketInstance;
  }
};

export const socketDisconnect = () => {
  try {
    if (socketInstance) {
      console.log("yes disconnect 1")
      socketInstance = null;
    }
  } catch (error) {
    console.log("yes disconnect")
    return;
  }
};

export const socket = socketInit();
