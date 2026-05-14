import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/authContext";
import { getAllTaskByUserId, getRecentActivity } from "../api/getTask";
import { getWorkspaces } from "../api/createWorkspace";

// ── helpers ──────────────────────────────────────────────────────────────────

function getInitials(name = "") {
  return String(name)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isOverdue(dueDate, status) {
  if (!dueDate || status === "done") return false;
  return new Date(dueDate) < new Date();
}

const STATUS_STYLE = {
  todo:  { label: "To Do",       cls: "badge-todo" },
  doing: { label: "In Progress", cls: "badge-doing" },
  done:  { label: "Done",        cls: "badge-done" },
};

const PRIORITY_STYLE = {
  high:   { cls: "badge-high" },
  medium: { cls: "badge-med" },
  low:    { cls: "badge-low" },
};

const AVATAR_COLORS = [
  { bg: "#B5D4F4", text: "#0C447C" },
  { bg: "#9FE1CB", text: "#085041" },
  { bg: "#F5C4B3", text: "#712B13" },
  { bg: "#CECBF6", text: "#3C3489" },
  { bg: "#FAC775", text: "#633806" },
];

function avatarColor(str = "") {
  const safe = String(str);

  if (!safe.length) return AVATAR_COLORS[0];

  const i = safe.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[i];
}

// ── sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, valueColor }) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <p className="stat-value" style={valueColor ? { color: valueColor } : {}}>
        {value ?? "—"}
      </p>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  );
}

function SectionCard({ title, badge, children }) {
  return (
    <div className="db-card">
      <div className="db-card-header">
        <span className="db-card-title">{title}</span>
        {badge != null && (
          <span className="count-pill">{badge}</span>
        )}
      </div>
      <div className="db-card-body">{children}</div>
    </div>
  );
}

function EmptyNote({ text }) {
  return <p className="empty-note">{text}</p>;
}

// ── main page ─────────────────────────────────────────────────────────────────

