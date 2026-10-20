import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarClock, CheckCircle2, Circle, Clock3, FolderKanban, Plus, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/authContext";
import { getAllTaskByUserId, getPastDue, getRecentActivity } from "../api/getTask";
import { getWorkspaces } from "../api/createWorkspace";

const statusLabel = { todo: "To do", doing: "In progress", done: "Done" };
const formatDate = date => date ? new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "No due date";
const dateKey = date => String(date || "").slice(0, 10);
const todayKey = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};
const isOverdue = task => task.due_date && task.status !== "done" && dateKey(task.due_date) < todayKey();
const formatDueDate = date => date ? new Date(`${dateKey(date)}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "No due date";

function PageSection({ title, action, children, className = "" }) {
  return (
    <section className={`overview-section ${className}`}>
      <div className="overview-section-heading">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function DashboardPage() {
  const { user, userLoading } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [activity, setActivity] = useState([]);
  const [pastDue, setPastDue] = useState({ completedPastDue: 0, urgentTask: null });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [summary, setSummary] = useState("");
  const [summaryError, setSummaryError] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    if (!userLoading && !user?.id) navigate("/login", { replace: true });
  }, [user, userLoading, navigate]);

  useEffect(() => {
    if (!user?.id) return undefined;
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    Promise.allSettled([
      getAllTaskByUserId(user.id),
      getWorkspaces(),
      getRecentActivity(),
      getPastDue(),
    ]).then(([taskResult, workspaceResult, activityResult, pastDueResult]) => {
      if (cancelled) return;
      if (taskResult.status === "fulfilled" && Array.isArray(taskResult.value.results)) setTasks(taskResult.value.results);
      else setLoadError("Your tasks could not be loaded. Please try again.");
      if (workspaceResult.status === "fulfilled" && Array.isArray(workspaceResult.value.workspaces)) setWorkspaces(workspaceResult.value.workspaces);
      if (activityResult.status === "fulfilled" && Array.isArray(activityResult.value.results)) setActivity(activityResult.value.results);
      if (pastDueResult.status === "fulfilled" && pastDueResult.value.results) setPastDue(pastDueResult.value.results);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [user?.id, refreshKey]);

  const counts = useMemo(() => ({
    todo: tasks.filter(task => task.status === "todo").length,
    doing: tasks.filter(task => task.status === "doing").length,
    done: tasks.filter(task => task.status === "done").length,
    overdue: tasks.filter(isOverdue).length,
  }), [tasks]);

  const workspaceTaskCounts = useMemo(() => {
    const byWorkspace = new Map();
    tasks.forEach(task => byWorkspace.set(task.workspace_id, (byWorkspace.get(task.workspace_id) || 0) + 1));
    return byWorkspace;
  }, [tasks]);

  const upcomingTasks = useMemo(() => [...tasks]
    .filter(task => task.status !== "done")
    .sort((a, b) => {
      if (isOverdue(a) !== isOverdue(b)) return isOverdue(a) ? -1 : 1;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    }), [tasks]);

  const generateSummary = async () => {
    setLoadingSummary(true);
    setSummaryError("");
    try {
      const prompt = `Write a concise work summary using only these facts. Assigned tasks: ${tasks.length}. To do: ${counts.todo}. In progress: ${counts.doing}. Done: ${counts.done}. Overdue: ${counts.overdue}. Completed past due: ${pastDue.completedPastDue}. Nearest task: ${pastDue.urgentTask?.title || "none"}. Keep under 80 words.`;
      const response = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (!response.ok || !data.success || !data.summary) throw new Error(data.message || "The summary service is unavailable.");
      setSummary(data.summary);
    } catch (error) {
      setSummaryError(error.message || "The summary service is unavailable.");
    } finally {
      setLoadingSummary(false);
    }
  };

  if (userLoading || loading) {
    return <div className="page-loading" role="status"><span className="page-spinner" />Loading your work…</div>;
  }

  return (
    <main className="overview-page">
      <div className="overview-content">
        <header className="overview-header">
          <div>
            <p className="eyebrow">Your work</p>
            <h1>Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {user?.name?.split(" ")[0] || "there"}</h1>
            <p className="overview-subtitle">A clear view of what needs your attention.</p>
          </div>
          <div className="overview-header-actions">
            <button className="button-secondary" onClick={() => navigate("/logged")}><Plus size={16} /> New workspace</button>
            <button className="button-primary" onClick={() => navigate(`/workspace/tasks/${user.id}`)}>Open my tasks <ArrowRight size={16} /></button>
          </div>
        </header>

        <div className="overview-status-line" aria-label="Task status summary">
          <span><Circle size={9} className="status-icon status-icon-todo" />{counts.todo} to do</span>
          <span><Clock3 size={14} className="status-icon status-icon-doing" />{counts.doing} in progress</span>
          <span><CheckCircle2 size={14} className="status-icon status-icon-done" />{counts.done} done</span>
          {counts.overdue > 0 && <span className="overview-overdue">{counts.overdue} overdue</span>}
        </div>

        {loadError && <div className="inline-error" role="alert">{loadError}<button onClick={() => setRefreshKey(value => value + 1)}>Retry</button></div>}

        <div className="overview-grid">
          <PageSection title="Coming up" action={<span className="section-count">{upcomingTasks.length}</span>} className="overview-tasks">
            {upcomingTasks.length === 0 ? (
              <div className="overview-empty"><CheckCircle2 size={20} /><span>You’re all caught up. New tasks assigned to you will appear here.</span></div>
            ) : upcomingTasks.slice(0, 8).map(task => (
              <button key={task.id} className="overview-task-row" onClick={() => navigate(`/workspace/${task.workspace_id}`, { state: { openTask: task } })}>
                <span className={`overview-task-marker marker-${task.status}`} aria-hidden="true" />
                <span className="overview-task-main"><strong>{task.title}</strong><small>{task.workspace_name}</small></span>
                <span className={`overview-task-status status-${task.status}`}>{statusLabel[task.status] || "To do"}</span>
                <span className={`overview-task-date ${isOverdue(task) ? "is-overdue" : ""}`}><CalendarClock size={14} />{formatDueDate(task.due_date)}</span>
              </button>
            ))}
            {upcomingTasks.length > 8 && <button className="overview-see-all" onClick={() => navigate(`/workspace/tasks/${user.id}`)}>See all {upcomingTasks.length} tasks <ArrowRight size={14} /></button>}
          </PageSection>

          <PageSection title="Your workspaces" action={<button className="text-link" onClick={() => navigate("/logged")}>See all</button>}>
            {workspaces.length === 0 ? (
              <div className="overview-empty"><FolderEmptyIcon /><span>No workspaces yet. Create one to organize work with your team.</span><button onClick={() => navigate("/logged")}>Create workspace</button></div>
            ) : workspaces.map(workspace => (
              <button key={workspace.id} className="overview-workspace-row" onClick={() => navigate(`/workspace/${workspace.id}`)}>
                <span className="workspace-monogram">{workspace.workspace_name?.trim()?.[0]?.toUpperCase() || "W"}</span>
                <span className="overview-workspace-name"><strong>{workspace.workspace_name}</strong><small>{workspace.role}</small></span>
                <span className="overview-workspace-count">{workspaceTaskCounts.get(workspace.id) || 0} assigned</span>
                <ArrowRight size={15} />
              </button>
            ))}
          </PageSection>

          <PageSection title="Recent activity" action={<span className="section-caption">Your updates</span>}>
            {activity.length === 0 ? (
              <div className="overview-empty"><span>Task updates you add will appear here.</span></div>
            ) : activity.slice(0, 5).map(item => (
              <div key={item.id} className="overview-activity-row">
                <span className="activity-timeline-dot" aria-hidden="true" />
                <span className="overview-activity-copy"><strong>{item.task_title}</strong><small>{item.message} · {item.workspace_name}</small></span>
                <time>{formatDate(item.created_at)}</time>
              </div>
            ))}
          </PageSection>

          <PageSection title="Work summary" action={<Sparkles size={16} className="summary-icon" />}>
            <p className="summary-description">Generate a short summary from your current task data.</p>
            <button className="button-secondary summary-button" onClick={generateSummary} disabled={loadingSummary || tasks.length === 0}>
              <Sparkles size={15} />{loadingSummary ? "Preparing summary…" : "Generate summary"}
            </button>
            {summaryError && <p role="alert" className="summary-error">{summaryError}</p>}
            {summary && <p className="summary-result">{summary}</p>}
            {pastDue.urgentTask && <p className="summary-nearest">Nearest due: <strong>{pastDue.urgentTask.title}</strong> · {formatDueDate(pastDue.urgentTask.due_date)}</p>}
          </PageSection>
        </div>
      </div>
    </main>
  );
}

function FolderEmptyIcon() {
  return <span className="workspace-empty-icon" aria-hidden="true"><FolderKanban size={15} /></span>;
}

export default DashboardPage;
