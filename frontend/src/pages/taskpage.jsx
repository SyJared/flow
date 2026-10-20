import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/authContext";
import { getAllTaskByUserId } from "../api/getTask";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Status and priority config
const STATUS_CONFIG = {
  todo:  { label: "To Do",       color: "bg-slate-100 text-slate-600 border-slate-200" },
  doing: { label: "In Progress", color: "bg-amber-100 text-amber-700 border-amber-200" },
  done:  { label: "Done",        color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

const PRIORITY_CONFIG = {
  high:   { label: "High",   color: "bg-red-100 text-red-700 border-red-200",     dot: "bg-red-500" },
  medium: { label: "Medium", color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  low:    { label: "Low",    color: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" },
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(`${String(dateStr).slice(0, 10)}T00:00:00`).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function isOverdue(dueDate, status) {
  if (!dueDate || status === "done") return false;
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return String(dueDate).slice(0, 10) < todayKey;
}

function TaskCard({ task, onClick }) {
  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.low;
  const overdue = isOverdue(task.due_date, task.status);

  return (
    <button
      type="button"
      onClick={() => onClick(task)}
      className="task-inbox-row group w-full border-b border-gray-200 px-4 py-4 text-left transition-colors hover:bg-white"
    >
      <span className="task-inbox-title-block">
        <span className="task-inbox-title">{task.title}</span>
        {task.description && <span className="task-inbox-description">{task.description}</span>}
      </span>
      <span className="task-inbox-project">{task.workspace_name}</span>
      <span className={`task-status-label task-status-${task.status}`}><span aria-hidden="true" />{status.label}</span>
      <span className="task-inbox-priority"><i className={priority.dot} aria-hidden="true" />{priority.label}</span>
      <span className={`task-inbox-due ${overdue ? "is-overdue" : ""}`}>{formatDate(task.due_date)}{overdue && <span className="sr-only">, overdue</span>}</span>
    </button>
  );
}

function EmptyState({ error, hasFilters }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#202940]/5 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-[#9A8678]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            {error}
          </div>
        )}
      <p className="text-sm text-gray-500">{hasFilters ? "Try adjusting your filters." : error ? "Your tasks could not be loaded." : "Tasks assigned to you will appear here."}</p>
    </div>
  );
}

function TasksPage() {
  const { userId } = useParams();
  const { user, userLoading } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 9;

  // Modal (reuse existing TaskList's modal by rendering TaskList or open manually)

  useEffect(() => {
    if (userLoading) return;
    if (!user?.id) navigate("/login", { replace: true });
  }, [user, userLoading, navigate]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllTaskByUserId(userId);
        if (Array.isArray(data.results)) {
          setTasks(data.results);

        } else {
          setTasks([]);
          setError(data.message);
        }

      } catch (err) {
        console.error(err);
        setError("Failed to load tasks.");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    load();

  }, [userId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, priorityFilter, search]);
  // Derived filtered tasks
  const filtered = tasks.filter((t) => {
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
      const matchSearch =
      !search ||
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / tasksPerPage));
  const pageStart = (currentPage - 1) * tasksPerPage;
  const orderedTasks = [...filtered].sort((a, b) => {
    const aOverdue = isOverdue(a.due_date, a.status);
    const bOverdue = isOverdue(b.due_date, b.status);
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date) - new Date(b.due_date);
  });
  const paginatedTasks = orderedTasks.slice(pageStart, pageStart + tasksPerPage);
  const visibleStart = filtered.length === 0 ? 0 : pageStart + 1;
  const visibleEnd = Math.min(pageStart + tasksPerPage, filtered.length);

  // Counts per status
  const counts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    doing: tasks.filter((t) => t.status === "doing").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  const overdueCount = tasks.filter((t) => isOverdue(t.due_date, t.status)).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#4B4038] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#9A8678]">Loading tasks…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F3] pt-15 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Page Header */}
        <div className="mb-8">

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-[#202940] tracking-tight">Tasks overview</h1>
              <p className="text-sm text-[#9A8678] mt-0.5">
                {tasks.length} total
                {overdueCount > 0 && (
                  <span className="ml-2 text-red-500 font-semibold">· {overdueCount} overdue</span>
                )}
              </p>
            </div>
            {filtered.length > 0 && (
              <div className="flex items-center gap-3 text-xs text-[#6F6258]">
                <span>{visibleStart}–{visibleEnd} of {filtered.length}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Previous page"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-[#4B4038] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  ><ChevronLeft size={16} /></button>
                  <span className="min-w-12 text-center font-medium text-[#202940]">{currentPage} / {pageCount}</span>
                  <button
                    type="button"
                    aria-label="Next page"
                    disabled={currentPage >= pageCount}
                    onClick={() => setCurrentPage(page => Math.min(pageCount, page + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-[#4B4038] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  ><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stat Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: "all",   label: "All",         count: counts.all,   color: "bg-[#202940] text-white border-[#202940]" },
            { key: "todo",  label: "To Do",        count: counts.todo,  color: "bg-slate-100 text-slate-700 border-slate-200" },
            { key: "doing", label: "In Progress",  count: counts.doing, color: "bg-amber-100 text-amber-700 border-amber-200" },
            { key: "done",  label: "Done",         count: counts.done,  color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
          ].map(({ key, label, count, color }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-semibold transition-all
                ${statusFilter === key
                  ? color
                  : "bg-white text-gray-500 border-gray-200 hover:border-[#4B4038]/40 hover:text-[#202940]"
                }`}
            >
              {label}
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${statusFilter === key ? "bg-white/20" : "bg-gray-100 text-gray-600"}`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-[#202940]
                         placeholder-gray-400 outline-none focus:border-[#4B4038]/50 focus:ring-2 focus:ring-[#4B4038]/10"
            />
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-[#202940]
                       outline-none focus:border-[#4B4038]/50 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>



        {/* Task Grid */}
        <div className="task-inbox-list overflow-hidden rounded-2xl border border-black/10 bg-white">
          {filtered.length > 0 && (
            <div className="task-inbox-column-head"><span>Task</span><span>Workspace</span><span>Status</span><span>Priority</span><span>Due date</span></div>
          )}
          {filtered.length > 0
            ? paginatedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={(t) => navigate(`/workspace/${t.workspace_id}`, { state: { openTask: t } })}
                />
              ))
            : <EmptyState error={error} hasFilters={statusFilter !== "all" || priorityFilter !== "all" || Boolean(search)} />
          }
        </div>
      </div>

    </div>
  );
}

export default TasksPage;
