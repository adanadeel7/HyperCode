import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { v4 as uuid } from "uuid";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext.jsx";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { name, email, password } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const { setUser } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try { 
      const response = await fetch(`${backendUrl}/api/auth/login`,{
        method : "POST", 
        credentials: "include", 
        headers: {
          "Content-Type" : "application/json"
        }, 
        body:JSON.stringify({
          email, 
          password,
        })
      })

      const data = await response.json(); 

      if (!response.ok) { 
        toast.error(data.message || "Logical Failed")
        return;
      }

      toast.success("Logged in Successfully")
      setUser(data.user);
      navigate("/room");
    } catch (error) { 
      toast.error(error.message);
    }
  };


  const handleRegister = async (e) => {
    e.preventDefault(); 

    try { 
      const displayName = name.trim() || email.split("@")[0] || "Developer";
      const response = await fetch(`${backendUrl}/api/auth/register`, { 
        method : "POST", 
        credentials : "include", 
        headers: {
          "Content-Type" : "application/json"
        }, 
        body : JSON.stringify({
          name: displayName,
          email,
          password,
        })
      })
      const data = await response.json(); 

      if (!response.ok) { 
        toast.error(data.message || "Registration failed")
        return;
      }

      toast.success("Account Created")
      setUser(data.user);
      navigate("/room")
    } catch (error) {
      toast.error(error.message)
    }

  }

  const glowRef = useRef(null);
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

    const handleMouseMove = (e) => {
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
