import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Copy, Moon, FolderGit2, Play, Terminal as TermIcon, FileCode, Users } from "lucide-react";
import { gsap } from "gsap";
import { useLocation, useParams } from "react-router-dom";
import { initSocket } from "../../../server/src/socket.js";

function Editor() {
  const containerRef = useRef(null);
  const glowRef = useRef(null);
  const headerRef = useRef(null);
  const sidebarRef = useRef(null);
  const mainWorkspaceRef = useRef(null);
  const socketRef = useRef(null); 

  const { id } = useParams(); 
  const location = useLocation();
  const passedState = location.state || {}; 

  const [roomId, setRoomId] = useState(id || passedState.room || "ALPHA-9");
  const [currentUserName, setCurrentUserName] = useState(passedState.userName || "Adan Adeel");
  const [isCopied, setIsCopied] = useState(false);
  const [clients, setClients] = useState([]);

  const [code, setCode] = useState(`// Loading workspace from cloud layer...`);
  const [terminalLogs, setTerminalLogs] = useState([
    `[System]: Terminal session initialized for developer: ${passedState.userName || "Adan Adeel"}`
  ]);

  const lineCount = code.split("\n").length;

  // 1. Core Synchronization WebSocket Event Effects Pipeline
  useEffect(() => { 
    let isMounted = true;

    const initConnection = async () => { 
      // Force disconnect any accidental ghost connections before establishing a new hook
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      // Initialize frontend communication tunnel link
      const socketInstance = await initSocket();
      
      // Safety abort if component unmounted mid-handshake
      if (!isMounted) {
        socketInstance.disconnect();
        return;
      }

      socketRef.current = socketInstance;

      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.error("Socket link connection exception encountered", e);
        if (isMounted) {
          setTerminalLogs((p) => [...p, "[Error]: Dynamic system synchronization fallback failing."]);
        }
      }

      // Handshake Join request broadcasted explicitly with key parameters matching backend expected keys
      socketRef.current.emit("join-room", { 
        roomId, 
        currentUserName
      });

      // LISTEN 1: Catch acknowledgement response when joining room successfully (Includes MongoDB persistence state)
      socketRef.current.on("room-joined-success", ({ clients, code: initialDbCode }) => {
        if (isMounted) {
          setClients(clients);
          if (initialDbCode !== undefined) {
            setCode(initialDbCode); // Syncs editor text window with persistent MongoDB data
          }
          setTerminalLogs((p) => [...p, `[System]: Successfully mapped connection token to space: #${roomId}`]);
        }
      });

      // LISTEN 2: Fired when any peer enters the channel matrix context
      socketRef.current.on("user-joined", ({ userName, clients }) => {
        if (isMounted) {
          setClients(clients);
          setTerminalLogs((p) => [...p, `[System]: Peer connection established: ${userName || "A developer"} entered workspace.`]);
        }
      });

      // LISTEN 3: Real-time Incoming Document Keystroke Stream Sync Updates
      socketRef.current.on("code-update", (incomingCode) => {
        if (isMounted) setCode(incomingCode);
      });

      // LISTEN 4: Fired when an alternative peer leaves or closes their workspace browser tab
      socketRef.current.on("user-left", ({ userName, socketId, clients: updatedClients }) => {
        if (!isMounted) return;
        setTerminalLogs((p) => [...p, `[System]: Peer connection terminated: ${userName || "A developer"} left workspace.`]);
        
        if (updatedClients) {
          setClients(updatedClients);
        } else {
          setClients((prev) => prev.filter((client) => client.socketId !== socketId));
        }
      });
    };

    initConnection();

    // Clean up completely on unmount
    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId, currentUserName]);

  // 2. Outgoing Sync Handlers: Notify peers on local keystroke changes
  const handleCodeChange = (e) => {
    const updatedValue = e.target.value;
    setCode(updatedValue);

    if (socketRef.current) {
      socketRef.current.emit("code-change", {
        roomId,
        code: updatedValue
      });
    }
  };

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
      gsap.set([headerRef.current, sidebarRef.current, mainWorkspaceRef.current], { opacity: 0, y: -10 });
      tl.to(headerRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" })
        .to(sidebarRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.3")
        .to(mainWorkspaceRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.3");
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setIsCopied(true);
      setTerminalLogs((prev) => [...prev, `[System]: Room ID copied to local storage clipboard.`]);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const runCode = async () => {
    setTerminalLogs((prev) => [...prev, `[Running]: Initializing workspace compiler engine...`]);
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
      
      const response = await fetch(`${backendUrl}/api/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.output) {
        const cleanLogs = data.output.trim().split("\n");
        setTerminalLogs((prev) => [...prev, ...cleanLogs]);
      }
    } catch (err) {
      console.error("Compilation execution pipeline error:", err);
      setTerminalLogs((prev) => [
        ...prev, 
        `[Error]: Failed to communicate with compiler backend infrastructure. Connection lost.`
      ]);
    }
  };

  return (
    <>
      <div ref={glowRef} className="pointer-events-none fixed w-96 h-96 rounded-full bg-[#63f7ff] opacity-5 blur-[100px] z-10" style={{ transform: "translate(-50%, -50%)", top: 0, left: 0 }} />

      <div ref={containerRef} className="bg-[#0b1324] text-[#dae2fb] h-screen overflow-hidden flex flex-col font-sans antialiased z-0 relative"
        style={{
          backgroundSize: "40px 40px",
          backgroundImage: `linear-gradient(to right, rgba(0, 220, 229, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 220, 229, 0.02) 1px, transparent 1px)`,
        }}
      >
        <header ref={headerRef} className="bg-[#0b1324]/90 backdrop-blur-md text-[#e9feff] border-b border-[#3a494a] flex justify-between items-center h-[32px] px-[24px] w-full shrink-0 z-50 relative">
          <div className="flex items-center">
            <span className="text-[16px] font-bold tracking-tight">HyperCode</span>
            <div className="h-4 w-px bg-[#3a494a] mx-[16px]"></div>
            <div className="flex items-center gap-[8px] text-[#b9caca] text-[11px] font-mono tracking-wider">
              <span>Room ID: #{roomId}</span>
              <button onClick={copyRoomId} className={`hover:text-[#e9feff] transition-colors hover:bg-[#2d3547] rounded-full p-1 opacity-80 cursor-pointer ${isCopied ? "text-emerald-400" : ""}`}>
                <Copy className="w-[12px] h-[12px]" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-[8px]">
            <div className="flex -space-x-2 mr-[24px]">
              {clients.map((client, idx) => (
                <div key={client.socketId || idx} className="w-5 h-5 rounded-full border border-[#171f31] flex items-center justify-center text-[10px] font-bold uppercase tracking-tighter shadow-md select-none cursor-help"
                  style={{ backgroundColor: idx % 2 === 0 ? "#63f7ff" : "#fbb3c1", color: "#0b1324" }}
                  title={`${client.userName} ${client.userName === currentUserName ? "(You)" : ""}`}
                >
                  {client.userName ? client.userName.substring(0, 2) : "??"}
                </div>
              ))}
            </div>
            <button className="hover:bg-[#2d3547] transition-colors text-[#b9caca] rounded-full p-1 opacity-80 cursor-pointer">
              <Moon className="w-[14px] h-[14px]" />
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden relative z-20">
          <nav ref={sidebarRef} className="bg-[#171f31]/40 backdrop-blur-md w-[240px] flex flex-col border-r border-[#3a494a] shrink-0 hidden md:flex">
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

            <div className="p-4 border-b border-[#3a494a]/40 bg-[#0f172a]/20">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#808e93] mb-2.5 px-2">
                <Users className="w-3 h-3 text-[#00dce5]" />
                <span>Active Peers ({clients.length})</span>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto px-2">
                {clients.map((user) => (
                  <div key={user.socketId} className="flex items-center gap-2 text-[12px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className={user.userName === currentUserName ? "text-[#63f7ff] font-medium" : "text-[#b9caca]"}>
                      {user.userName} {user.userName === currentUserName && "(you)"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-[#808e93] block px-2 mb-2">Files</span>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-[#2d3547]/50 text-[#e9feff] text-[12px] font-mono cursor-pointer border-l-2 border-[#63f7ff]">
                <FileCode className="w-3.5 h-3.5 text-[#63f7ff]" />
                <span>main.js</span>
              </div>
            </div>
          </nav>

          <main ref={mainWorkspaceRef} className="flex-1 flex flex-col overflow-hidden bg-[#0e1726]/40 backdrop-blur-xs">
            <div className="h-9 border-b border-[#3a494a] bg-[#0b1324]/60 flex items-center justify-between px-4">
              <div className="flex items-center gap-2 text-[12px] font-mono text-[#b9caca]">
                <span className="text-emerald-400">●</span>
                <span>main.js</span>
              </div>
              <button onClick={runCode} className="bg-[#00dce5] hover:bg-[#63f7ff] text-[#003739] px-3 py-1 rounded-sm flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_10px_rgba(0,220,229,0.1)]">
                <Play className="w-3 h-3 fill-current" />
                <span>Run Script</span>
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden font-mono text-[13px] leading-6 relative">
              <div className="w-12 bg-[#0b1324]/30 select-none text-right pr-3 text-[#3a494a] pt-4 font-mono border-r border-[#3a494a]/30">
                {Array.from({ length: lineCount }).map((_, index) => <div key={index}>{index + 1}</div>)}
              </div>
              <textarea value={code} onChange={handleCodeChange} spellCheck="false" className="flex-1 bg-transparent resize-none p-4 focus:outline-none text-[#e9feff] caret-[#63f7ff] h-full w-full" style={{ tabSize: 2 }} />
            </div>

            <div className="h-44 border-t border-[#3a494a] bg-[#0b1324]/90 flex flex-col overflow-hidden">
              <div className="h-7 border-b border-[#3a494a]/50 bg-[#070d18] flex items-center px-4 gap-2 text-[11px] font-mono tracking-wider uppercase text-[#808e93]">
                <TermIcon className="w-3 h-3 text-[#00dce5]" />
                <span>Execution Console</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 font-mono text-[12px] space-y-1 text-[#a0aec0]">
                {terminalLogs.map((log, i) => (
                  <div key={i} className={`${log.includes('[System]') ? 'text-cyan-400/80' : log.includes('[Running]') ? 'text-amber-400/80' : 'text-slate-300'}`}>{log}</div>
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
