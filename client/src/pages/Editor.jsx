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

            <button className="hover:bg-[#2d3547] transition-colors text-