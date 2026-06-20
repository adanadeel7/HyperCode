import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Copy, Moon, FolderGit2, Play, Terminal as TermIcon, FileCode, Users } from "lucide-react";
import { gsap } from "gsap";
import { useLocation, useParams } from "react-router-dom";

function Editor() {
  const containerRef = useRef(null);
  const glowRef = useRef(null);
  const headerRef = useRef(null);
  const sidebarRef = useRef(null);
  const mainWorkspaceRef = useRef(null);
  
  // Extract route parameter from path (assuming path configuration is /editor/:id)
  const { id } = useParams(); 
  const location = useLocation();
  
  // Safely grab passed state context parameters from navigation stack
  const passedState = location.state || {}; 

  // Initialize your React state hooks using the routed parameters as initial defaults
  const [roomId, setRoomId] = useState(id || passedState.room || "ALPHA-9");
  const [currentUserName, setCurrentUserName] = useState(passedState.userName || "Adan Adeel");
  const [isCopied, setIsCopied] = useState(false);

  // Synchronize client list values with the user's mapped identity state hook
  const [clients, setClients] = useState([
    { id: "1", name: "Sarah", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=60", color: "#63f7ff" },
    { id: "2", name: "Alex", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60", color: "#fbb3c1" },
    { id: "3", name: passedState.userName || "Adan Adeel", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=60", color: "#a7f3d0" }
  ]);

  // Code editor text area and console runtime stream tracking
  const [code, setCode] = useState(`// Welcome to HyperCode v4 Workspace\nfunction greetDeveloper() {\n  console.log("Initializing local environment...");\n  return "System Check: 100% Operational";\n}\n\nconsole.log(greetDeveloper());`);
  const [terminalLogs, setTerminalLogs] = useState([
    `[System]: Terminal session initialized for developer: ${passedState.userName || "Adan Adeel"}`,
    `[System]: Connected to room synchronization block: #${id || passedState.room || "ALPHA-9"}`
  ]);

  // Calculate code lines array dynamically for line number canvas gutter
  const lineCount = code.split("\n").length;

  // Mouse Follower Glow Animation Engine
  useEffect(() => {
    if (!glowRef.current) return;

    const xTo = gsap.quickTo(glowRef.current, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(glowRef.current, "y", { duration: 0.4, ease: "power3.out" });

    const handleMouseMove = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Entrance Stagger Animation on Mount
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      gsap.set([headerRef.current, sidebarRef.current, mainWorkspaceRef.current], {
        opacity: 0,
        y: -10
      });

      tl.to(headerRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" })
        .to(sidebarRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.3")
        .to(mainWorkspaceRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.3");

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Helper utility pipeline function to handle clipboard string capture copies
  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setIsCopied(true);
      setTerminalLogs((prev) => [...prev, `[System]: Room ID copied to local storage clipboard.`]);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text string context", err);
    }
  };

  // Simulated code compiler runner execution pipeline
  const runCode = () => {
    setTerminalLogs((prev) => [...prev, `[Running]: Executing workspace compiler module...`]);
    
    setTimeout(() => {
      if (code.includes("console.log")) {
        setTerminalLogs((prev) => [
          ...prev,
          `Initializing local environment...`,
          `System Check: 100% Operational`,
          `[Success]: Process exited cleanly with return parameter.`
        ]);
      } else {
        setTerminalLogs((prev) => [...prev, `[Output]: Code processed with no standard log streams.`]);
      }
    }, 600);
  };

  return (
    <>
      {/* Dynamic Cursor Light Layer */}
      <div
        ref={glowRef}
        className="pointer-events-none fixed w-96 h-96 rounded-full bg-[#63f7ff] opacity-5 blur-[100px] z-10"
        style={{ transform: "translate(-50%, -50%)", top: 0, left: 0 }}
      />

      {/* Root Layout Wrapper with Linear Gradient Grid Background */}
      <div
        ref={containerRef}
        className="bg-[#0b1324] text-[#dae2fb] h-screen overflow-hidden flex flex-col font-sans antialiased z-0 relative"
        style={{
          backgroundSize: "40px 40px",
          backgroundImage: `
            linear-gradient(to right, rgba(0, 220, 229, 0.02) 1px, transparent 1px), 
            linear-gradient(to bottom, rgba(0, 220, 229, 0.02) 1px, transparent 1px)
          `,
        }}
      >
        {/* Workspace Top Application Header */}
        <header
          ref={headerRef}
          className="bg-[#0b1324]/90 backdrop-blur-md text-[#e9feff] border-b border-[#3a494a] flex justify-between items-center h-[32px] px-[24px] w-full shrink-0 z-50 relative"
        >
          <div className="flex items-center">
            <span className="text-[16px] font-bold tracking-tight">HyperCode</span>
            <div className="h-4 w-px bg-[#3a494a] mx-[16px]"></div>

            {/* Render targeted Room ID string explicitly from react state hooks */}
            <div className="flex items-center gap-[8px] text-[#b9caca] text-[11px] font-mono tracking-wider">
              <span>Room ID: #{roomId}</span>
              <button 
                onClick={copyRoomId}
                className={`hover:text-[#e9feff] transition-colors hover:bg-[#2d3547] rounded-full p-1 opacity-80 cursor-pointer ${isCopied ? "text-emerald-400" : ""}`}
                title="Copy Room ID"
              >
                <Copy className="w-[12px] h-[12px]" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-[8px]">
            {/* Dynamic collaborative user rendering map loop loop */}
            <div className="flex -space-x-2 mr-[24px]">
              {clients.map((client) => (
                <img
                  key={client.id}
                  alt={client.name}
                  title={`${client.name} ${client.name === currentUserName ? "(You)" : ""}`}
                  className="w-5 h-5 rounded-full border border-[#171f31] object-cover transition-transform hover:scale-110"
                  style={{ ringWidth: "1px", ringColor: client.color, boxShadow: `0 0 0 1px ${client.color}` }}
                  src={client.avatar}
                />
              ))}
            </div>

            <button className="hover:bg-[#2d3547] transition-colors text-[#b9caca] rounded-full p-1 opacity-80 cursor-pointer">
              <Moon className="w-[14px] h-[14px]" />
            </button>
          </div>
        </header>

        {/* Primary Code Workspace Layout */}
        <div className="flex flex-1 overflow-hidden relative z-20">
          
          {/* File Navigation Sidebar */}
          <nav
            ref={sidebarRef}
            className="bg-[#171f31]/40 backdrop-blur-md w-[240px] flex flex-col border-r border-[#3a494a] shrink-0 hidden md:flex"
          >
            <div className="p-[24px] border-b border-[#3a494a]">
              <div className="flex items-center gap-[16px]">
                <div className="w-8 h-8 rounded-full bg-[#2d3547] border border-[#3a494a] flex items-center justify-center text-[#63f7ff]">
                  <FolderGit2 className="w-[16px] h-[16px]" />
                </div>
                <div>
                  <h2 className="text-[11px] font-bold tracking-wider uppercase">Project Alpha</h2>
                  <span className="text-[11px] text-[#b9caca] block mt-[2px]">main branch</span>
                </div>
              </div>
            </div>

            {/* Active Connected Clients Section Panel list display */}
            <div className="p-4 border-b border-[#3a494a]/40 bg-[#0f172a]/20">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#808e93] mb-2.5 px-2">
                <Users className="w-3 h-3 text-[#00dce5]" />
                <span>Active Peers ({clients.length})</span>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto px-2">
                {clients.map((user) => (
                  <div key={user.id} className="flex items-center gap-2 text-[12px]">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: user.color }} />
                    <span className={user.name === currentUserName ? "text-[#63f7ff] font-medium" : "text-[#b9caca]"}>
                      {user.name} {user.name === currentUserName && "(you)"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated File List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-[#808e93] block px-2 mb-2">Files</span>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-[#2d3547]/50 text-[#e9feff] text-[12px] font-mono cursor-pointer border-l-2 border-[#63f7ff]">
                <FileCode className="w-3.5 h-3.5 text-[#63f7ff]" />
                <span>main.js</span>
              </div>
            </div>
          </nav>

          {/* Core Code Canvas Sub-System Component */}
          <main ref={mainWorkspaceRef} className="flex-1 flex flex-col overflow-hidden bg-[#0e1726]/40 backdrop-blur-xs">
            
            {/* Editor Action Command Bar Panel */}
            <div className="h-9 border-b border-[#3a494a] bg-[#0b1324]/60 flex items-center justify-between px-4">
              <div className="flex items-center gap-2 text-[12px] font-mono text-[#b9caca]">
                <span className="text-emerald-400">●</span>
                <span>main.js</span>
              </div>
              <button 
                onClick={runCode}
                className="bg-[#00dce5] hover:bg-[#63f7ff] text-[#003739] px-3 py-1 rounded-sm flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_10px_rgba(0,220,229,0.1)]"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Run Script</span>
              </button>
            </div>

            {/* Text Input Workspace Pane */}
            <div className="flex-1 flex overflow-hidden font-mono text-[13px] leading-6 relative">
              {/* Vertical Gutter Line Numbers Rail */}
              <div className="w-12 bg-[#0b1324]/30 select-none text-right pr-3 text-[#3a494a] pt-4 font-mono border-r border-[#3a494a]/30">
                {Array.from({ length: lineCount }).map((_, index) => (
                  <div key={index}>{index + 1}</div>
                ))}
              </div>

              {/* Real-time Document Textarea Capture Layer */}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck="false"
                className="flex-1 bg-transparent resize-none p-4 focus:outline-none text-[#e9feff] caret-[#63f7ff] h-full w-full"
                style={{ tabSize: 2 }}
              />
            </div>

            {/* Inline Connected Terminal Output Log Sheet */}
            <div className="h-44 border-t border-[#3a494a] bg-[#0b1324]/90 flex flex-col overflow-hidden">
              <div className="h-7 border-b border-[#3a494a]/50 bg-[#070d18] flex items-center px-4 gap-2 text-[11px] font-mono tracking-wider uppercase text-[#808e93]">
                <TermIcon className="w-3 h-3 text-[#00dce5]" />
                <span>Execution Console</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 font-mono text-[12px] space-y-1 text-[#a0aec0]">
                {terminalLogs.map((log, i) => (
                  <div 
                    key={i} 
                    className={`${log.includes('[System]') ? 'text-cyan-400/80' : log.includes('[Running]') ? 'text-amber-400/80' : log.includes('[Success]') ? 'text-emerald-400' : 'text-slate-300'}`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>

          </main>
        </div>
      </div>
    </>
  );
}

export default Editor;