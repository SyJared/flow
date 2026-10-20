import { useEffect, useState } from "react";
import { Bell, ChevronDown, Menu, Settings2, UserRound, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Notification from "../notification/notification";
import { useAuth } from "../auth/authContext";
import { getPreferences } from "../../utils/preferences";

function Header() {
  const { user, userLoading, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [preferences, setPreferences] = useState(() => getPreferences(user?.id));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const syncPreferences = event => {
      if (!event?.detail?.userId || Number(event.detail.userId) === Number(user?.id)) {
        setPreferences(getPreferences(user?.id));
      }
    };
    setPreferences(getPreferences(user?.id));
    window.addEventListener("flow-preferences-changed", syncPreferences);
    return () => window.removeEventListener("flow-preferences-changed", syncPreferences);
  }, [user?.id]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  if (userLoading) return null;

  const name = user?.name || "User";
  const initials = name.split(" ").map(part => part[0]).join("").toUpperCase().slice(0, 2);
  const navLinks = [
    { label: "Overview", path: "/dashboard" },
    { label: "Workspaces", path: "/logged" },
    { label: "My tasks", path: `/workspace/tasks/${user?.id}` },
    { label: "Teams", path: "/teams" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <header className="app-header">
        <div className="app-header-brand">
          <button className="app-brand" onClick={() => navigate(user ? `/${preferences.landingPage}` : "/login")} aria-label="Flow home">
            <span>Flow</span>
          </button>
          {user && <span className="app-header-divider" aria-hidden="true" />}
          {user && <span className="app-header-caption">Team workspace</span>}
        </div>

        <div className="app-header-actions">
          {user ? (
            <>
              <Notification showUnreadBadge={preferences.showNotificationBadge} />
              <div className="app-account-wrap">
                <button className="app-account-button" onClick={() => setIsDropdownOpen(value => !value)} aria-expanded={isDropdownOpen} aria-haspopup="menu">
                  <span className="app-account-avatar">
                    {user.profile_picture ? <img src={`http://localhost:5000${user.profile_picture}`} alt="" /> : initials}
                  </span>
                  <span className="app-account-name">{name}</span>
                  <ChevronDown size={15} aria-hidden="true" />
                </button>
                {isDropdownOpen && (
                  <div className="app-account-menu" role="menu">
                    <div className="app-account-summary">
                      <strong>{name}</strong>
                      <span>{user.email}</span>
                    </div>
                    <button role="menuitem" onClick={() => navigate("/profile")}><UserRound size={16} /> Profile</button>
                    <button role="menuitem" onClick={() => navigate("/settings")}><Settings2 size={16} /> Settings</button>
                    <button role="menuitem" className="app-account-signout" onClick={handleLogout}>Sign out</button>
                  </div>
                )}
              </div>
              <button className="app-mobile-menu-toggle" aria-label={isMobileMenuOpen ? "Close navigation" : "Open navigation"} aria-expanded={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(value => !value)}>
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </>
          ) : (
            <div className="app-guest-actions">
              <button className="app-button app-button-secondary" onClick={() => navigate("/login")}>Sign in</button>
              <button className="app-button app-button-primary" onClick={() => navigate("/register")}>Create account</button>
            </div>
          )}
        </div>
      </header>

      {user && isMobileMenuOpen && (
        <nav className="app-mobile-nav" aria-label="Main navigation">
          {navLinks.map(({ label, path }) => (
            <button key={label} className={location.pathname === path ? "is-active" : ""} onClick={() => navigate(path)}>{label}</button>
          ))}
          <div className="app-mobile-nav-divider" />
          <button onClick={() => navigate("/profile")}>Profile</button>
          <button onClick={() => navigate("/settings")}>Settings</button>
          <button className="app-mobile-signout" onClick={handleLogout}>Sign out</button>
        </nav>
      )}
    </>
  );
}

export default Header;
