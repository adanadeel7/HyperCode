import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Copy, Moon, FolderGit2, Play, Terminal as TermIcon, FileCode, Users, Plus, Trash2, Globe, FileText, Code } from "lucide-react";
import { gsap } from "gsap";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";
import { initSocket } from "../socket.js"; 
import toast from "react-hot-toast";

const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const backendUrl = import.meta.env.VITE_BACKEND_URL || (isLocalhost ? "http://localhost:8000" : "https://hypercode-18ib.onrender.com");


interface LocationState {
  room?: string;
  userName?: string;
}

interface Client {
  socketId: string;
  userName: string;
}

interface WorkspaceFile {
  name: string;
  content: string;
}

interface FileDeletedPayload {
  filename: string;
  nextActive: string;
}

interface ExecuteResponse {
  output?: string;
}

interface SocketInstance {
  on: (event: string, callback: (...args: any[]) => void) => void;
  emit: (event: string, data?: any) => void;
  disconnect: () => void;
}

function Editor() {
  const navigate = useNavigate();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const mainWorkspaceRef = useRef<HTMLElement>(null);
  const socketRef = useRef<SocketInstance | null>(null); 

  const { id } = useParams<{ id: string }>(); 
  const location = useLocation();
  const passedState = (location.state as LocationState) || {}; 

  const [roomId] = useState<string>(id || passedState.room || "ALPHA-9");
  const [currentUserName] = useState<string>(passedState.userName || "Adan Adeel");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [clients, setClients] = useState<Client[]>([]);

  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [activeFile, setActiveFile] = useState<string>("main.js");
  const [code, setCode] = useState<string>(`// Loading workspace from cloud layer...`);
  
  const [newFileName, setNewFileName] = useState<string>("");
  const [showNewFileInput, setShowNewFileInput] = useState<boolean>(false);

  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    `[System]: Terminal session initialized for developer: ${passedState.userName || "Adan Adeel"}`
  ]);

  const getLanguageFromFilename = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': return 'javascript';
      case 'py': return 'python';
      case 'cpp': return 'cpp';
      case 'html': return 'html';
      case 'css': return 'css';
      default: return 'plaintext';
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'html': return <Globe className="w-3.5 h-3.5 text-orange-400" />;
      case 'css': return <FileText className="w-3.5 h-3.5 text-pink-400" />;
      case 'js': return <FileCode className="w-3.5 h-3.5 text-yellow-400" />;
      case 'py': return <Code className="w-3.5 h-3.5 text-blue-400" />;
      case 'cpp': return <Code className="w-3.5 h-3.5 text-teal-400" />;
      default: return <FileText className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const activeFileRef = useRef<string>(activeFile);
  const filesRef = useRef<WorkspaceFile[]>(files);

  useEffect(() => {
    activeFileRef.current = activeFile;
  }, [activeFile]);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // 1. Core Synchronization WebSocket Event Effects Pipeline
  useEffect(() => { 
    let isMounted = true;

    const initConnection = async () => { 
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      const socketInstance = await initSocket();
      
      if (!isMounted) {
        socketInstance.disconnect();
        return;
      }

      socketRef.current = socketInstance;

      socketRef.current.on("connect_error", (err: Error) => handleErrors(err));
      socketRef.current.on("connect_failed", (err: Error) => handleErrors(err));

      function handleErrors(e: Error) {
        console.error("Socket link connection exception encountered", e);
        if (isMounted) {
          setTerminalLogs((p) => [...p, "[Error]: Dynamic system synchronization fallback failing."]);
        }
      }

      socketRef.current.emit("join-room", { 
        roomId, 
        currentUserName
      });

      // LISTEN 1: Catch acknowledgement response when joining room successfully
      socketRef.current.on("room-joined-success", ({ clients, files: roomFiles, activeFile: roomActiveFile }: { clients: Client[], files: WorkspaceFile[], activeFile: string }) => {
        if (!isMounted) return;
        setClients(clients);
        if (roomFiles && roomFiles.length > 0) {
          setFiles(roomFiles);
          const currentFile = roomFiles.find(f => f.name === roomActiveFile) || roomFiles[0];
          if (currentFile) {
            setActiveFile(currentFile.name);
            setCode(currentFile.content);
          }
        }
        setTerminalLogs((p) => [...p, `[System]: Successfully mapped connection token to space: #${roomId}`]);
      });

      // LISTEN 2: Fired when any peer enters the channel matrix context
      socketRef.current.on("user-joined", ({ userName, clients }: { userName: string, clients: Client[] }) => {
        if (isMounted) {
          setClients(clients);
          setTerminalLogs((p) => [...p, `[System]: Peer connection established: ${userName || "A developer"} entered workspace.`]);
        }
      });

      // LISTEN 3: Real-time Incoming Document Keystroke Stream Sync Updates
      socketRef.current.on("code-update", ({ filename, code: incomingCode }: { filename: string, code: string }) => {
        if (!isMounted) return;
        
        setFiles(prev => prev.map(f => f.name === filename ? { ...f, content: incomingCode } : f));
        
        if (filename === activeFileRef.current) {
          setCode(incomingCode);
        }
      });

      // LISTEN 4: Fired when new file is created in workspace
      socketRef.current.on("file-created", (newFile: WorkspaceFile) => {
        if (!isMounted) return;
        setFiles(prev => {
          if (prev.some(f => f.name === newFile.name)) return prev;
          return [...prev, newFile];
        });
        setTerminalLogs((p) => [...p, `[System]: File created: ${newFile.name}`]);
      });

      // LISTEN 5: Fired when a file is deleted from workspace
      socketRef.current.on("file-deleted", ({ filename, nextActive }: FileDeletedPayload) => {
        if (!isMounted) return;
        setFiles(prev => prev.filter(f => f.name !== filename));
        if (activeFileRef.current === filename) {
          setActiveFile(nextActive);
          const fileObj = filesRef.current.find(file => file.name === nextActive);
          setCode(fileObj ? fileObj.content : "");
        }
        setTerminalLogs((p) => [...p, `[System]: File deleted: ${filename}`]);
      });

      // LISTEN 6: Fired when another user shifts focus to a different file
      socketRef.current.on("file-selected", (filename: string) => {
        if (!isMounted) return;
        setActiveFile(filename);
        const fileObj = filesRef.current.find(file => file.name === filename);
        setCode(fileObj ? fileObj.content : "");
      });

      // LISTEN 7: Fired when an alternative peer leaves or closes their workspace browser tab
      socketRef.current.on("user-left", ({ userName, socketId, clients: updatedClients }: { userName: string, socketId: string, clients: Client[] }) => {
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

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId, currentUserName]);

  const handleCodeChange = (value: string | undefined) => {
    const safeValue = value || "";
    setCode(safeValue);
    setFiles(prev => prev.map(f => f.name === activeFile ? { ...f, content: safeValue } : f));

    if (socketRef.current) {
      socketRef.current.emit("code-change", {
        roomId,
        filename: activeFile,
        code: safeValue
      });
    }
  };

  const handleSelectFile = (filename: string) => {
    setActiveFile(filename);
    const fileObj = files.find(file => file.name === filename);
    setCode(fileObj ? fileObj.content : "");
    if (socketRef.current) {
      socketRef.current.emit("select-file", { roomId, filename });
    }
  };

  const handleCreateFile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    if (files.some(f => f.name.toLowerCase() === newFileName.toLowerCase())) {
      toast.error("File already exists!");
      return;
    }

    const ext = newFileName.split('.').pop()?.toLowerCase();
    let language = "javascript";
    if (ext === "py") language = "python";
    else if (ext === "cpp") language = "cpp";
    else if (ext === "html") language = "html";
    else if (ext === "css") language = "css";

    if (socketRef.current) {
      socketRef.current.emit("create-file", { roomId, filename: newFileName, language });
    }

    setNewFileName("");
    setShowNewFileInput(false);
    toast.success(`File "${newFileName}" created!`);
  };

  const handleDeleteFile = (e: React.MouseEvent<HTMLButtonElement>, filename: string) => {
    e.stopPropagation();
    if (files.length <= 1) {
      toast.error("At least one file must remain in the workspace.");
      return;
    }

    if (window.confirm(`Are you sure you want to delete '${filename}'?`)) {
      if (socketRef.current) {
        socketRef.current.emit("delete-file", { roomId, filename });
      }
      toast.success(`File "${filename}" deleted.`);
    }
  };

  // Mouse Follower Glow Animation Engine
  useEffect(() => {
    if (!glowRef.current) return;
    const xTo = gsap.quickTo(glowRef.current, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(glowRef.current, "y", { duration: 0.4, ease: "power3.out" });

    const handleMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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
    setTerminalLogs((prev) => [...prev, `[Running]: Executing compiler engine for ${activeFile}...`]);
    
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${backendUrl}/api/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ code, filename: activeFile }),
      });

      const data = (await response.json()) as ExecuteResponse;

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

  const getHtmlPreviewDoc = () => {
    const htmlFile = files.find(f => f.name.endsWith('.html')) || { content: "" };
    const cssFile = files.find(f => f.name.endsWith('.css')) || { content: "" };
    const jsFile = files.find(f => f.name.endsWith('.js')) || { content: "" };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${cssFile.content}</style>
        </head>
        <body style="background-color: #ffffff; color: #1a202c; padding: 16px; font-family: sans-serif;">
          ${htmlFile.content}
          <script>
            // Intercept console.log and errors
            window.console.log = function(...args) {
              window.parent.postMessage({ type: 'CONSOLE_LOG', data: args.join(' ') }, '*');
            };
            window.onerror = function(message) {
              window.parent.postMessage({ type: 'CONSOLE_ERROR', data: message }, '*');
            };
            try {
              ${jsFile.content}
            } catch(err) {
              console.error(err.message);
            }
          </script>
        </body>
      </html>
    `;
  };

  useEffect(() => {
    const handlePreviewMessages = (event: MessageEvent) => {
      if (event.data && event.data.type === 'CONSOLE_LOG') {
        setTerminalLogs(prev => [...prev, `[Iframe Preview Console]: ${event.data.data}`]);
      }
      if (event.data && event.data.type === 'CONSOLE_ERROR') {
        setTerminalLogs(prev => [...prev, `[Iframe Preview Error]: ${event.data.data}`]);
      }
    };
    window.addEventListener('message', handlePreviewMessages);
    return () => window.removeEventListener('message', handlePreviewMessages);
  }, []);

  const activeLang = getLanguageFromFilename(activeFile);
  const isWebFileActive = files.some(f => f.name.endsWith('.html') || f.name.endsWith('.css'));

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
            <span onClick={() => navigate("/room")} className="text-[16px] font-bold tracking-tight cursor-pointer hover:text-[#00dce5] transition-colors">HyperCode</span>
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
              <div className="flex justify-between items-center px-2 mb-2">
                <span className="text-[10px] uppercase tracking-widest text-[#808e93] block">Files</span>
                <button 
                  onClick={() => setShowNewFileInput(!showNewFileInput)} 
                  className="text-[#63f7ff] hover:text-[#e9feff] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {showNewFileInput && (
                <form onSubmit={handleCreateFile} className="px-2 pb-2">
                  <input
                    type="text"
                    autoFocus
                    placeholder="e.g. index.html"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full bg-[#0b1324] text-[11px] text-[#e9feff] px-2 py-1 rounded border border-[#3a494a] focus:outline-none focus:border-[#63f7ff] font-mono"
                  />
                </form>
              )}

              <div className="space-y-1">
                {files.map((file) => (
                  <div 
                    key={file.name} 
                    onClick={() => handleSelectFile(file.name)}
                    className={`group flex items-center justify-between px-2 py-1.5 rounded text-[12px] font-mono cursor-pointer transition-all border-l-2 ${
                      file.name === activeFile 
                        ? "bg-[#2d3547]/50 text-[#e9feff] border-[#63f7ff]" 
                        : "text-[#b9caca] border-transparent hover:bg-[#2d3547]/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.name)}
                      <span>{file.name}</span>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteFile(e, file.name)} 
                      className="opacity-40 group-hover:opacity-100 hover:text-red-400 p-0.5 rounded transition-all cursor-pointer"
                      style={{ visibility: files.length > 1 ? "visible" : "hidden" }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </nav>

          <main ref={mainWorkspaceRef} className="flex-1 flex flex-col overflow-hidden bg-[#0e1726]/40 backdrop-blur-xs">
            <div className="h-9 border-b border-[#3a494a] bg-[#0b1324]/60 flex items-center justify-between px-4">
              <div className="flex items-center gap-2 text-[12px] font-mono text-[#b9caca]">
                <span className="text-emerald-400">●</span>
                <span>{activeFile}</span>
              </div>
              <button onClick={runCode} className="bg-[#00dce5] hover:bg-[#63f7ff] text-[#003739] px-3 py-1 rounded-sm flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_10px_rgba(0,220,229,0.1)]">
                <Play className="w-3 h-3 fill-current" />
                <span>Run Script</span>
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
              {/* Split Editor / Preview view */}
              <div className={`flex-1 h-full ${isWebFileActive ? "w-1/2" : "w-full"}`}>
                <MonacoEditor
                  height="100%"
                  theme="vs-dark"
                  language={activeLang}
                  value={code}
                  onChange={handleCodeChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    wordWrap: "on",
                    suggestOnTriggerCharacters: true,
                    lineNumbersMinChars: 3,
                    padding: { top: 16 }
                  }}
                />
              </div>

              {isWebFileActive && (
                <div className="w-1/2 h-full border-l border-[#3a494a] bg-white flex flex-col">
                  <div className="h-7 bg-[#f7fafc] border-b border-[#cbd5e0] px-4 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#718096] tracking-wider font-mono">Live Web Preview</span>
                  </div>
                  <iframe 
                    title="Live Web Preview Frame"
                    srcDoc={getHtmlPreviewDoc()}
                    className="flex-1 w-full border-none bg-white"
                    sandbox="allow-scripts"
                  />
                </div>
              )}
            </div>

            <div className="h-44 border-t border-[#3a494a] bg-[#0b1324]/90 flex flex-col overflow-hidden">
              <div className="h-7 border-b border-[#3a494a]/50 bg-[#070d18] flex items-center px-4 gap-2 text-[11px] font-mono tracking-wider uppercase text-[#808e93]">
                <TermIcon className="w-3 h-3 text-[#00dce5]" />
                <span>Execution Console</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 font-mono text-[12px] space-y-1 text-[#a0aec0]">
                {terminalLogs.map((log, i) => (
                  <div key={i} className={`${
                    log.includes('[System]') 
                      ? 'text-cyan-400/80' 
                      : log.includes('[Running]') 
                        ? 'text-amber-400/80' 
                        : log.includes('[Iframe Preview Error]')
                          ? 'text-red-400/90'
                          : log.includes('[Iframe Preview Console]')
                            ? 'text-purple-400/90'
                            : 'text-slate-300'
                  }`}>{log}</div>
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
