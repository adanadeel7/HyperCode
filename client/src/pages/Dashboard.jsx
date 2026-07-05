import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";
import { gsap } from "gsap";
import { Plus, LogOut, ArrowRight, Code, Layout, Calendar } from "lucide-react";
import toast from "react-hot-toast";

function Dashboard() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const glowRef = useRef(null);
  const containerRef = useRef(null);

  const [roomIdInput, setRoomIdInput] = useState("");
  const [recentRooms, setRecentRooms] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/rooms", {
          credentials: "include", // Transmits JWT token cookie
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setRecentRooms(data.rooms);
        } else {
          toast.error(data.message || "Failed to load workspaces");
        }
      } catch (err) {
        toast.error("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleCreateRoom = async () => {
    const generatedId = Math.random().toString(36).substring(2, 9);
    const roomName = prompt("Enter a name for your workspace:", "Untitled Workspace");
    if (roomName === null) return; // Cancelled by user

    try {
      const response = await fetch("http://localhost:8000/api/rooms", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: generatedId, name: roomName })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Workspace created!");
        navigate(`/editor/${generatedId}`, {
          state: { userName: user?.name || "Developer", room: generatedId }
        });
      } else {
        toast.error(data.message || "Failed to create workspace");
      }
    } catch (err) {
      toast.error("Error creating workspace");
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!roomIdInput.trim()) {
      toast.error("Please enter a valid Room ID");
      return;
    }
    navigate(`/editor/${roomIdInput}`, {
      state: { userName: user?.name || "Developer", room: roomIdInput }
    });
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/api/auth/logout", { 
        method: "POST",
        credentials: "include"
      });
      setUser(null);
      toast.success("Logged out successfully");
      navigate("/");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <>
      {/* Dynamic Cursor Glow */}
      <div
        ref={glowRef}
        className="pointer-events-none fixed w-96 h-96 rounded-full bg-[#63f7ff] opacity-5 blur-[100px] z-10"
        style={{ transform: "translate(-50%, -50%)", top: 0, left: 0 }}
      />

      <div
        className="w-full min-h-screen bg-[#0b1324] text-[#dae2fb] font-sans antialiased relative overflow-hidden z-0"
        style={{
          backgroundSize: "40px 40px",
          backgroundImage: `
            linear-gradient(to right, rgba(0, 220, 229, 0.03) 1px, transparent 1px), 
            linear-gradient(to bottom, rgba(0, 220, 229, 0.03) 1px, transparent 1px)`,
        }}
      >
        <div ref={containerRef} className="max-w-6xl mx-auto px-6 py-12 relative z-20">
          
          {/* Header */}
          <header className="flex justify-between items-center border-b border-[#3a494a]/40 pb-8 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#00dce5]/10 border border-[#00dce5]/30 flex items-center justify-center text-[#00dce5]">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#cbdfe2]">HyperCode</h1>
                <p className="text-xs text-[#808e93]">Workspace Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-semibold text-[#dae2fb]">{user?.name}</p>
                <p className="text-xs text-[#808e93]">{user?.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500 hover:text-white transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          </header>

          <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Quick Actions Card */}
            <section className="md:col-span-1 space-y-6">
              <div className="bg-[#171f31]/60 backdrop-blur-md border border-[#3a494a]/50 p-6 rounded-xl space-y-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#01c8d2]">Quick Actions</h2>

                {/* Create Room Action */}
                <button
                  onClick={handleCreateRoom}
                  className="w-full flex items-center justify-between p-4 rounded-lg bg-[#00dce5] text-[#003739] font-semibold hover:bg-[#63f7ff] transition-all cursor-pointer group"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" /> Create Workspace
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="border-t border-[#3a494a]/30 my-4" />

                {/* Join Room Form */}
                <form onSubmit={handleJoinRoom} className="space-y-3">
                  <label className="block text-xs font-semibold text-[#808e93]">JOIN EXISTING WORKSPACE</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter Room ID"
                      value={roomIdInput}
                      onChange={(e) => setRoomIdInput(e.target.value)}
                      className="flex-1 bg-[#0b1324] text-sm text-[#cbdfe2] px-3 py-2.5 rounded border border-[#3a494a] font-mono focus:outline-none focus:border-[#00dce5]"
                    />
                    <button
                      type="submit"
                      className="px-4 bg-[#2d3547] text-white rounded border border-[#3a494a] hover:bg-[#3a494a] transition-all cursor-pointer flex items-center justify-center text-sm"
                    >
                      Join
                    </button>
                  </div>
                </form>
              </div>
            </section>

            {/* Recent Workspaces Card */}
            <section className="md:col-span-2">
              <div className="bg-[#171f31]/60 backdrop-blur-md border border-[#3a494a]/50 p-6 rounded-xl min-h-[350px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#01c8d2]">Recent Workspaces</h2>
                  <span className="text-xs text-[#808e93] font-mono">{recentRooms.length} Active</span>
                </div>

                <div className="flex-1 space-y-4">
                  {loading ? (
                    <p className="text-sm font-mono text-[#808e93] text-center py-8">Loading workspaces...</p>
                  ) : recentRooms.length === 0 ? (
                    <p className="text-sm font-mono text-[#808e93] text-center py-8">No workspaces found. Create one to get started!</p>
                  ) : (
                    recentRooms.map((room) => (
                      <div 
                        key={room._id || room.roomId}
                        onClick={() => navigate(`/editor/${room.roomId}`, { state: { userName: user?.name || "Developer", room: room.roomId } })}
                        className="flex items-center justify-between p-4 rounded-lg bg-[#0b1324]/50 border border-[#3a494a]/30 hover:border-[#00dce5]/50 hover:bg-[#0b1324] transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-[#2d3547] flex items-center justify-center text-[#63f7ff]">
                            <Layout className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-[#cbdfe2] group-hover:text-[#00dce5] transition-colors">{room.name}</h3>
                            <p className="text-xs text-[#808e93] font-mono">ID: #{room.roomId}</p>
                          </div>
                        </div>

                        <div className="text-right flex items-center gap-6">
                          <div className="hidden sm:block">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#2d3547] text-[#cbdfe2]">{room.language || "javascript"}</span>
                            <span className="flex items-center gap-1 text-[10px] text-[#808e93] mt-1.5 justify-end">
                              <Calendar className="w-3 h-3" /> {new Date(room.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#808e93] group-hover:text-[#00dce5] group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>
    </>
  );
}

export default Dashboard;