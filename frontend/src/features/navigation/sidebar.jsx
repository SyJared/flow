import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckSquare2, ChevronDown, FolderKanban, LayoutDashboard, Plus, Users2 } from "lucide-react";
import { getWorkspaces } from "../../api/createWorkspace";
import { useAuth } from "../auth/authContext";

const primaryLinks = [
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { label: "All workspaces", path: "/logged", icon: FolderKanban },
  { label: "My tasks", icon: CheckSquare2, taskRoute: true },
  { label: "Teams", path: "/teams", icon: Users2 },
];

function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) return undefined;
    const loadWorkspaces = () => getWorkspaces()
      .then(response => {
        if (!cancelled) setWorkspaces(Array.isArray(response.workspaces) ? response.workspaces : []);
      })
      .catch(() => {
        if (!cancelled) setWorkspaces([]);
      });
    const refresh = () => loadWorkspaces();
    loadWorkspaces();
    window.addEventListener("flow-workspaces-changed", refresh);
    return () => {
      cancelled = true;
      window.removeEventListener("flow-workspaces-changed", refresh);
    };
  }, [user?.id]);

  if (!user?.id) return null;

  const tasksPath = `/workspace/tasks/${user.id}`;
  const currentWorkspaceId = location.pathname.match(/^\/workspace\/(\d+)$/)?.[1];

  return (
    <aside className="app-sidebar">
      <nav aria-label="Workspace navigation">
        <p className="sidebar-section-label">Workspace</p>
        <div className="sidebar-nav-list">
          {primaryLinks.map(({ label, path, icon: Icon, taskRoute }) => {
            const href = taskRoute ? tasksPath : path;
            const active = taskRoute
              ? location.pathname.startsWith("/workspace/tasks/")
              : location.pathname === path;
            return (
              <button key={label} className={`sidebar-nav-link ${active ? "is-active" : ""}`} onClick={() => navigate(href)} aria-current={active ? "page" : undefined}>
                <Icon size={17} strokeWidth={1.8} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        <div className="sidebar-section-heading">
          <button className="sidebar-section-toggle" onClick={() => setExpanded(value => !value)} aria-expanded={expanded}>
            <span className="sidebar-section-label">Your workspaces</span>
            <ChevronDown size={15} className={expanded ? "" : "is-collapsed"} />
          </button>
          <button className="sidebar-icon-action" aria-label="Create or manage workspaces" title="Create or manage workspaces" onClick={() => navigate("/logged")}>
            <Plus size={16} />
          </button>
        </div>

        {expanded && (
          <div className="sidebar-workspace-list">
            {workspaces.length === 0 ? (
              <button className="sidebar-empty-workspaces" onClick={() => navigate("/logged")}>Create your first workspace</button>
            ) : workspaces.map(workspace => {
              const active = String(workspace.id) === currentWorkspaceId;
              return (
                <button key={workspace.id} className={`sidebar-workspace-link ${active ? "is-active" : ""}`} onClick={() => navigate(`/workspace/${workspace.id}`)} aria-current={active ? "page" : undefined}>
                  <span className="sidebar-workspace-mark"><FolderKanban size={14} /></span>
                  <span className="sidebar-workspace-name">{workspace.workspace_name}</span>
                  <span className="sidebar-workspace-role">{workspace.role}</span>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <span className="sidebar-footer-mark">F</span>
        <span><strong>Flow</strong><small>Work, in motion.</small></span>
      </div>
    </aside>
  );
}

export default Sidebar;