function DashboardPage() {
  const { user, userLoading } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (userLoading) return;
    if (!user?.id) navigate("/login", { replace: true });
  }, [user, userLoading, navigate]);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      try {
        const [taskData, wsData, activityData] = await Promise.all([
          getAllTaskByUserId(user.id),
          getWorkspaces(),
          getRecentActivity(),
        ]);
        setTasks(Array.isArray(taskData.results) ? taskData.results : []);
        setWorkspaces(Array.isArray(wsData.workspaces) ? wsData.workspaces : []);
        setRecentActivity(activityData.results || []);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  // ── derived stats ───────────────────────────────────────────────────────────
  const total    = tasks.length;
  const todoCount  = tasks.filter((t) => t.status === "todo").length;
  const doingCount = tasks.filter((t) => t.status === "doing").length;
  const doneCount  = tasks.filter((t) => t.status === "done").length;
  const overdueCount = tasks.filter((t) => isOverdue(t.due_date, t.status)).length;

  // active tasks (not done), sorted: overdue first, then by due date
  const activeTasks = tasks
    .filter((t) => t.status !== "done")
    .sort((a, b) => {
      const aOd = isOverdue(a.due_date, a.status);
      const bOd = isOverdue(b.due_date, b.status);
      if (aOd && !bOd) return -1;
      if (!aOd && bOd) return 1;
      return new Date(a.due_date) - new Date(b.due_date);
    });

 
  // unique members across all workspaces via tasks
  const memberMap = new Map();
  tasks.forEach((t) => {
    if (t.assigned_to && !memberMap.has(t.assigned_to)) {
      memberMap.set(t.assigned_to, { name: t.assigned_to, role: "member" });
    }
    if (t.assigned_by && !memberMap.has(t.assigned_by)) {
      memberMap.set(t.assigned_by, { name: t.assigned_by, role: "member" });
    }
  });
  const members = Array.from(memberMap.values()).slice(0, 6);

  // workspace task counts
  const wsTaskCount = (wsName) =>
    tasks.filter((t) => t.workspace_name === wsName).length;

  if (loading) {
    return (
      <div className="db-loading">
        <div className="db-spinner" />
        <p>Loading dashboard…</p>
      </div>
    );
  }
console.log(tasks)
  return (
    <>
      <style>{`
        .db-root {
          min-height: 100vh;
          background: #F7F5F3;
          padding: 72px 0 48px;
          font-family: 'DM Sans', sans-serif;
        }
        .db-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* header */
        .db-header { margin-bottom: 28px; }
        .db-greeting {
          font-size: 22px;
          font-weight: 600;
          color: #202940;
          margin: 0 0 2px;
        }
        .db-sub {
          font-size: 13px;
          color: #9A8678;
          margin: 0;
        }

        /* stat grid */
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: #fff;
          border: 0.5px solid #E5E0DB;
          border-radius: 14px;
          padding: 16px 18px;
        }
        .stat-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #9A8678;
          margin: 0 0 8px;
        }
        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: #202940;
          margin: 0;
          line-height: 1;
        }
        .stat-sub {
          font-size: 11px;
          color: #B5ADA7;
          margin: 5px 0 0;
        }

        /* two col */
        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }

        /* cards */
        .db-card {
          background: #fff;
          border: 0.5px solid #E5E0DB;
          border-radius: 16px;
          overflow: hidden;
        }
        .db-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 18px;
          border-bottom: 0.5px solid #F0EDE9;
        }
        .db-card-title {
          font-size: 13px;
          font-weight: 600;
          color: #202940;
        }
        .db-card-body { padding: 12px 18px; }
        .count-pill {
          font-size: 10px;
          font-weight: 700;
          background: #F0EDE9;
          color: #6B5F58;
          padding: 2px 9px;
          border-radius: 20px;
        }

        /* task rows */
        .task-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 0;
          border-bottom: 0.5px solid #F0EDE9;
          cursor: pointer;
          transition: background 0.15s;
          border-radius: 6px;
        }
        .task-row:last-child { border-bottom: none; }
        .task-row:hover { background: #FAF9F7; }
        .task-title {
          font-size: 12px;
          font-weight: 500;
          color: #202940;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .task-ws {
          font-size: 10px;
          color: #9A8678;
          flex-shrink: 0;
        }
        .task-due {
          font-size: 10px;
          color: #B5ADA7;
          flex-shrink: 0;
        }

        /* badges */
        .badge {
          display: inline-block;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 2px 7px;
          border-radius: 20px;
          flex-shrink: 0;
        }
        .badge-todo   { background: #EBEBEB; color: #5F5E5A; }
        .badge-doing  { background: #FAC775; color: #633806; }
        .badge-done   { background: #C0DD97; color: #27500A; }
        .badge-high   { background: #F7C1C1; color: #791F1F; }
        .badge-med    { background: #FAC775; color: #633806; }
        .badge-low    { background: #C0DD97; color: #27500A; }
        .badge-overdue{ background: #F7C1C1; color: #791F1F; }

        /* workspace rows */
        .ws-row {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 9px 0;
          border-bottom: 0.5px solid #F0EDE9;
          cursor: pointer;
        }
        .ws-row:last-child { border-bottom: none; }
        .ws-row:hover .ws-name { color: #4B4038; }
        .ws-avatar {
          width: 34px; height: 34px;
          border-radius: 10px;
          background: #202940;
          color: #F5E6D3;
          font-size: 11px;
          font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ws-name {
          font-size: 13px;
          font-weight: 500;
          color: #202940;
          flex: 1;
          transition: color 0.15s;
        }
        .ws-role {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #9A8678;
        }
        .ws-count {
          font-size: 11px;
          color: #B5ADA7;
        }

        /* activity rows */
        .act-row {
          display: flex;
          gap: 10px;
          padding: 9px 0;
          border-bottom: 0.5px solid #F0EDE9;
          align-items: flex-start;
        }
        .act-row:last-child { border-bottom: none; }
        .act-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          margin-top: 4px;
          flex-shrink: 0;
        }
        .act-dot-doing { background: #EF9F27; }
        .act-dot-done  { background: #639922; }
        .act-text {
          font-size: 12px;
          color: #202940;
          flex: 1;
          line-height: 1.5;
        }
        .act-ws {
          font-size: 10px;
          color: #9A8678;
        }
        .act-date {
          font-size: 10px;
          color: #B5ADA7;
          flex-shrink: 0;
        }

        /* member rows */
        .mem-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          border-bottom: 0.5px solid #F0EDE9;
        }
        .mem-row:last-child { border-bottom: none; }
        .mem-avatar {
          width: 30px; height: 30px;
          border-radius: 50%;
          font-size: 10px;
          font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .mem-name {
          font-size: 13px;
          color: #202940;
          flex: 1;
        }

        /* empty */
        .empty-note {
          font-size: 12px;
          color: #B5ADA7;
          font-style: italic;
          padding: 8px 0;
          margin: 0;
        }

        /* loading */
        .db-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: #F7F5F3;
          color: #9A8678;
          font-size: 13px;
        }
        .db-spinner {
          width: 28px; height: 28px;
          border: 2px solid #4B4038;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 700px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
          .two-col   { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="db-root">
        <div className="db-inner">

          {/* Header */}
          <div className="db-header">
            <h1 className="db-greeting">
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},{" "}
              {user?.name?.split(" ")[0] ?? "there"} 👋
            </h1>
            <p className="db-sub">Here's what's on your plate today.</p>
          </div>

          {/* Stat Strip */}
          <div className="stat-grid">
            <StatCard label="Total tasks" value={total} sub="assigned to you" />
            <StatCard label="To do"       value={todoCount}   sub="not started"   valueColor="#888780" />
            <StatCard label="In progress" value={doingCount}  sub="active"        valueColor="#BA7517" />
            <StatCard label="Done"        value={doneCount}   sub="completed"     valueColor="#3B6D11" />
            <StatCard label="Overdue"     value={overdueCount} sub="past due date" valueColor={overdueCount > 0 ? "#A32D2D" : undefined} />
          </div>

          {/* Row 1: Active tasks + Workspaces */}
          <div className="two-col">
            <SectionCard title="Active tasks" badge={activeTasks.length}>
              {activeTasks.length === 0 ? (
                <EmptyNote text="No active tasks — you're all caught up!" />
              ) : (
                activeTasks.slice(0, 7).map((t) => {
                  const od = isOverdue(t.due_date, t.status);
                  const st = STATUS_STYLE[t.status] || STATUS_STYLE.todo;
                  const pr = PRIORITY_STYLE[t.priority] || PRIORITY_STYLE.low;
                  return (
                    <div
                      key={t.id}
                      className="task-row"
                      onClick={() =>
                        navigate(`/workspace/${t.workspace_id}`, {
                          state: { openTask: t },
                        })
                      }
                    >
                      <span className="task-title">{t.title}</span>
                      <span className="task-ws">{t.workspace_name}</span>
                      <span className={`badge ${pr.cls}`}>{t.priority}</span>
                      <span className={`badge ${st.cls}`}>{st.label}</span>
                      {od ? (
                        <span className="badge badge-overdue">overdue</span>
                      ) : (
                        <span className="task-due">{formatDate(t.due_date)}</span>
                      )}
                    </div>
                  );
                })
              )}
            </SectionCard>

            <SectionCard title="Your workspaces" badge={workspaces.length}>
              {workspaces.length === 0 ? (
                <EmptyNote text="No workspaces yet." />
              ) : (
                workspaces.map((ws) => (
                  <div
                    key={ws.id}
                    className="ws-row"
                    onClick={() => navigate(`/workspace/${ws.id}`)}
                  >
                    <div className="ws-avatar">{getInitials(ws.workspace_name)}</div>
                    <span className="ws-name">{ws.workspace_name}</span>
                    <span className="ws-count">{wsTaskCount(ws.workspace_name)} tasks</span>
                    <span className="ws-role">{ws.role}</span>
                  </div>
                ))
              )}
            </SectionCard>
          </div>

          {/* Row 2: Recent activity + Members */}
          <div className="two-col">
            <SectionCard title="Recent activity">
  {recentActivity.length === 0 ? (
    <EmptyNote text="No recent activity." />
  ) : (
    recentActivity.slice(0, 5).map((a) => (
      <div key={a.id} className="act-row">
        <div className="act-dot" />

        <div className="act-text">
          {a.message}

          <div className="act-ws">
            {a.workspace_name} • {a.task_title}
          </div>
        </div>

        <span className="act-date">
          {formatDate(a.created_at)}
        </span>
      </div>
    ))
  )}
</SectionCard>

            <SectionCard title="People you work with">
              {members.length === 0 ? (
                <EmptyNote text="No collaborators found." />
              ) : (
                members.map((m) => {
                  const col = avatarColor(m.name);
                  return (
                    <div key={m.name} className="mem-row">
                      <div
                        className="mem-avatar"
                        style={{ background: col.bg, color: col.text }}
                      >
                        {getInitials(m.name)}
                      </div>
                      <span className="mem-name">{m.name}</span>
                    </div>
                  );
                })
              )}
            </SectionCard>
          </div>

        </div>
      </div>
    </>
  );
}

export default DashboardPage;