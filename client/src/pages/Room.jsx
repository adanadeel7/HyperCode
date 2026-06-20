import React, { use, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import {v4 as uuid} from "uuid"
import {useNavigate} from "react-router-dom"

function Room() {
  const glowRef = useRef(null);
  const [room, setRoom] = useState('')
  const [userName, SetuserName] = useState('')
  const navigate = useNavigate()
  useEffect(() => { 
    if(!glowRef.current) return; 

    const xTo = gsap.quickTo(glowRef.current, "x", {duration: 0.4, ease: "power3.out"})
    const yTo = gsap.quickTo(glowRef.current, "y", {duration: 0.4, ease: "power3.out"})
    
    const handleMouseMove = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove); 
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, []); 

  const createNewRoom = (e) => { 
    const id = uuid()
    setRoom(id)


  }

  const handleJoinSession = () => {
    if (!room.trim() || !userName.trim) {
      alert("Please supply both a valid Room ID and Developer Alias.")
    return; 
  }
    navigate(`/editor/${room}`, { 
      state: {userName, room}
    })
  }



  return (
    <>
      <div
        ref={glowRef}
        className="pointer-events-none fixed w-96 h-96 rounded-full bg-[#63f7ff] opacity-5 blur-[100px] z-10"
        style={{ transform: "translate(-50%, -50%)", top: 0, left: 0 }}
      />
      
      <div
        className="w-full h-screen bg-[#0b1324] relative overflow-hidden z-0"
        style={{
          backgroundSize: "40px 40px", 
          backgroundImage: `
            linear-gradient(to right, rgba(0, 220, 229, 0.04) 1px, transparent 1px), 
            linear-gradient(to bottom, rgba(0, 220, 229, 0.04) 1px, transparent 1px)`
        }}
      >
        <div className="relative z-20 w-full h-full">
          
          <div className="text-center pt-12">
            <h1 className="font-headline text-[32px] font-bold text-[#cbdfe2]">
              HyperCode
            </h1>
            <h2 className="font-body text-[14px] text-[#808e93]">
              Collaborative engineering space
            </h2>
          </div>

          <div className="flex flex-col items-center w-full">
            
            <div className="flex flex-col items-start w-full max-w-xs pt-30">
              <h1 className="font-headline text-[#dae2fb] text-[20px]">
                Join Session
              </h1>
            </div>

            <div className="flex flex-col items-center w-full pt-8">
              <div className="flex flex-col items-start w-full max-w-xs">
                <h3 className="font-editor text-[#01c8d2] text-[12px] pb-2">
                  ROOM ID
                </h3>
                <input
                  placeholder="e.g. hc-alpha-992"
                  type="text"
                  className="bg-white text-[15px] text-[#c6c9cf] px-3 py-2 w-full rounded border border-[#3a494a] font-editor focus:outline-none"
                  onChange={(e) => setRoom(e.target.value)}
                  value={room}
                />
              </div>
            </div>

            <div className="flex flex-col items-center w-full pt-8">
              <div className="flex flex-col items-start w-full max-w-xs">
                <h3 className="font-editor text-[#01c8d2] text-[12px] pb-2">
                  ALIAS
                </h3>
                <input
                  placeholder="developer_name"
                  type="text"
                  className="bg-white px-3 py-2 w-full rounded border border-[#3a494a] font-editor text-[15px] focus:outline-none text-[#c6c9cf]"
                  onChange={(e) => SetuserName(e.target.value)}
                  value = {userName}
                />
              </div>
            </div>

            <div className="pt-12">
              <input
                type="button"
                value={"Initialize Connection"}
                className="bg-[#00dce5] px-21 py-3 uppercase rounded font-label text-[12px] font-extralight cursor-pointer"
                onClick={handleJoinSession}
              />
            </div>

            <div className="flex font-body text-[14px] py-6">
              <h1 className="text-[#b3c4c4] font-bold">
                Need a new workspace?
              </h1>
              <input
                type="button"
                value={"Create Room"}
                className="text-[#5eecf4] px-2 cursor-pointer"
                onClick={createNewRoom}
              />
            </div>

          </div>
        </div>

      </div>
    </>
  );
}

export default Room;