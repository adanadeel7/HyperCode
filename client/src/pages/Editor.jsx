import React, { useEffect, useLayoutEffect, useRef } from "react";
import { Copy, Moon, FolderGit2, Check } from "lucide-react";
import { gsap } from "gsap";

function Editor() {
  const glowRef = useRef(null);

  // Mouse Follower
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
        className="bg-[#0b1324] text-[#dae2fb] h-screen overflow-hidden flex flex-col font-sans antialiased z-0 relative"
        style={{
          backgroundSize: "40px 40px",
          backgroundImage: `
            linear-gradient(to right, rgba(0, 220, 229, 0.03) 1px, transparent 1px), 
            linear-gradient(to bottom, rgba(0, 220, 229, 0.03) 1px, transparent 1px)
          `,
        }}
      >
        <header className="bg-[#0b1324]/90 backdrop-blur-md text-[#e9feff] border-b border-[#3a494a] flex justify-between items-center h-[32px] px-[24px] w-full shrink-0 z-50 relative h-[32px] px-[24px]">
          <div className="flex items-center">
            <span className="text-[16px] font-bold tracking-tight">HyperCode</span>
            <div className="h-4 w-px bg-[#3a494a] mx-[16px]"></div>

            <div className="flex items-center gap-[8px] text-[#b9caca] text-[11px] font-mono tracking-wider">
              <span>Room ID: #ALPHA-9</span>
              <input
                type="button"
                value={"Content Copy"}
                className="hover:text-[#e9feff] transition-colors hover:bg-[#2d3547] rounded-full p-1 opacity-80 scale-95 material-symbols-outlined text-[14px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-[8px]">
            <div className="flex -space-x-2 mr-[24px]">
              <img
                alt="Sarah"
                className="w-5 h-5 rounded-full border border-[#171f31] ring-1 ring-[#63f7ff]"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=60"              />
             

              <img
                alt="Alex"
                className="w-5 h-5 rounded-full border border-[#171f31] ring-1 ring-[#fbb3c1]"
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60"            
                />
              </div>

            <button className="hover:bg-[#2d3547] transition-colors text-[#b9caca] rounded-full p-1 opacity-80 scale-95 cursor-pointer">
              <Moon className="w-[14px] h-[14px]" />
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <nav className="bg-[#171f31] w-[240px] flex flex-col border-r border-[#3a494a] shrink-0 hidden md:flex">
            <div className="p-[24px] border-b border-[#3a494a]">
              <div className="flex items-center gap-[16px]">
                <div className="W-8 H-8 rounded-full bg-[#2d3547] border border-[#3a494a] flex items-center justify-center text-[#63f7ff]">
                  <span className="material-symbols-outlined text-[18px]">
                    deployed code
                  </span>
                </div>
                <div>
                  <h2 className="text-[11px] font-bold tracking-wider uppercase">
                    Project Alpha
                  </h2>
                  <span className="text-[11px] text-[#b9caca] block mt-[2px]">
                    main branch
                  </span>
                </div>
              </div>
            </div>

            <div></div>
          </nav>
        </div>
      </div>
    </>
  );
}

export default Editor;
