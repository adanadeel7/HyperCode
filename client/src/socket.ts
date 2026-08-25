import { io } from "socket.io-client";
import { BACKEND_URL as backendUrl } from "./config";

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
