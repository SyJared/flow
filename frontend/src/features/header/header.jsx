import { useState } from "react";
import { useAuth } from "../auth/authContext";
import { Bell, ChevronDown, Menu, LayoutDashboard, FolderKanban, CheckSquare, Users, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Notification from "../notification/notification";

function Header() {
  const { user, userLoading, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = !!user;
  const name = user?.name || "User";
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Workspace", icon: FolderKanban, path: "/logged" },
    { label: "Tasks", icon: CheckSquare, path: `/workspace/tasks/${user?.id}` },
    { label: "Team", icon: Users, path: "/" },
  ];

  const publicLinks = [

  ];

  if (userLoading) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        .hdr-root {
          position: fixed;
          top: 0; left: 0;
          width: 100%;
          height: 64px;
          background-color: #202940;
          z-index: 50;
          border-bottom: 1px solid rgba(75,64,56,0.5);
          font-family: 'DM Sans', sans-serif;
        }

        .hdr-inner {
          max-width: 1200px;
          margin: 0 auto;
          height: 100%;
          padding: 0 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        /* Logo */
        .hdr-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          cursor: pointer;
          text-decoration: none;
        }

        .hdr-logo-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #4B4038, #9A8678);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          color: #CAAA98;
          flex-shrink: 0;
        }

        .hdr-logo-name {
          font-family: 'DM Serif Display', serif;
          font-size: 20px;
          color: #CAAA98;
          letter-spacing: 0.02em;
          line-height: 1;
        }

        /* Nav (logged in) */
        .hdr-nav {
          display: none;
          align-items: center;
          gap: 2px;
          flex: 1;
          justify-content: center;
        }

        @media (min-width: 768px) { .hdr-nav { display: flex; } }

        .hdr-nav-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 7px;
          font-size: 13.5px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          border: none;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          color: #9A8678;
          background: transparent;
          white-space: nowrap;
        }

        .hdr-nav-btn:hover {
          color: #CAAA98;
          background: rgba(75,64,56,0.2);
        }

        .hdr-nav-btn.active {
          color: #CAAA98;
          background: rgba(75,64,56,0.4);
        }

        /* Public nav links */
        .hdr-pub-nav {
          display: none;
          align-items: center;
          gap: 4px;
          flex: 1;
          justify-content: center;
        }

        @media (min-width: 768px) { .hdr-pub-nav { display: flex; } }

        .hdr-pub-link {
          padding: 6px 14px;
          border-radius: 7px;
          font-size: 13.5px;
          font-weight: 500;
          color: #9A8678;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.15s, background 0.15s;
        }

        .hdr-pub-link:hover {
          color: #CAAA98;
          background: rgba(75,64,56,0.2);
        }

        /* Right side */
        .hdr-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        /* Auth buttons (logged out) */
        .hdr-auth-login {
          padding: 6px 16px;
          height: 36px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          background: transparent;
          border: 1.5px solid rgba(154,134,120,0.4);
          color: #CAAA98;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          white-space: nowrap;
        }

        .hdr-auth-login:hover {
          border-color: #9A8678;
          background: rgba(154,134,120,0.1);
        }

        .hdr-auth-register {
          padding: 6px 16px;
          height: 36px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          background: #F4E6DA;
          border: none;
          color: #202940;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          white-space: nowrap;
        }

        .hdr-auth-register:hover { background: #e8d8cc; }
        .hdr-auth-register:active { transform: scale(0.97); }

        /* User dropdown */
        .hdr-user-wrap { position: relative; }

        .hdr-user-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 4px 8px 4px 4px;
          border-radius: 8px;
          background: none;
          border: none;
          cursor: pointer;
          transition: background 0.15s;
        }

        .hdr-user-btn:hover { background: rgba(75,64,56,0.3); }

        .hdr-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #4B4038;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: #CAAA98;
          flex-shrink: 0;
        }

        .hdr-username {
          font-size: 13.5px;
          font-weight: 500;
          color: #CAAA98;
          display: none;
        }

        @media (min-width: 1024px) { .hdr-username { display: block; } }

        .hdr-chevron {
          color: #9A8678;
          transition: transform 0.2s;
          display: none;
        }

        @media (min-width: 1024px) { .hdr-chevron { display: block; } }
        .hdr-chevron.open { transform: rotate(180deg); }

        /* Dropdown menu */
        .hdr-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 6px);
          width: 176px;
          background: #202940;
          border: 1px solid rgba(75,64,56,0.5);
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
          overflow: hidden;
          animation: dropIn 0.15s ease;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hdr-dropdown-head {
          padding: 10px 12px;
          border-bottom: 1px solid rgba(75,64,56,0.3);
        }

        .hdr-dropdown-name {
          font-size: 12px;
          font-weight: 600;
          color: #CAAA98;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hdr-dropdown-email {
          font-size: 11px;
          color: #9A8678;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 1px;
        }

        .hdr-dropdown-link {
          display: block;
          padding: 8px 12px;
          font-size: 13px;
          color: #CAAA98;
          text-decoration: none;
          transition: background 0.12s;
          cursor: pointer;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          font-family: 'DM Sans', sans-serif;
        }

        .hdr-dropdown-link:hover { background: rgba(75,64,56,0.3); }

        .hdr-dropdown-signout {
          display: block;
          width: 100%;
          text-align: left;
          padding: 8px 12px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          color: #e07a5f;
          background: none;
          border: none;
          cursor: pointer;
          transition: background 0.12s;
        }

        .hdr-dropdown-signout:hover { background: rgba(224,122,95,0.1); }

        /* Mobile toggle */
        .hdr-mobile-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: none;
          border: none;
          color: #9A8678;
          cursor: pointer;
          transition: color 0.15s, background 0.15s;
        }

        .hdr-mobile-toggle:hover {
          color: #CAAA98;
          background: rgba(75,64,56,0.3);
        }

        @media (min-width: 768px) { .hdr-mobile-toggle { display: none; } }

        /* Mobile drawer */
        .hdr-mobile-drawer {
          position: fixed;
          top: 64px; left: 0;
          width: 100%;
          background: #202940;
          border-bottom: 1px solid rgba(75,64,56,0.5);
          z-index: 40;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hdr-mobile-nav {
          padding: 8px 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .hdr-mobile-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #9A8678;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          text-align: left;
          transition: background 0.15s, color 0.15s;
        }

        .hdr-mobile-link:hover, .hdr-mobile-link.active {
          color: #CAAA98;
          background: rgba(75,64,56,0.35);
        }

        .hdr-mobile-divider {
          height: 1px;
          background: rgba(75,64,56,0.3);
          margin: 6px 12px;
        }

        .hdr-mobile-auth {
          padding: 10px 16px 14px;
          display: flex;
          gap: 8px;
        }

        .hdr-mobile-auth-login {
          flex: 1;
          height: 40px;
          border-radius: 8px;
          background: transparent;
          border: 1.5px solid rgba(154,134,120,0.4);
          color: #CAAA98;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
        }

        .hdr-mobile-auth-register {
          flex: 1;
          height: 40px;
          border-radius: 8px;
          background: #F4E6DA;
          border: none;
          color: #202940;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
        }

        /* Separator dot */
        .hdr-sep {
          width: 3px; height: 3px;
          border-radius: 50%;
          background: rgba(154,134,120,0.4);
          display: none;
        }
        @media (min-width: 768px) { .hdr-sep { display: block; } }
      `}</style>

      <header className="hdr-root">
        <div className="hdr-inner">

          {/* Logo */}
          <div className="hdr-logo" onClick={() => navigate("/")}>
            <div className="hdr-logo-icon">F</div>
            <span className="hdr-logo-name">Flow</span>
          </div>

          {/* Nav — logged in */}
          {isLoggedIn && (
            <nav className="hdr-nav">
              {navLinks.map(({ label, icon: Icon, path }) => (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  className={`hdr-nav-btn ${isActive(path) ? "active" : ""}`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </nav>
          )}

          {/* Nav — logged out */}
          {!isLoggedIn && (
            <nav className="hdr-pub-nav">
              {publicLinks.map(({ label, path }) => (
                <button
                  key={label}
                  className="hdr-pub-link"
                  onClick={() => navigate(path)}
                >
                  {label}
                </button>
              ))}
            </nav>
          )}

          {/* Right side */}
          <div className="hdr-right">

            {isLoggedIn ? (
              <>
                <Notification />

                <div className="hdr-user-wrap">
                  <button
                    className="hdr-user-btn"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <div className="hdr-avatar">{initials}</div>
                    <span className="hdr-username">{name}</span>
                    <ChevronDown
                      size={14}
                      className={`hdr-chevron ${isDropdownOpen ? "open" : ""}`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="hdr-dropdown">
                      <div className="hdr-dropdown-head">
                        <p className="hdr-dropdown-name">{name}</p>
                        <p className="hdr-dropdown-email">{user?.info?.email || user?.email}</p>
                      </div>
                      <button className="hdr-dropdown-link" onClick={() => { navigate("/profile"); setIsDropdownOpen(false); }}>
                        Your Profile
                      </button>
                      <button className="hdr-dropdown-link" onClick={() => { navigate("/settings"); setIsDropdownOpen(false); }}>
                        Settings
                      </button>
                      <button className="hdr-dropdown-signout" onClick={handleLogout}>
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button className="hdr-auth-login" onClick={() => navigate("/login")}>
                  Sign in
                </button>
                <button className="hdr-auth-register" onClick={() => navigate("/register")}>
                  Get started
                </button>
              </>
            )}

            {/* Mobile toggle */}
            <button
              className="hdr-mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {isMobileMenuOpen && (
        <div className="hdr-mobile-drawer">
          {isLoggedIn ? (
            <nav className="hdr-mobile-nav">
              {navLinks.map(({ label, icon: Icon, path }) => (
                <button
                  key={label}
                  className={`hdr-mobile-link ${isActive(path) ? "active" : ""}`}
                  onClick={() => { navigate(path); setIsMobileMenuOpen(false); }}
                >
                  <Icon size={17} />
                  {label}
                </button>
              ))}
              <div className="hdr-mobile-divider" />
              <button
                className="hdr-mobile-link"
                style={{ color: "#e07a5f" }}
                onClick={handleLogout}
              >
                Sign out
              </button>
            </nav>
          ) : (
            <>
              <nav className="hdr-mobile-nav">
                {publicLinks.map(({ label, path }) => (
                  <button
                    key={label}
                    className="hdr-mobile-link"
                    onClick={() => { navigate(path); setIsMobileMenuOpen(false); }}
                  >
                    {label}
                  </button>
                ))}
              </nav>
              <div className="hdr-mobile-auth">
                <button
                  className="hdr-mobile-auth-login"
                  onClick={() => { navigate("/login"); setIsMobileMenuOpen(false); }}
                >
                  Sign in
                </button>
                <button
                  className="hdr-mobile-auth-register"
                  onClick={() => { navigate("/register"); setIsMobileMenuOpen(false); }}
                >
                  Get started
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default Header;