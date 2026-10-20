import { useEffect, useState } from "react";
import { handleStatusDoing, taskMarkAsDone } from "../../api/handleStatusChange";
import { taskUpdates } from "../../api/taskUpdates";
import { getTaskUpdates } from "../../api/getTask";
import { updateTask } from "../../api/createTask";
import { useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

function ProgressPips({ value }) {
  const filled = Math.round((value / 100) * 5);
  return (
    <div className="flex gap-1 items-center">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-6 h-1 rounded-full ${i < filled ? "bg-emerald-500" : "bg-gray-200"}`}
        />
      ))}
      <span className="text-[10px] text-gray-400 ml-1">{value}%</span>
    </div>
  );
}

function isPastDue(date) {
  if (!date) return false;
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return String(date).slice(0, 10) < todayKey;
}

function TaskModal({ isOpen, setIsOpen, selectedTask, user, workspaceId, setSelectedTask, onTaskChange, members, canManage }) {
  const [updates, setUpdates] = useState([]);
  const [message, setMessage] = useState("");

  const [progress, setProgress] = useState(0);
  const [doingMessage, setDoingMessage] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [doneMessage, setDoneMessage] = useState("");
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isCompletingTask, setIsCompletingTask] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [editMessage, setEditMessage] = useState("");
  const [editForm, setEditForm] = useState({ title: "", description: "", priority: "medium", dueDate: "", assignedTo: "" });

  function formatHoursSpent(decimalHours) {
    if (!decimalHours && decimalHours !== 0) return "0m";
    const totalMinutes = Math.round(decimalHours * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  }

  useEffect(() => {
    if (!isOpen || !selectedTask) return;
    const dueDate = selectedTask.due_date ? String(selectedTask.due_date).slice(0, 10) : "";
    setEditForm({
      title: selectedTask.title || "",
      description: selectedTask.description || "",
      priority: selectedTask.priority || "medium",
      dueDate,
      assignedTo: String(selectedTask.assigned_to || ""),
    });
    const loadUpdates = async () => {
      try {
        const data = await getTaskUpdates({ workspaceId, taskId: selectedTask.id });
        setUpdates(Array.isArray(data.results) ? data.results : []);
      } catch (err) {
        console.log(err, "useeffecterror");
      }
    };
    loadUpdates();
  }, [isOpen, selectedTask, workspaceId]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnEscape = event => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, setIsOpen]);

  if (!isOpen || !selectedTask) return null;
  const canUpdateTask = Number(user) === Number(selectedTask.assigned_to);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingUpdate) return;
    setIsSubmittingUpdate(true);
    setSubmitMessage("");
    try {
      const res = await taskUpdates({
        id: user,
        status: "doing",
        workspaceId,
        taskId: selectedTask.id,
        message,
        progress,
      });
      if (res.update) {
        setUpdates((prev) => [res.update, ...prev]);
      }
      if (res.errors?.length) {
      setSubmitMessage(
        res.errors
          .map(e => `${e.message}`)
          .join("\n")
      );
      return; // stop here if validation failed
    }

      if (!res.success) {
        setSubmitMessage(res.message || "Could not add this update.");
        return;
      }

      setSubmitMessage(res.message);
      setMessage("");
    setProgress(0);
    } catch (err) {
      setSubmitMessage(err.message || "Could not add this update.");
    } finally {
      setIsSubmittingUpdate(false);
    }

  };

  const handleStatusChange = async () => {
    if (isChangingStatus) return;
    setIsChangingStatus(true);
    try {
      const data = await handleStatusDoing({
        id: user,
        status: "doing",
        workspaceId,
        taskId: selectedTask.id,
      });
      if (data.message && !data.errors) {
        setUpdates((prev) => [{ message: "Started Doing", progress: 0, created_at: new Date() }, ...prev]);
        setSelectedTask((prev) => ({ ...prev, status: "doing" }));
        onTaskChange?.();
      }
      setDoingMessage(data.message);
    } catch (err) {
      setDoingMessage(err.message || "Could not start this task.");
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleDone = async () => {
    if (isCompletingTask) return;
    setIsCompletingTask(true);
    try {
      const res = await taskMarkAsDone({
        taskId: selectedTask.id,
        workspaceId,
        status: "done",
      });
      if (res.update) {
        setUpdates((prev) => [res.update, ...prev]);
        setSelectedTask((prev) => ({ ...prev, status: "done" }));
        onTaskChange?.();
      }
      setDoneMessage(res.message);
    } catch (error) {
      setDoneMessage(error.message || "Could not complete this task.");
    } finally {
      setIsCompletingTask(false);
    }
  };

  const handleEditSubmit = async event => {
    event.preventDefault();
    setSavingTask(true);
    setEditMessage("");
    try {
      const response = await updateTask(workspaceId, selectedTask.id, editForm);
      if (!response.success) throw new Error(response.message || response.errors?.map(error => error.message).join("\n") || "Could not update this task.");
      const updatedTask = { ...selectedTask, ...response.task };
      setSelectedTask(updatedTask);
      setEditMode(false);
      setEditMessage("Task details saved.");
      await onTaskChange?.();
    } catch (error) {
      setEditMessage(error.message || "Could not update this task.");
    } finally {
      setSavingTask(false);
    }
  };

  return (
    <div className="task-detail-overlay fixed inset-0 z-50 flex" role="presentation">
      {/* Overlay */}
      <button type="button" aria-label="Close task details" onClick={() => setIsOpen(false)} className="task-detail-backdrop flex-1 bg-black/40" />

      {/* Drawer */}
      <section className="task-detail-drawer w-[440px] max-w-full bg-white h-full shadow-xl flex flex-col" role="dialog" aria-modal="true" aria-labelledby="task-detail-title">

        {/* Header */}
        <div className="flex justify-between items-start gap-3 px-5 py-4 border-b border-gray-200">
          <div className="min-w-0">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-500">Task details</p>
            <h2 id="task-detail-title" className="text-lg font-semibold leading-snug">{selectedTask.title}</h2>
          </div>
          <div className="flex items-center gap-1">
          {canManage && <button type="button" onClick={() => { setEditMode(value => !value); setEditMessage(""); }} className="min-h-11 rounded-lg px-3 text-sm font-medium text-blue-700 hover:bg-blue-50">{editMode ? "Cancel edit" : "Edit"}</button>}
          <button
            type="button"
            aria-label="Close task details"
            onClick={() => setIsOpen(false)}
            className="flex h-11 w-11 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            ✕
          </button>
          </div>
        </div>

        {editMode ? (
          <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto px-5 py-5">
            <div className="grid gap-4">
              <label className="grid gap-1.5 text-sm font-medium text-gray-700">Title
                <input required maxLength={255} value={editForm.title} onChange={event => setEditForm(current => ({ ...current, title: event.target.value }))} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-gray-700">Description
                <textarea value={editForm.description} onChange={event => setEditForm(current => ({ ...current, description: event.target.value }))} rows={4} maxLength={5000} className="w-full resize-y rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1.5 text-sm font-medium text-gray-700">Priority
                  <select value={editForm.priority} onChange={event => setEditForm(current => ({ ...current, priority: event.target.value }))} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm">
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                  </select>
                </label>
                <label className="grid gap-1.5 text-sm font-medium text-gray-700">Due date
                  <input type="date" value={editForm.dueDate} onChange={event => setEditForm(current => ({ ...current, dueDate: event.target.value }))} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
                </label>
              </div>
              <label className="grid gap-1.5 text-sm font-medium text-gray-700">Assignee
                <select required value={editForm.assignedTo} onChange={event => setEditForm(current => ({ ...current, assignedTo: event.target.value }))} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm">
                  {members.map(member => <option key={member.id} value={member.id}>{member.name} · {member.role}</option>)}
                </select>
              </label>
            </div>
            {editMessage && <p role="status" className="mt-4 text-sm text-gray-600">{editMessage}</p>}
            <div className="mt-6 flex gap-2">
              <button type="submit" disabled={savingTask} className="min-h-11 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{savingTask ? "Saving…" : "Save changes"}</button>
              <button type="button" onClick={() => setEditMode(false)} className="min-h-11 rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        ) : <>

        {/* Badges */}
        <div className="flex gap-2 px-5 py-3 border-b border-gray-200">
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
            {selectedTask.status}
          </span>
          {selectedTask.priority && (
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full
                ${selectedTask.priority === "high"
                  ? "bg-red-100 text-red-800"
                  : selectedTask.priority === "medium"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-green-100 text-green-800"}`}
            >
              {selectedTask.priority}
            </span>
          )}
        </div>

        {/* Description */}
        <div className="px-5 py-3 border-b border-gray-200">
          <p className="text-xs text-gray-600 leading-relaxed">{selectedTask.description}</p>
        </div>

        {/* Updates List */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-3">
            Activity
          </p>

          {updates.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No updates yet.</p>
          ) : (
            updates.map((u, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-3 mb-2">
                <p className="text-xs text-gray-800 mb-2">{u.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">
                    {new Date(u.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {u.hours_spent ? ` · ${formatHoursSpent(u.hours_spent)}` : ""}
                  </span>
                  <ProgressPips value={u.progress ?? 0} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 px-5 py-4 flex flex-col gap-3">

          {/* Start Task */}
          {selectedTask.status === "todo" && canUpdateTask && (
            <>
              <button
                onClick={handleStatusChange}
                disabled={isChangingStatus}
                className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {isChangingStatus ? "Starting…" : "Start task"}
              </button>
              {doingMessage && <p className="text-xs text-gray-500">{doingMessage}</p>}
            </>
          )}

          {/* Update Form */}
          {selectedTask.status === "doing" && canUpdateTask && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <label htmlFor="task-update-message" className="text-xs font-medium text-gray-600">Progress update</label>
              <textarea
                id="task-update-message"
                placeholder="What did you work on?"
                value={message}
                required
                minLength={5}
                maxLength={200}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm resize-none h-[72px] focus:outline-none focus:border-gray-400 transition-colors"
              />

              {/* Progress label + live value */}
              <div className="flex justify-between items-center">
                <label htmlFor="task-update-progress" className="text-xs font-medium text-gray-500">Progress</label>
                <span className="text-sm font-semibold text-gray-900">{progress}%</span>
              </div>

              {/* Quick-select segments */}
              <div className="flex gap-1.5">
                {[0, 25, 50, 75, 100].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setProgress(v)}
                    className={`flex-1 min-h-11 py-1.5 rounded-lg border text-[11px] font-medium transition-all
                      ${progress === v
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                      }`}
                  >
                    {v}%
                  </button>
                ))}
              </div>

              {/* Fine-tune slider */}
              <div>
                <input
                  type="range"
                  id="task-update-progress"
                  min="0"
                  max="100"
                  step="1"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between px-px -mt-1">
                  {[0, 25, 50, 75, 100].map((v) => (
                    <span key={v} className="text-[9px] text-gray-400">{v}</span>
                  ))}
                </div>
              </div>

              {submitMessage && <p className="text-xs text-gray-500 whitespace-pre-line">{submitMessage}</p>}

              <button disabled={isSubmittingUpdate} className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">
                {isSubmittingUpdate ? "Adding update…" : "Add update"}
              </button>
            </form>
          )}

          {/* Mark as Done */}
          {selectedTask.status !== "done" && canUpdateTask && (
            <>
              <button
                onClick={handleDone}
                disabled={isCompletingTask}
                className="w-full border border-gray-200 text-gray-700 text-sm py-2 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                {isCompletingTask ? "Completing…" : "Mark as done"}
              </button>
              {doneMessage && <p className="text-xs text-gray-500">{doneMessage}</p>}
            </>
          )}
          {!canUpdateTask && selectedTask.status !== "done" && (
            <p className="task-view-only">Only the assignee can post progress or complete this task.</p>
          )}

        </div>
        </>}
      </section>
    </div>
  );
}

