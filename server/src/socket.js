import {io} from "socket.io-client"
import dotenv from "dotenv"

export const initSocket = async() => {
    const options = { 
        'force new connection' : true, 
        reconnectionAttempt : 'Infinity', 
        timeout: 10000, 
        transport : ['websocket']

    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
    return io(backendUrl,options)
}