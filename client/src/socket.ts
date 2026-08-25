import { io } from "socket.io-client";

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

    const backendUrl = import.meta.env.VITE_BACKEND_URL || (import.meta.env.PROD ? "https://hypercode-18ib.onrender.com" : "http://localhost:8000");
    return io(backendUrl, options);
};
