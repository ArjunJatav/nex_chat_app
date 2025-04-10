import { io } from "socket.io-client";
import { chatBaseUrl } from "./Constant/Api";

let socketInstance = null;
export const socketInit = () => {
  if (!socketInstance) {
    socketInstance = io(chatBaseUrl, {
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
      socketInstance = null;
    }
  } catch (error) {
    return;
  }
};

export const socket = socketInit();
