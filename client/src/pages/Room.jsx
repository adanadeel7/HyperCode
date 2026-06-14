import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

function Room() {
  const glowRef = useRef(null);

  useEffect(() => { 
    if(!glowRef.current) return; 

    const xTo = gsap.quickTo(glowRef.current,"x", {duration: 0.4, ease: "power3out"})
    const yTo = gsap.quickTo(glowRef.current,"y", {duration: 0.4, ease: "power3out"})
    
    const handleMouseMove = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove); 
    return () => window.removeEventListener("mousemove",handleMouseMove)
  })



  return (
    <>
      <div
        ref={glowRef}
        className="pointer-events-none fixed w-96 h-96 rounded-full bg-[#63f7ff] opacity-5 blur-[100px] z-0"
        style={{ transform: "translate(-50%, -50%)", top: 0, left: 0 }}
      />
      <div>
        <div className="w-full h-screen bg-[#0b1324]">
          {/* Logo Part */}
          <div className="text-center">
            <h1 className="font-headline text-[32px] font-bold text-[#cbdfe2]">
              HyperCode
            </h1>

            <h2 className="font-body text-[14px] text-[#808e93]">
              Collaborative engineering space
            </h2>
          </div>

          {/* Main Vertical Layout */}
          <div className="flex flex-col items-center w-full">
            {/* Left-aligned title container */}
            <div className="flex flex-col items-start w-full max-w-xs pt-20 ">
              <h1 className="font-headline text-[#dae2fb] text-[20px]">
                Join Session
              </h1>
            </div>

            {/* Input module wrapper for the session room parameter */}
            <div className="flex flex-col items-center w-full pt-5">
              <div className="flex flex-col items-start w-full max-w-xs ">
                <h3 className="font-editor text-[#01c8d2] text-[12px] pb-2">
                  ROOM ID
                </h3>

                <input
                  placeholder="e.g. hc-alpha-992"
                  type="text"
                  className="bg-white text-[15px] justify-center text-[#c6c9cf] px-3 py-2 w-full rounded border border-[#3a494a] font-editor focus:outline-none"
                />
              </div>
            </div>

            {/* Input module wrapper for the user alias parameter */}
            <div className="flex flex-col items-center w-full pt-8">
              <div className="flex flex-col items-start w-full max-w-xs ">
                <h3 className="font-editor text-[#01c8d2] text-[12px] pb-2">
                  ALIAS
                </h3>

                <input
                  placeholder="developer_name"
                  type="text"
                  className="bg-white justify-center px-3 py-2 w-full rounded border border-[#3a494a] font-editor text-[15px] focus:outline-none text-[#c6c9cf]"
                />
              </div>
            </div>

            <div className="pt-12">
              <input
                type="button"
                value={"Initialize Connection"}
                className="bg-[#00dce5] px-21 py-3 uppercase rounded font-label text-[12px] font-extralight"
              />
            </div>

            <div className="flex font-body text-[14px] py-6">
              <h1 className="text-[#b3c4c4] font-bold">
                Need a new workspace?
              </h1>

              <input
                type="button"
                value={"Create Room"}
                className="text-[#5eecf4] px-2  "
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Room;
