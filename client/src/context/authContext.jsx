import { createContext, useContext, useState } from "react";

const AuthContext = createContext()

function AuthProvider({children}) { 
    const [user,setUser] = useState(null)

    return ( 
        <AuthContext.Provider value={{user,setUser}}>
            {children}
        </AuthContext.Provider>
    )
}

function useAuth() { 
    return useContext(AuthContext);
}

export {AuthProvider, useAuth}