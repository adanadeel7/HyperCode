import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext";


interface User {
  _id?: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

interface AuthResponse {
  message?: string;
  user: User;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

function Login() {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { name, email, password } = formData;

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const { setUser } = useAuth() as AuthContextType;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(()=> { 
    const urlParams = new URLSearchParams(location.search)
    const token = urlParams.get("token")


    if (token) { 
      localStorage.setItem("token",token)

      setUser({name : "Developer", email : "google-user@example.com"})
      toast.success("Logged in with Google!");
      navigate("/room", { replace: true })
    }
  },[location, navigate, setUser])


  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try { 
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: "POST", 
        credentials: "include", 
        headers: {
          "Content-Type": "application/json"
        }, 
        body: JSON.stringify({
          email, 
          password,
        })
      });

      const data = (await response.json()) as AuthResponse; 

      if (!response.ok) { 
        toast.error(data.message || "Login Failed");
        return;
      }

      toast.success("Logged in Successfully");
      setUser(data.user);
      navigate("/room");
    } catch (error: unknown) { 
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };


  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 

    try { 
      const displayName = name.trim() || email.split("@")[0] || "Developer";
      const response = await fetch(`${backendUrl}/api/auth/register`, { 
        method: "POST", 
        credentials: "include", 
        headers: {
          "Content-Type": "application/json"
        }, 
        body: JSON.stringify({
          name: displayName,
          email,
          password,
        })
      });
      
      const data = (await response.json()) as AuthResponse; 

      if (!response.ok) { 
        toast.error(data.message || "Registration failed");
        return;
      }

      toast.success("Account Created");
      setUser(data.user);
      navigate("/room");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!glowRef.current) return;

    const xTo = gsap.quickTo(glowRef.current, "x", {
      duration: 0.4,
      ease: "power3.out",
    });
    const yTo = gsap.quickTo(glowRef.current, "y", {
      duration: 0.4,
      ease: "power3.out",
    });

    const handleMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <div
        ref={glowRef}
        className="pointer-events-none fixed w-96 h-96 rounded-full bg-[#63f7ff] opacity-5 blur-[100px] z-10"
        style={{ transform: "translate(-50%, -50%)", top: 0, left: 0 }}
      />

      <div
        className="w-full min-h-screen bg-[#0b1324] relative overflow-hidden z-0 flex flex-col justify-center"
        style={{
          backgroundSize: "40px 40px",
          backgroundImage: `
            linear-gradient(to right, rgba(0, 220, 229, 0.04) 1px, transparent 1px), 
            linear-gradient(to bottom, rgba(0, 220, 229, 0.04) 1px, transparent 1px)`,
        }}
      >
        <div className="relative z-20 w-full max-w-md mx-auto py-12 px-6">
          <div className="text-center pb-8">
            <h1 className="font-headline text-[32px] font-bold text-[#cbdfe2]">
              HyperCode
            </h1>
            <h2 className="font-body text-[14px] text-[#808e93]">
              Collaborative engineering space
            </h2>
          </div>

          <div className="bg-[#171f31]/60 backdrop-blur-md border border-[#3a494a]/50 p-8 rounded-xl shadow-xl">
            <div className="flex flex-col items-start w-full pb-6">
              <h1 className="font-headline text-[#dae2fb] text-[20px] font-bold">
                {isRegister ? "Register" : "Login"}
              </h1>
            </div>

            <form onSubmit={isRegister ? handleRegister : onSubmit} className="space-y-6">
              {isRegister && (
                <div className="flex flex-col items-start w-full">
                  <h3 className="font-editor text-[#01c8d2] text-[12px] pb-2 uppercase tracking-wider">
                    NAME
                  </h3>
                  <input
                    placeholder="Enter your name"
                    type="text"
                    name="name"
                    className="bg-white/5 text-[15px] text-[#cbdfe2] px-3 py-2.5 w-full rounded border border-[#3a494a] font-editor focus:outline-none focus:border-[#00dce5]"
                    onChange={onChange}
                    value={name}
                    required
                  />
                </div>
              )}

              <div className="flex flex-col items-start w-full">
                <h3 className="font-editor text-[#01c8d2] text-[12px] pb-2 uppercase tracking-wider">
                  EMAIL
                </h3>
                <input
                  placeholder="developer@example.com"
                  type="email"
                  name="email"
                  className="bg-white/5 text-[15px] text-[#cbdfe2] px-3 py-2.5 w-full rounded border border-[#3a494a] font-editor focus:outline-none focus:border-[#00dce5]"
                  onChange={onChange}
                  value={email}
                  required
                />
              </div>

              <div className="flex flex-col items-start w-full">
                <h3 className="font-editor text-[#01c8d2] text-[12px] pb-2 uppercase tracking-wider">
                  PASSWORD
                </h3>
                <input
                  placeholder="••••••••"
                  type="password"
                  name="password"
                  className="bg-white/5 text-[15px] text-[#cbdfe2] px-3 py-2.5 w-full rounded border border-[#3a494a] font-editor focus:outline-none focus:border-[#00dce5]"
                  onChange={onChange}
                  value={password}
                  required
                />
              </div>

              <div className="pt-4 text-center">
                <button
                  type="submit"
                  className="bg-[#00dce5] hover:bg-[#63f7ff] text-[#003739] w-full py-3 uppercase rounded font-label text-[12px] font-extrabold tracking-wider transition-all cursor-pointer"
                >
                  {isRegister ? "Register" : "Login"}
                </button>
              </div>
            </form>

            <div className="my-6 flex items-center">
              <div className="flex-grow border-t border-[#3a494a]/50"></div>
              <span className="px-3 text-[12px] font-editor text-[#808e93]">OR</span>
              <div className="flex-grow border-t border-[#3a494a]/50"></div>
            </div>

            <button
              type="button"
              onClick={() => window.location.href = `${backendUrl}/api/auth/google`}
              className="flex items-center justify-center w-full bg-white/5 hover:bg-white/10 border border-[#3a494a]/50 text-[#cbdfe2] py-2.5 rounded transition-all cursor-pointer font-editor text-[14px]"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>

            <div className="flex justify-center font-body text-[14px] pt-6 border-t border-[#3a494a]/30 mt-6">
              <h1 className="text-[#b3c4c4]">
                {isRegister ? "Already have an account?" : "New User?"}
              </h1>
              <button
                type="button"
                className="text-[#5eecf4] px-2 font-bold cursor-pointer hover:underline"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? "Login" : "Register"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;