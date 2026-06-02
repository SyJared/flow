import { useState } from "react";
import { registerUser } from "../api/register";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      const data = await registerUser({ name, email, password });
      if (data.errors) {
        setIsError(true);
        setMessage(data.errors.map((e) => e.message).join("\n"));
      } else {
        setIsError(false);
        setMessage(data.message);
      }
    } catch (err) {
      setIsError(true);
      setMessage("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[93vh] bg-[#e8e4e0] flex">

      {/* Left panel */}
      <div className="hidden lg:flex w-[42%] bg-[#202940] flex-col justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[-100px] w-[340px] h-[340px] rounded-full bg-[radial-gradient(circle,rgba(154,134,120,0.18)_0%,transparent_70%)]" />
        <div className="absolute bottom-[60px] left-[-60px] w-[240px] h-[240px] rounded-full bg-[radial-gradient(circle,rgba(75,64,56,0.35)_0%,transparent_70%)]" />


        {/* Text */}
        <div className="z-10">
          <h2 className="text-[#F4E6DA] text-[2.4rem] leading-[1.15] font-semibold mb-4">
            Start building<br />
            <span className="text-[#CAAA98] italic">your workflow.</span>
          </h2>
          <p className="text-[#9A8678] text-sm leading-relaxed max-w-[270px]">
            Join Flow and bring clarity to your projects, tasks, and team — all in one place.
          </p>
        </div>


      </div>

      {/* Form side */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">

          <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#8A7B70] mb-1.5">
            Create account
          </p>
          <h1 className="text-[#202940] text-[1.9rem] font-semibold leading-tight mb-1">
            Join Flow
          </h1>
          <p className="text-sm text-[#6F6258] mb-8">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#4B4038] font-medium border-b border-[#9A8678] pb-px hover:text-[#202940] transition-colors"
            >
              Sign in
            </button>
          </p>

          <form onSubmit={handleRegister} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5248] mb-1.5">
                Full name
              </label>
              <input
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-11 bg-white border border-[#4B4038]/25 rounded-[10px] px-3.5 text-sm text-[#202940] placeholder-[#b0a59e] outline-none transition-all focus:border-[#9A8678] focus:ring-2 focus:ring-[#9A8678]/15"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5248] mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11 bg-white border border-[#4B4038]/25 rounded-[10px] px-3.5 text-sm text-[#202940] placeholder-[#b0a59e] outline-none transition-all focus:border-[#9A8678] focus:ring-2 focus:ring-[#9A8678]/15"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5248] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-11 bg-white border border-[#4B4038]/25 rounded-[10px] px-3.5 pr-11 text-sm text-[#202940] placeholder-[#b0a59e] outline-none transition-all focus:border-[#9A8678] focus:ring-2 focus:ring-[#9A8678]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A8678] hover:text-[#4B4038] transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-[#8A7B70] mt-1.5">Use at least 8 characters.</p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#202940] hover:bg-[#2d3a55] active:scale-[0.985] text-[#F4E6DA] text-sm font-semibold rounded-[10px] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#4B4038]/18" />
            <span className="text-xs text-[#9A8678] font-medium">or</span>
            <div className="flex-1 h-px bg-[#4B4038]/18" />
          </div>

          <button
            onClick={() => navigate("/login")}
            className="w-full h-11 bg-transparent border border-[#4B4038]/28 hover:bg-[#4B4038]/07 hover:border-[#9A8678] text-[#4B4038] text-sm font-medium rounded-[10px] transition-all"
          >
            Sign in instead
          </button>

          {/* Status message */}
          {message && (
            <div className={`mt-4 px-3.5 py-2.5 rounded-[8px] text-sm font-medium flex items-start gap-2 ${
              isError
                ? "bg-[#993C1D]/10 text-[#993C1D] border border-[#993C1D]/20"
                : "bg-[#0F6E56]/10 text-[#0F6E56] border border-[#0F6E56]/20"
            }`}>
              {isError ? (
                <svg className="w-4 h-4 mt-px shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mt-px shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              <span className="whitespace-pre-line">{message}</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Register;