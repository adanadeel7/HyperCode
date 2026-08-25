import { createContext, useContext, useState, ReactNode } from "react";

interface User { 
    id?: string;
    _id?: string;
    name: string;
    email: string; 
}

interface AuthContextType { 
   user: User | null;
   setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProvider({children} : AuthProviderProps) { 
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                return JSON.parse(storedUser);
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
            }
        }
        const token = localStorage.getItem("token");
        if (token) {
            return { name: "Developer", email: "google-user@hypercode.dev" };
        }
        return null;
    });

    const setPersistedUser: React.Dispatch<React.SetStateAction<User | null>> = (value) => {
        setUser((prev) => {
            const next = typeof value === "function" ? value(prev) : value;
            if (next) {
                localStorage.setItem("user", JSON.stringify(next));
            } else {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
            }
            return next;
        });
    };

    return ( 
        <AuthContext.Provider value={{ user, setUser: setPersistedUser }}>
            {children}
        </AuthContext.Provider>
    );
}

function useAuth() { 
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}   

export { AuthProvider, useAuth };