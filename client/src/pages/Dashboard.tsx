import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { gsap } from "gsap";
import {
  Plus,
  LogOut,
  ArrowRight,
  Code,
  Layout,
  Calendar,
  Trash2,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import toast from "react-hot-toast";

// --- Interfaces ---

interface ApiResponse {
  success: boolean;
  message?: string;
}

interface FetchRoomsResponse extends ApiResponse {
  rooms: Room[];
}

interface Room {
  _id?: string;
  roomId: string;
  name: string;
  language?: string;
  updatedAt: string | Date;
  owner?: string | { _id: string };
}

interface User {
  _id?: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
  isTwoFactorEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Dashboard() {
  const { user, setUser } = useAuth() as AuthContextType;
  const navigate = useNavigate();

  const glowRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [roomIdInput, setRoomIdInput] = useState<string>("");
  const [recentRooms, setRecentRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

    

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

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setUser(null);
          navigate("/");
          return;
        }

        const response = await fetch(`${backendUrl}/api/rooms`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          toast.error("Session expired, please log in.");
          navigate("/");
          return;
        }

        const data = (await response.json()) as FetchRoomsResponse;
        if (response.ok && data.success) {
          setRecentRooms(data.rooms);
        } else {
          toast.error(data.message || "Failed to load workspaces");
        }
      } catch (err: unknown) {
        toast.error("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [navigate, setUser]);

  const handleCreateRoom = async () => {
    const generatedId = Math.random().toString(36).substring(2, 9);
    const roomName = prompt(
      "Enter a name for your workspace:",
      "Untitled Workspace",
    );
    if (roomName === null) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendUrl}/api/rooms`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ roomId: generatedId, name: roomName }),
      });
      const data = (await response.json()) as ApiResponse;
      if (response.ok && data.success) {
        toast.success("Workspace created!");
        navigate(`/editor/${generatedId}`, {
          state: { userName: user?.name || "Developer", room: generatedId },
        });
      } else {
        toast.error(data.message || "Failed to create workspace");
      }
    } catch (err: unknown) {
      toast.error("Error creating workspace");
    }
  };

  const handleJoinRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!roomIdInput.trim()) {
      toast.error("Please enter a valid Room ID");
      return;
    }
    navigate(`/editor/${roomIdInput}`, {
      state: { userName: user?.name || "Developer", room: roomIdInput },
    });
  };

  const handleDeleteRoom = async (
    e: React.MouseEvent<HTMLButtonElement>,
    roomId: string,
  ) => {
    e.stopPropagation();
    if (
      window.confirm(
        "Are you sure you want to delete this workspace? This action cannot be undone.",
      )
    ) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${backendUrl}/api/rooms/${roomId}`, {
          method: "DELETE",
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = (await response.json()) as ApiResponse;

        if (response.ok && data.success) {
          toast.success("Workspace deleted successfully!");
          setRecentRooms((prev) => prev.filter((r) => r.roomId !== roomId));
        } else {
          toast.error(data.message || "Failed to delete workspace");
        }
      } catch (err: unknown) {
        toast.error("Error connecting to server");
      }
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${backendUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.success("Logged out successfully");
      navigate("/");
    } catch (err: unknown) {
      toast.error("Logout failed");
    }
  };

  const [isToggling2FA, setIsToggling2FA] = useState<boolean>(false);

  const handleToggle2FA = async () => {
    if (!user?.isEmailVerified) {
      toast.error("Please verify your email address before enabling 2FA.");
      return;
    }

    setIsToggling2FA(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${backendUrl}/api/auth/2fa/toggle`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser((prev) => {
          if (!prev) return null;
          const updated = {
            ...prev,
            isTwoFactorEnabled: data.isTwoFactorEnabled,
          };
          localStorage.setItem("user", JSON.stringify(updated));
          return updated;
        });
        toast.success(data.message || "2FA setting updated");
      } else {
        toast.error(data.message || "Failed to update 2FA setting");
      }
    } catch (err) {
      toast.error("Error connecting to server");
    } finally {
      setIsToggling2FA(false);
    }
  };

  const [isSendingVerification, setIsSendingVerification] = useState<boolean>(false);

  const handleSendVerification = async () => {
    setIsSendingVerification(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${backendUrl}/api/auth/send-verification`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Verification link sent! Check your inbox.");
      } else {
        toast.error(data.message || "Failed to send verification link.");
      }
    } catch (err) {
      toast.error("Error connecting to server.");
    } finally {
      setIsSendingVerification(false);
    }
  };

  const getOwnerId = (owner: Room["owner"]) => {
    if (!owner) return null;
    return typeof owner === "string" ? owner : owner._id;
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
        <div
          ref={containerRef}
          className="max-w-6xl mx-auto px-6 py-12 relative z-20"
        >
          {/* Email Verification Warning Banner */}
          {user && user.isEmailVerified === false && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-amber-400 text-lg">⚠️</span>
                <div>
                  <p className="text-sm font-semibold text-amber-200">
                    Your email address is not verified
                  </p>
                  <p className="text-xs text-amber-300/70">
                    Please verify your email to secure your account and unlock features like 2FA.
                  </p>
                </div>
              </div>
              <button
                onClick={handleSendVerification}
                disabled={isSendingVerification}
                className="px-4 py-2 bg-amber-500 text-[#0b1324] font-bold rounded-lg text-xs hover:bg-amber-400 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {isSendingVerification ? "Sending..." : "Send Verification Email"}
              </button>
            </div>
          )}

          {/* Header */}
          <header className="flex justify-between items-center border-b border-[#3a494a]/40 pb-8 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#00dce5]/10 border border-[#00dce5]/30 flex items-center justify-center text-[#00dce5]">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#cbdfe2]">
                  HyperCode
                </h1>
                <p className="text-xs text-[#808e93]">Workspace Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-semibold text-[#dae2fb]">
                  {user?.name}
                </p>
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

          {user && !user.isEmailVerified && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-amber-400 text-lg">⚠️</span>
                <div>
                  <p className="text-sm font-semibold text-amber-200">
                    Your email address is not verified
                  </p>
                  <p className="text-xs text-amber-300/70">
                    Please verify your email to secure your account and enable
                    features like 2FA.
                  </p>
                </div>
              </div>
              <button
                onClick={handleSendVerification}
                disabled={isSendingVerification}
                className="px-4 py-2 bg-amber-500 text-[#0b1324] font-bold rounded-lg text-xs hover:bg-amber-400 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {isSendingVerification
                  ? "Sending..."
                  : "Send Verification Email"}
              </button>
            </div>
          )}

          <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Quick Actions Card */}
            <section className="md:col-span-1 space-y-6">
              <div className="bg-[#171f31]/60 backdrop-blur-md border border-[#3a494a]/50 p-6 rounded-xl space-y-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#01c8d2]">
                  Quick Actions
                </h2>

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
                  <label className="block text-xs font-semibold text-[#808e93]">
                    JOIN EXISTING WORKSPACE
                  </label>
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

                <div className="border-t border-[#3a494a]/30 my-4" />

                {/* 2FA Security Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-[#808e93]">
                      TWO-FACTOR AUTH (2FA)
                    </label>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        user?.isTwoFactorEnabled
                          ? "bg-[#00dce5]/10 text-[#00dce5] border border-[#00dce5]/30"
                          : "bg-red-500/10 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {user?.isTwoFactorEnabled ? "ENABLED" : "DISABLED"}
                    </span>
                  </div>

                  <button
                    onClick={handleToggle2FA}
                    disabled={isToggling2FA}
                    className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
                      user?.isTwoFactorEnabled
                        ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"
                        : "border-[#00dce5]/40 bg-[#00dce5]/10 text-[#00dce5] hover:bg-[#00dce5] hover:text-[#003739]"
                    }`}
                  >
                    {user?.isTwoFactorEnabled ? (
                      <>
                        <ShieldAlert className="w-4 h-4" />
                        {isToggling2FA ? "Updating..." : "Disable 2FA"}
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        {isToggling2FA
                          ? "Updating..."
                          : "Enable 2FA (Email OTP)"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>

            {/* Recent Workspaces Card */}
            <section className="md:col-span-2">
              <div className="bg-[#171f31]/60 backdrop-blur-md border border-[#3a494a]/50 p-6 rounded-xl min-h-[350px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#01c8d2]">
                    Recent Workspaces
                  </h2>
                  <span className="text-xs text-[#808e93] font-mono">
                    {recentRooms.length} Active
                  </span>
                </div>

                <div className="flex-1 space-y-4">
                  {loading ? (
                    <p className="text-sm font-mono text-[#808e93] text-center py-8">
                      Loading workspaces...
                    </p>
                  ) : recentRooms.length === 0 ? (
                    <p className="text-sm font-mono text-[#808e93] text-center py-8">
                      No workspaces found. Create one to get started!
                    </p>
                  ) : (
                    recentRooms.map((room) => (
                      <div
                        key={room._id || room.roomId}
                        onClick={() =>
                          navigate(`/editor/${room.roomId}`, {
                            state: {
                              userName: user?.name || "Developer",
                              room: room.roomId,
                            },
                          })
                        }
                        className="flex items-center justify-between p-4 rounded-lg bg-[#0b1324]/50 border border-[#3a494a]/30 hover:border-[#00dce5]/50 hover:bg-[#0b1324] transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-[#2d3547] flex items-center justify-center text-[#63f7ff]">
                            <Layout className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-[#cbdfe2] group-hover:text-[#00dce5] transition-colors">
                              {room.name}
                            </h3>
                            <p className="text-xs text-[#808e93] font-mono">
                              ID: #{room.roomId}
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex items-center gap-6">
                          <div className="hidden sm:block">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#2d3547] text-[#cbdfe2]">
                              {room.language || "javascript"}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-[#808e93] mt-1.5 justify-end">
                              <Calendar className="w-3 h-3" />{" "}
                              {new Date(room.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          {getOwnerId(room.owner) === user?._id && (
                            <button
                              onClick={(e) => handleDeleteRoom(e, room.roomId)}
                              className="text-[#808e93] hover:text-red-400 p-1.5 rounded transition-all cursor-pointer hover:bg-[#2d3547]/30 z-30"
                              title="Delete Workspace"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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
