import { createContext, useContext, useState,ReactNode } from "react";


interface User { 
    id : string;
    name : string;
    email : string; 

}

interface AuthContextType { 
   user: User | null;
    setUser :React.Dispatch<React.SetStateAction<User | null>> 

}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode;
}


function AuthProvider({children} : AuthProviderProps) { 
    const [user, setUser] = useState<User | null>(null);

    return ( 
        <AuthContext.Provider value={{user,setUser}}>
            {children}
        </AuthContext.Provider>
    )
}

function useAuth() { 
    const context = useContext(AuthContext);
    if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
    
    return context
}   


    

export {AuthProvider, useAuth}