function TaskList({ tasks = [], taskMessage, user, workspaceId, onTaskChange, members = [], canManage = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 9;
  const location = useLocation();

  const pageCount = Math.max(1, Math.ceil(tasks.length / tasksPerPage));
  const pageStart = (currentPage - 1) * tasksPerPage;
  const paginatedTasks = tasks.slice(pageStart, pageStart + tasksPerPage);
  const visibleStart = tasks.length === 0 ? 0 : pageStart + 1;
  const visibleEnd = Math.min(pageStart + tasksPerPage, tasks.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [workspaceId]);

  useEffect(() => {
    if (currentPage > pageCount) setCurrentPage(pageCount);
  }, [currentPage, pageCount]);

  useEffect(() => {
    if (location.state?.openTask) {
      setSelectedTask(location.state.openTask);
      setIsOpen(true);
    }
  }, [location.state]);

  const selected = (task) => {
    setSelectedTask(task);
    setIsOpen(true);
  };

  return (
    <>
      <section className="col-span-full task-list-panel overflow-hidden rounded-2xl border border-black/10 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-gray-900 text-base font-semibold">Tasks</h2>
            <p className="mt-0.5 text-xs text-gray-500">Tasks and current status for this workspace</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">{tasks.length}</span>
            {tasks.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="hidden sm:inline">{visibleStart}–{visibleEnd} of {tasks.length}</span>
                <button
                  type="button"
                  aria-label="Previous task page"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                ><ChevronLeft size={16} /></button>
                <span className="min-w-12 text-center font-medium text-gray-700">{currentPage} / {pageCount}</span>
                <button
                  type="button"
                  aria-label="Next task page"
                  disabled={currentPage >= pageCount}
                  onClick={() => setCurrentPage(page => Math.min(pageCount, page + 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                ><ChevronRight size={16} /></button>
              </div>
            )}
          </div>
        </div>
        <div className="task-workspace-table">
          {tasks.length > 0 ? (
            <>
              <div className="task-workspace-columns"><span>Task</span><span>Assignee</span><span>Status</span><span>Priority</span><span>Due date</span></div>
              {paginatedTasks.map(task => {
                const assignee = members.find(member => Number(member.id) === Number(task.assigned_to));
                const overdue = task.status !== "done" && isPastDue(task.due_date);
                return (
                  <button key={task.id} type="button" className="task-workspace-row" onClick={() => selected(task)}>
                    <span className="task-workspace-title">
                      <strong>{task.title}</strong>
                      {task.description && <small>{task.description}</small>}
                    </span>
                  <span className="task-workspace-assignee">{assignee?.name || "Unknown member"}</span>
                    <span className={`task-status-label task-status-${task.status}`}><i aria-hidden="true" />{task.status === "todo" ? "To do" : task.status === "doing" ? "In progress" : "Done"}</span>
                    <span className={`task-priority-label task-priority-${task.priority}`}>{task.priority}</span>
                    <span className={`task-workspace-due ${overdue ? "is-overdue" : ""}`}>{task.due_date ? new Date(`${String(task.due_date).slice(0, 10)}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No due date"}</span>
                  </button>
                );
              })}
            </>
          ) : (
            <div className="task-list-empty"><p>{taskMessage || "No tasks in this workspace yet."}</p></div>
          )}
        </div>
      </section>

      {isOpen && (
        <TaskModal
          isOpen={isOpen}
          selectedTask={selectedTask}
          setIsOpen={setIsOpen}
          user={user}
          workspaceId={workspaceId}
          setSelectedTask={setSelectedTask}
          onTaskChange={onTaskChange}
          members={members}
          canManage={canManage}
        />
      )}
    </>
  );
}

export default TaskList;
