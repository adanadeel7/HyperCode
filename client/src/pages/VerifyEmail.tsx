import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';

const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const backendUrl = import.meta.env.VITE_BACKEND_URL || (isLocalhost ? "http://localhost:8000" : "https://hypercode-18ib.onrender.com");

function VerifyEmail() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");
  const [resendEmail, setResendEmail] = useState<string>("");
  const [isResending, setIsResending] = useState<boolean>(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { 
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    if (!token) { 
      setStatus("error"); 
      setMessage("Verification token is missing from the link.");
      return; 
    }

    const verifyToken = async () => { 
      try {
        const res = await fetch(`${backendUrl}/api/auth/verify-email?token=${token}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
          toast.success("Email verified! Redirecting to login...");
          setTimeout(() => navigate("/"), 3000);
        } else {
          setStatus("error");
          setMessage(data.message || "Invalid or expired verification link.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Failed to reach verification server.");
      }
    };

    verifyToken();
  }, [location.search, navigate]);

  const handleResend = async (e: React.FormEvent) => { 
    e.preventDefault(); 

    if (!resendEmail) { 
      toast.error("Please enter your email");
      return;
    }

    setIsResending(true);
    try {
      const response = await axios.post(`${backendUrl}/api/auth/resend-verification`, {
        email: resendEmail,
      });
      
      if (response.data.success) { 
        toast.success(response.data.message || "Verification email sent!");
      }
    } catch (error: any) { 
      toast.error(error.response?.data?.message || "Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };
  
  return (
    <div
      className="w-full min-h-screen bg-[#0b1324] relative overflow-hidden z-0 flex flex-col justify-center items-center p-6"
      style={{
        backgroundSize: "40px 40px",
        backgroundImage: `
          linear-gradient(to right, rgba(0, 220, 229, 0.04) 1px, transparent 1px), 
          linear-gradient(to bottom, rgba(0, 220, 229, 0.04) 1px, transparent 1px)`,
      }}
    >
      <div className="pointer-events-none fixed w-96 h-96 rounded-full bg-[#00dce5] opacity-10 blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="max-w-md w-full bg-[#171f31]/80 backdrop-blur-xl border border-[#3a494a]/60 rounded-2xl p-8 shadow-2xl relative z-10 text-center">
        {status === "loading" && (
          <div className="space-y-4 py-8">
            <Loader2 className="w-12 h-12 text-[#00dce5] animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-[#cbdfe2]">Verifying Email...</h2>
            <p className="text-sm text-[#808e93]">Please wait while we confirm your credentials.</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-5 py-6">
            <div className="w-16 h-16 rounded-full bg-[#00dce5]/10 border border-[#00dce5]/40 flex items-center justify-center mx-auto text-[#00dce5]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-[#63f7ff]">Email Verified!</h2>
            <p className="text-sm text-[#cbdfe2]">{message}</p>
            <p className="text-xs text-[#808e93]">Redirecting you to login automatically...</p>
            
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#00dce5] hover:bg-[#63f7ff] text-[#003739] font-bold rounded-lg text-sm transition-all"
            >
              Go to Login Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6 py-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
              <XCircle className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-400">Verification Failed</h2>
              <p className="text-sm text-[#808e93] mt-2">{message}</p>
            </div>

            <form onSubmit={handleResend} className="space-y-3 pt-4 border-t border-[#3a494a]/40 text-left">
              <label className="text-xs font-semibold uppercase text-[#808e93] tracking-wider block">
                Resend Verification Link
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="flex-1 bg-[#0b1324] border border-[#3a494a]/50 rounded-lg px-3 py-2 text-sm text-[#cbdfe2] focus:outline-none focus:border-[#00dce5]"
                />
                <button
                  type="submit"
                  disabled={isResending}
                  className="px-4 py-2 bg-[#00dce5]/10 hover:bg-[#00dce5]/20 border border-[#00dce5]/40 text-[#00dce5] rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isResending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Resend"}
                </button>
              </div>
            </form>

            <Link to="/" className="text-xs text-[#808e93] hover:text-[#00dce5] transition-colors inline-block mt-4">
              ← Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;