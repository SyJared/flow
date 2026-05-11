import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { getAllTaskByUserId, getTask } from "../api/getTask";
import TaskList from "../features/task/tasklist";

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
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function isOverdue(dueDate, status) {
  if (!dueDate || status === "done") return false;
  return new Date(dueDate) < new Date();
}

function TaskCard({ task, onClick }) {
  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.low;
  const overdue = isOverdue(task.due_date, task.status);

  return (
    <div
      onClick={() => onClick(task)}
      className="group relative bg-white border border-gray-200 rounded-2xl p-5 cursor-pointer
                 hover:border-[#4B4038]/40 hover:shadow-lg hover:-translate-y-0.5
                 transition-all duration-200 overflow-hidden"
    >
      {/* Top accent line based on priority */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${priority.dot} opacity-60`} />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-[#202940] font-semibold text-sm leading-snug line-clamp-2 flex-1">
          {task.title}
        </h3>
        <p className="text-[11px] text-[#9A8678] mt-1">
        {task.workspace_name}
      </p>
        <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
          <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${priority.color}`}>
            {priority.label}
          </span>
          <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 mb-4 leading-relaxed line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Footer meta */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div />

        <div className="flex flex-col gap-0.5 items-end">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Due
          </span>
          <span className={`text-xs font-medium ${overdue ? "text-red-600" : "text-[#202940]"}`}>
            {overdue && "⚠ "}{formatDate(task.due_date)}
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#202940]/5 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-[#9A8678]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <p className="text-[#202940] font-semibold mb-1">No tasks yet</p>
      <p className="text-sm text-gray-400">Tasks assigned to this workspace will appear here.</p>
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

  // Modal (reuse existing TaskList's modal by rendering TaskList or open manually)
  const [selectedTask, setSelectedTask] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

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
          setError(data.message || "No tasks found.");
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
  console.log(tasks)
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

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            {error}
          </div>
        )}

        {/* Task Grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {filtered.length > 0
            ? filtered.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={(t) => { setSelectedTask(t); setIsOpen(true); }}
                />
              ))
            : <EmptyState />
          }
        </div>
      </div>

    </div>
  );
}

export default TasksPage;