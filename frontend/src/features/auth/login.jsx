import { useState } from "react";
import { loginUser } from "../../api/auth.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./authContext.jsx";

function Login() {
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      const data = await loginUser({ email, password });
      if (data.success) {
        localStorage.setItem("token", data.token);
        setUser({
          id: data.user?.id || null,
          name: data.user?.name || "",
          email: data.user?.email || "",
        });
        setIsError(false);
        setMessage(data.message);
        navigate("/dashboard", { replace: true });
      } else {
        setIsError(true);
        setMessage(data.message);
      }
    } catch (err) {
      setIsError(true);
      setMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
      
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 93vh;
          background-color: #e8e4e0;
          display: flex;
          
          position: relative;
          overflow: hidden;
        }

        /* Decorative left panel */
        .login-panel {
          display: none;
          width: 42%;
          background-color: #202940;
          padding: 3rem;
         
          
          position: relative;
          overflow: hidden;
        }

        @media (min-width: 900px) {
          .login-panel { display: flex; }
        }

        .panel-noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        .panel-circle-1 {
          position: absolute;
          width: 380px;
          height: 380px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(154,134,120,0.18) 0%, transparent 70%);
          top: -100px;
          right: -120px;
        }

        .panel-circle-2 {
          position: absolute;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(75,64,56,0.35) 0%, transparent 70%);
          bottom: 80px;
          left: -60px;
        }

       

        .panel-body {
          z-index: 1;
        }

        .panel-headline {
          
          font-size: 2.6rem;
          line-height: 1.15;
          color: #F4E6DA;
          margin-bottom: 1.2rem;
        }

        .panel-headline em {
          font-style: italic;
          color: #CAAA98;
        }

        .panel-sub {
          font-size: 0.92rem;
          color: #9A8678;
          line-height: 1.7;
          max-width: 280px;
        }

        .panel-dots {
          z-index: 1;
          display: flex;
          gap: 6px;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4B4038;
        }

        .dot.active {
          background: #9A8678;
          width: 20px;
          border-radius: 3px;
        }

        /* Right / form side */
        .login-form-side {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1.5rem;
        }

        .login-card {
          width: 100%;
          max-width: 400px;
        }

        .card-eyebrow {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #8A7B70;
          margin-bottom: 0.6rem;
        }

        .card-title {
          
          font-size: 2rem;
          color: #202940;
          margin-bottom: 0.4rem;
          line-height: 1.2;
        }

        .card-sub {
          font-size: 0.875rem;
          color: #6F6258;
          margin-bottom: 2.4rem;
        }

        .card-sub a {
          color: #4B4038;
          font-weight: 500;
          text-decoration: none;
          border-bottom: 1px solid #9A8678;
          padding-bottom: 1px;
          cursor: pointer;
        }

        .field {
          margin-bottom: 1.1rem;
        }

        .field-label {
          display: block;
          font-size: 0.78rem;
          font-weight: 600;
          color: #5E5248;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 0.45rem;
        }

        .field-wrap {
          position: relative;
        }

        .field-input {
          width: 100%;
          height: 46px;
          background: #fff;
          border: 1.5px solid rgba(75,64,56,0.22);
          border-radius: 10px;
          padding: 0 14px;
          font-size: 0.9rem;
          color: #202940;
          
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
        }

        .field-input::placeholder { color: #b0a59e; }

        .field-input:focus {
          border-color: #9A8678;
          box-shadow: 0 0 0 3px rgba(154,134,120,0.15);
        }

        .field-input.has-action { padding-right: 44px; }

        .field-action {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #9A8678;
          padding: 4px;
          line-height: 0;
          transition: color 0.15s;
        }

        .field-action:hover { color: #4B4038; }

        .forgot {
          display: block;
          text-align: right;
          font-size: 0.78rem;
          color: #8A7B70;
          margin-top: 0.45rem;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.15s;
        }

        .forgot:hover { color: #4B4038; }

        .submit-btn {
          width: 100%;
          height: 48px;
          background: #202940;
          color: #F4E6DA;
          border: none;
          border-radius: 10px;
          
          font-size: 0.92rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 1.6rem;
          letter-spacing: 0.02em;
          transition: background 0.18s, transform 0.12s;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-btn:hover:not(:disabled) { background: #2d3a55; }
        .submit-btn:active:not(:disabled) { transform: scale(0.985); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(244,230,218,0.35);
          border-top-color: #F4E6DA;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 1.4rem 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(75,64,56,0.18);
        }

        .divider-text {
          font-size: 0.75rem;
          color: #9A8678;
          font-weight: 500;
        }

        .register-btn {
          width: 100%;
          height: 44px;
          background: transparent;
          border: 1.5px solid rgba(75,64,56,0.28);
          border-radius: 10px;
          
          font-size: 0.88rem;
          font-weight: 500;
          color: #4B4038;
          cursor: pointer;
          transition: background 0.16s, border-color 0.16s;
        }

        .register-btn:hover {
          background: rgba(75,64,56,0.07);
          border-color: #9A8678;
        }

        .status-msg {
          margin-top: 1rem;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 0.83rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-msg.error {
          background: rgba(153,60,29,0.09);
          color: #993C1D;
          border: 1px solid rgba(153,60,29,0.2);
        }

        .status-msg.success {
          background: rgba(15,110,86,0.09);
          color: #0F6E56;
          border: 1px solid rgba(15,110,86,0.2);
        }

        .status-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }
      `}</style>

      <div className="login-root ">
        {/* Left decorative panel */}
        <div className="login-panel">
          <div className="panel-noise" />
          <div className="panel-circle-1" />
          <div className="panel-circle-2" />

          

          <div className="panel-body flex flex-col justify-center">
            <h2 className="panel-headline">
              Where work<br /><em>finds its flow.</em>
            </h2>
            <p className="panel-sub">
              Manage workspaces, tasks, and teams — all in one calm, focused place.
            </p>
          </div>

        </div>

        {/* Form side */}
        <div className="login-form-side">
          <div className="login-card">
            <p className="card-eyebrow">Welcome back</p>
            <h1 className="card-title">Sign in to Flow</h1>
            <p className="card-sub">
              Don't have an account?{" "}
              <a onClick={() => navigate("/register")}>Create one</a>
            </p>

            <form onSubmit={handleLogin}>
              <div className="field">
                <label className="field-label" htmlFor="email">Email</label>
                <div className="field-wrap">
                  <input
                    id="email"
                    className="field-input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="password">Password</label>
                <div className="field-wrap">
                  <input
                    id="password"
                    className={`field-input has-action`}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="field-action"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <a className="forgot">Forgot password?</a>
              </div>

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">or</span>
              <div className="divider-line" />
            </div>

            <button className="register-btn" onClick={() => navigate("/register")}>
              Create a new account
            </button>

            {message && (
              <div className={`status-msg ${isError ? "error" : "success"}`}>
                {isError ? (
                  <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                ) : (
                  <svg className="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;