import { io } from "socket.io-client";

const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const backendUrl = import.meta.env.VITE_BACKEND_URL || (isLocalhost ? "http://localhost:8000" : "https://hypercode-18ib.onrender.com");

interface SocketOptions { 
    'force new connection': boolean;
  reconnectionAttempts: number; 
  timeout: number;
  transports: string[];
}



export const initSocket = async () => {
    const options : SocketOptions = { 
        'force new connection': true, 
        reconnectionAttempts: Infinity, 
        timeout: 10000, 
        transports: ['websocket']
    };

    return io(backendUrl, options);
};
