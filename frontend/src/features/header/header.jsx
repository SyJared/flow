import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Bell, ChevronDown, Menu, LayoutDashboard, FolderKanban, CheckSquare, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Notification from "../notification/notification";

function Header() {
  const { user, userLoading, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const name = user?.name || "User";
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };


  const workspaceMatch = location.pathname.match(/^\/workspace\/([^/]+)/);
  const workspaceId = workspaceMatch ? workspaceMatch[1] : null;


  const isActive = (path) => location.pathname === path;


  const navLinks = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },

  { label: "Workspace", icon: FolderKanban, path: `/` },
  { label: "Tasks", icon: CheckSquare, path: `/workspace/tasks/${user?.id}` },
  { label: "Team", icon: Users, path: `/` },
];

  if (userLoading || !user) return null;

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-16 bg-[#202940] z-50 border-b border-[#4B4038]/50">
        <div className="container mx-auto h-full px-4 sm:px-6">
          <div className="flex items-center justify-between h-full gap-4">

            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#4B4038] to-[#9A8678] flex items-center justify-center">
                <span className="text-[#CAAA98] font-bold text-sm">{name.charAt(0)}</span>
              </div>
              <span className="text-lg font-semibold text-[#CAAA98] hidden sm:block tracking-tight">Flow</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {navLinks.map(({ label, icon: Icon, path }) => (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                    ${
                      isActive(path)
                        ? "bg-[#4B4038]/40 text-[#CAAA98]"
                        : "text-[#9A8678] hover:text-[#CAAA98] hover:bg-[#4B4038]/20"
                    }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-2 shrink-0">

              <Notification />

              {/* User dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-md hover:bg-[#4B4038]/30 transition-colors focus:outline-none"
                >
                  <div className="w-7 h-7 rounded-full bg-[#4B4038] flex items-center justify-center text-[#CAAA98] text-xs font-semibold">
                    {initials}
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-[#CAAA98]">{name}</span>
                  <ChevronDown
                    size={14}
                    className={`hidden lg:block text-[#9A8678] transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-44 bg-[#202940] rounded-lg shadow-xl border border-[#4B4038]/50 overflow-hidden">
                    <div className="px-3 py-2 border-b border-[#4B4038]/30">
                      <p className="text-xs font-medium text-[#CAAA98] truncate">{name}</p>
                      <p className="text-xs text-[#9A8678] truncate">{user?.info?.email}</p>
                    </div>
                    {[["Your Profile", "#"], ["Settings", "#"]].map(([label, href]) => (
                      <a
                        key={label}
                        href={href}
                        className="block px-3 py-2 text-sm text-[#CAAA98] hover:bg-[#4B4038]/30 transition-colors"
                      >
                        {label}
                      </a>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-[#9A8678] hover:text-[#CAAA98] hover:bg-[#4B4038]/30 transition-colors"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="fixed top-16 left-0 w-full bg-[#202940] border-b border-[#4B4038]/50 z-40 md:hidden">
          <nav className="container mx-auto px-4 py-2 flex flex-col gap-1">
            {navLinks.map(({ label, icon: Icon, path }) => (
              <button
                key={label}
                onClick={() => {
                  navigate(path);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left
                  ${
                    isActive(path)
                      ? "bg-[#4B4038]/40 text-[#CAAA98]"
                      : "text-[#9A8678] hover:text-[#CAAA98] hover:bg-[#4B4038]/20"
                  }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}

export default Header;