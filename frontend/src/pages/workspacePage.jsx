import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getWorkspaceById } from "../api/getWorkspaceById";
import { searchName } from "../api/searchName";
import { assignMember, bestMember, editMember } from "../api/assignMember";
import { getWorkspaceMembers } from "../api/getWorkspaceById";
import { createTask } from "../api/createTask";
import { getTask } from "../api/getTask";
import { useAuth } from "../features/auth/authContext";
import TaskList from "../features/task/tasklist";
import { API_ORIGIN } from "../api/auth";

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function WorkspacePage() {

  const {user, userLoading} = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true);
  const [workspaceError, setWorkspaceError] = useState('');
  const [workspace, setWorkspace] = useState(null);
  const { id } = useParams();

  const [nameParam, setNameParam] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchMessage, setSearchMessage] = useState('');
  const [searchingMembers, setSearchingMembers] = useState(false);

  const [selectedUser, setSelectedUser] = useState({ user: null, role: 'member' });
  const [assignMessage, setAssignMessage] = useState('');
  const [assigningMember, setAssigningMember] = useState(false);

  const [members, setMembers] = useState([]);

  const [tasks, setTasks] = useState([]);
  const [tasksMessage, setTasksMessage] = useState('');
  const [taskErrors, setTaskErrors] = useState([]);

  const [recommended, setRecommended] = useState([])



  const [taskInfo, setTaskInfo] = useState({
    workspaceId: id,
    title: '',
    description: '',
    priority: 'low',
    dueDate: '',
    assignedTo: ''
  });
  const [taskMessage, setTaskMessage] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);

  const [isEditingMembers, setIsEditingMembers] = useState(true);
  const [memberRoleEdit, setMemberRoleEdit] = useState({ id: null, role: 'member' });
  const [selectedEdit, setSelectedEdit] = useState();
  const [editMemberRoleMessage, setEditMemberRoleMessage] = useState('');

  const [savingMemberRole, setSavingMemberRole] = useState(false);
  const [recommendationMessage, setRecommendationMessage] = useState('');
  const canManageWorkspace = ['owner', 'admin'].includes(workspace?.role);

  useEffect(() => {
  if (userLoading) return; // IMPORTANT

  if (!user?.id) {
    navigate("/login", { replace: true });
  }
}, [user, userLoading, navigate]);

  useEffect(() => {
  if (userLoading || !user?.id) return;
  let cancelled = false;
  setLoading(true);
  setWorkspaceError('');
  const loadWorkspace = async () => {
    try {
      const workspaceId = id;
      const data = await getWorkspaceById(id);
      const membersData = await getWorkspaceMembers(id);
      const tasksData = await getTask(workspaceId);
      if (cancelled) return;
      setWorkspace(data.workspace);
      setWorkspaceError('');
      // SAFE MEMBERS
      setMembers(membersData.members || []);
      if (user?.id) setTaskInfo(current => ({ ...current, assignedTo: current.assignedTo || String(user.id) }));

      // SAFE TASKS
      if (Array.isArray(tasksData.tasks)) {
        setTasks(tasksData.tasks);
        setTasksMessage('');
      } else {
        setTasks([]); // ALWAYS keep array
        setTasksMessage(tasksData.message || 'No tasks found');
      }

    } catch (err) {
      console.error('Error loading workspace: ', err);
      if (cancelled) return;
      setWorkspaceError(err.message || 'This workspace could not be loaded.');
      setTasks([]);
      setMembers([]);
      setTasksMessage('Failed to load tasks');
    } finally {
      if (!cancelled) setLoading(false);
    }
  };

  loadWorkspace();
  return () => { cancelled = true; };
}, [id, user?.id, userLoading]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchingMembers(true);
    setSearchMessage('');
    try {
      const res = await searchName(nameParam);
      setSearchResults(Array.isArray(res.users) ? res.users : []);
      setSearchMessage(res.message || '');
    } catch (err) {
      console.error(err);
      setSearchMessage('Could not search members. Try again.');
    } finally {
      setSearchingMembers(false);
    }
  };

 const handleBestMember = async(e)=>{
  e.preventDefault();
  setRecommendationMessage('');
  try {
    const res = await bestMember(id)
    if(res.success){
      setRecommended(res.recommendation)
      if (!res.recommendation?.length) setRecommendationMessage('There is not enough completed task history to make a recommendation yet.');
    } else {
      setRecommendationMessage(res.message || 'Could not create a recommendation.');
    }
  } catch (err) {
    setRecommendationMessage(err.message || 'Could not create a recommendation.');
  }
 }

  const handleAssign = async () => {
    if (!selectedUser.user) return;
    setAssigningMember(true);
    try {
      const res = await assignMember({ workspaceId: id, userId: selectedUser.user.id, role: selectedUser.role });
      setAssignMessage(res.message);
      if(res?.errors){
        setAssignMessage(res.errors.map(e => `${e.message}`).join('\n'));
      }
      if (res.success) {
        setSelectedUser({ user: null, role: 'member' });
        const refreshed = await getWorkspaceMembers(id);
        setMembers(refreshed.members || []);
      }
    } catch (err) {
      console.error(err);
      setAssignMessage(err.message || 'Could not add this member.');
    } finally {
      setAssigningMember(false);
    }
  };

  const handleCreateTask = async (e) => {
  e.preventDefault();
  setCreatingTask(true);
  setTaskMessage('');
  setTaskErrors([]);
  try {
    const res = await createTask(taskInfo);

    if (!res.success) {
      setTaskErrors(res.errors || []);
      setTaskMessage(res.message);
      return;
    }

    setTaskErrors([]);
    setTaskMessage(res.message);
    const refreshed = await getTask(id);
    setTasks(Array.isArray(refreshed.tasks) ? refreshed.tasks : []);
    setTaskInfo(current => ({ ...current, title: '', description: '', priority: 'medium', dueDate: '' }));

  } catch (err) {
    console.error(err);
    setTaskMessage(err.message || "Could not create task. Please try again.");
  } finally {
    setCreatingTask(false);
  }
};

  const handleMemberEdit = async (e) => {
    e.preventDefault();
    setSavingMemberRole(true);
    setEditMemberRoleMessage('');
    try {
      const res = await editMember({ id: id, role: memberRoleEdit.role, memberId: selectedEdit.id });
      setEditMemberRoleMessage(res.message);
      if (res.success) {
        const refreshed = await getWorkspaceMembers(id);
        setMembers(refreshed.members || []);
        setSelectedEdit(current => current ? { ...current, role: memberRoleEdit.role } : current);
      }
    } catch (err) {
      setEditMemberRoleMessage(err.message || 'Could not update this role.');
    } finally {
      setSavingMemberRole(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading workspace…</p>
      </div>
    );
  }
  if (workspaceError || !workspace) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-2xl border border-black/10 bg-white p-7">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Workspace unavailable</p>
          <h1 className="mt-2 text-xl font-semibold text-gray-900">{workspaceError || 'This workspace could not be found.'}</h1>
          <p className="mt-2 text-sm text-gray-600">It may have been removed, or your membership may have changed.</p>
          <button type="button" onClick={() => navigate('/logged')} className="mt-5 min-h-11 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">Go to workspaces</button>
        </div>
      </main>
    );
  }
  const aggregated = (() => {
  if (recommended.length === 0) return [];
  const memberMap = {};
  recommended.forEach(({ assigned_to, predicted_days_late }) => {
    if (!memberMap[assigned_to]) {
      memberMap[assigned_to] = { total: 0, count: 0 };
    }
    memberMap[assigned_to].total += predicted_days_late;
    memberMap[assigned_to].count += 1;
  });
  return Object.entries(memberMap)
    .map(([memberId, { total, count }]) => ({
      id: Number(memberId),
      avg: total / count,
    }))
    .sort((a, b) => a.avg - b.avg);
})();

const getLabel = (days) => {
  if (days <= -7) return { text: "Likely to finish very early", color: "text-green-600" };
  if (days <= -3) return { text: "Likely to finish early", color: "text-green-500" };
  if (days <= -0.5) return { text: "Likely to finish slightly early", color: "text-emerald-500" };
  if (days <= 0.5) return { text: "Likely to finish on time", color: "text-blue-500" };
  if (days <= 3) return { text: "Slight risk of delay", color: "text-yellow-500" };
  if (days <= 7) return { text: "Risk of delay", color: "text-orange-500" };
  return { text: "High risk of delay", color: "text-red-500" };
};

  return (
    <div className="workspace-page min-h-screen bg-gray-50 pt-15 pb-12 px-4 sm:px-6">

      {/* Header */}
      <header className="workspace-page-header mb-5 flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white px-5 py-4">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">Workspace</p>
          <h1 className="text-gray-900 text-2xl font-semibold tracking-tight">
            {workspace.workspace_name}
          </h1>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>
              Workspace <strong className="font-medium text-gray-700">#{id}</strong>
            </span>
            <span className="h-1 w-1 rounded-full bg-gray-300"></span>
            <span>
              {new Date(workspace.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium capitalize text-gray-700">
          {workspace.role}
        </span>
      </header>

      {/* Main Grid */}
      <div className={canManageWorkspace ? "grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-5" : "grid grid-cols-1 gap-5"}>

        {/* Members Card — spans 2 rows */}
        <div className={`${canManageWorkspace ? "row-span-2" : ""} bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden`}>
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-gray-900 text-base font-semibold">Members</h2>
            {canManageWorkspace && <button
              onClick={() => setIsEditingMembers(i => !i)}
              className="w-8 h-8 rounded-lg border border-gray-300 text-gray-500 text-xs font-bold flex items-center justify-center hover:bg-gray-900 hover:text-amber-100 hover:border-gray-900 transition-colors"
              aria-label={isEditingMembers ? "Stop editing members" : "Edit member roles"}
            >
              {isEditingMembers ? '✕' : '✎'}
            </button>}
          </div>
          <div className="p-4">
            {isEditingMembers && canManageWorkspace ? (
              <>
                {members.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      if (m.role === 'owner') return;
                      setSelectedEdit(m);
                      setMemberRoleEdit({ id: m.id, role: m.role });
                    }}
                    aria-disabled={m.role === 'owner'}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg ${m.role === 'owner' ? 'cursor-not-allowed' : 'cursor-pointer'} mb-1 transition-colors ${selectedEdit?.id === m.id ? 'bg-gray-900' : 'hover:bg-amber-50'}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-800 to-amber-800 flex items-center justify-center overflow-hidden text-amber-100 text-xs font-semibold flex-shrink-0">
                      {m.profile_picture ? <img src={`${API_ORIGIN}${m.profile_picture}`} alt="" className="h-full w-full object-cover" /> : getInitials(m.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${selectedEdit?.id === m.id ? 'text-amber-100' : 'text-gray-900'}`}>{m.name}</p>
                    </div>
                    <span className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border ${selectedEdit?.id === m.id ? 'bg-gray-800 text-amber-100 border-transparent' : m.role === 'admin' ? 'bg-gray-100 text-gray-900 border-gray-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                      {m.role}
                    </span>
                  </div>
                ))}

                {selectedEdit ? (
                  <div className="mt-4 bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">Edit Role</p>
                    <p className="text-gray-900 font-semibold mb-3">{selectedEdit.name}</p>
                    <form onSubmit={handleMemberEdit}>
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <label className="text-xs text-gray-700 font-medium">
                          Current: <strong>{selectedEdit.role}</strong> → Change to
                        </label>
                        <select
                          value={memberRoleEdit.role}
                          onChange={(e) => setMemberRoleEdit({ ...memberRoleEdit, role: e.target.value })}
                          className="text-xs border border-gray-300 rounded-lg px-2 py-1 bg-white text-gray-900 outline-none focus:border-gray-400"
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <button type="submit" disabled={savingMemberRole} className="bg-gray-900 text-amber-100 text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60">
                        {savingMemberRole ? 'Saving…' : 'Save'}
                      </button>
                      {editMemberRoleMessage && (
                        <p className="mt-2 text-xs text-gray-800 bg-amber-100/30 border border-amber-200 rounded-lg px-3 py-2">{editMemberRoleMessage}</p>
                      )}
                    </form>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-gray-500 italic">Select a member to edit their role</p>
                )}
              </>
            ) : (
              members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-800 to-amber-800 flex items-center justify-center overflow-hidden text-amber-100 text-xs font-semibold flex-shrink-0">
                    {member.profile_picture ? <img src={`${API_ORIGIN}${member.profile_picture}`} alt="" className="h-full w-full object-cover" /> : getInitials(member.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
                    <p className="text-xs text-gray-500 truncate">{member.email}</p>
                  </div>
                  <span className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border ${member.role === 'admin' ? 'bg-gray-100 text-gray-900 border-gray-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                    {member.role}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {canManageWorkspace && <>
        {/* Search & Assign Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-gray-900 text-base font-semibold">Add Member</h2>
          </div>
          <div className="p-4">
            <form onSubmit={handleSearch}>
              <label htmlFor="member-search" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Search by name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="member-search"
                  placeholder="Enter a user name…"
                  value={nameParam}
                  onChange={(e) => setNameParam(e.target.value)}
                  required
                  className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 text-sm text-gray-900 bg-white outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
                />
                <button type="submit" disabled={searchingMembers} className="bg-gray-900 text-amber-100 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60">
                  {searchingMembers ? 'Searching…' : 'Search'}
                </button>
              </div>
            </form>

            {searchMessage && <p className="mt-2 text-xs text-gray-500">{searchMessage}</p>}

            {searchResults && searchResults.length > 0 && (
              <div className="mt-3 mb-2">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser({ user, role: 'member' })}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-transparent hover:bg-amber-50 hover:border-amber-200 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-amber-800 flex items-center justify-center overflow-hidden text-amber-100 text-xs font-semibold flex-shrink-0">
                      {user.profile_picture ? <img src={`${API_ORIGIN}${user.profile_picture}`} alt="" className="h-full w-full object-cover" /> : getInitials(user.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedUser.user ? (
              <div className="mt-3 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 shadow-sm">
                <p className="text-amber-100 font-semibold text-base">{selectedUser.user.name}</p>
                <p className="text-amber-200/80 text-xs mb-3">{selectedUser.user.email}</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-amber-200/80 font-medium">Assign as</span>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                    className="text-xs bg-white/10 text-amber-100 border border-amber-200/30 rounded-lg px-2 py-1 outline-none"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              <button
                  onClick={handleAssign}
                disabled={assigningMember}
                className="bg-amber-100 text-gray-900 text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-60"
                >
                {assigningMember ? 'Adding…' : 'Add to workspace'}
                </button>
                {assignMessage && <p className="mt-2 text-xs text-amber-100/90 bg-white/10 rounded-lg px-3 py-2">{assignMessage}</p>}
              </div>
            ) : (
              <p className="mt-4 text-center text-xs text-gray-500 italic py-6">Select a user from search results to assign them</p>
            )}
          </div>
        </div>

        {/* Create Task Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-gray-900 text-base font-semibold">Create Task</h2>
          </div>
          <div className="p-4">
            <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
              <div>
                <label htmlFor="task-title" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Title</label>
                <input
                  type="text"
                  id="task-title"
                  placeholder="Task title"
                  required
                  minLength={5}
                  maxLength={50}
                  value={taskInfo.title}
                  onChange={(e) => setTaskInfo({ ...taskInfo, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
                />
              </div>
              <div>
                <label htmlFor="task-description" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Description</label>
                <textarea
                  id="task-description"
                  placeholder="Task description"
                  required
                  minLength={10}
                  maxLength={100}
                  value={taskInfo.description}
                  onChange={(e) => setTaskInfo({ ...taskInfo, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300 resize-y min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="task-priority" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Priority</label>
                  <select
                    id="task-priority"
                    value={taskInfo.priority}
                    onChange={(e) => setTaskInfo({ ...taskInfo, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white outline-none focus:border-gray-400"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="task-due-date" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Due Date <span className="font-normal normal-case tracking-normal">(optional)</span></label>
                  <input
                    type="date"
                    id="task-due-date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={taskInfo.dueDate}
                    onChange={(e) => setTaskInfo({ ...taskInfo, dueDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white outline-none focus:border-gray-400"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="task-assignee" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Assign to</label>
                <select
                  id="task-assignee"
                  required
                  value={taskInfo.assignedTo}
                  onChange={(e) => setTaskInfo({ ...taskInfo, assignedTo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white outline-none focus:border-gray-400"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                  ))}
                </select>
                <button
  type="button"
  onClick={handleBestMember}
  className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
>
  AI Recommend
</button>
{recommendationMessage && <p className="mt-2 text-xs text-gray-600" role="status">{recommendationMessage}</p>}

{aggregated.length > 0 && (
  <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden">
    <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">AI Recommendation</p>
    </div>
    <div className="divide-y divide-gray-100">
      {aggregated.map(({ id: memberId, avg }, index) => {
        const member = members.find(m => m.id === memberId);
        const { text, color } = getLabel(avg);
        return (
          <button
            type="button"
            key={memberId}
            onClick={() => setTaskInfo({ ...taskInfo, assignedTo: memberId })}
            aria-pressed={String(taskInfo.assignedTo) === String(memberId)}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-gray-50 transition-colors ${String(taskInfo.assignedTo) === String(memberId) ? "bg-blue-50" : ""}`}
          >
            <div className="flex items-center gap-2">
              {index === 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-1.5 py-0.5 rounded">Best</span>
              )}
              <span className="text-sm font-medium text-gray-800">
                {member ? member.name : `Member ${memberId}`}
              </span>
            </div>
            <span className={`text-xs font-medium ${color}`}>{text}</span>
          </button>
        );
      })}
    </div>
  </div>
)}
              </div>
              <button type="submit" disabled={creatingTask} className="w-full bg-gray-900 text-amber-100 text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-60">
                {creatingTask ? 'Creating…' : 'Create task'}
              </button>
              {taskMessage && <p className="text-xs text-gray-800 bg-amber-100/30 border border-amber-200 rounded-lg px-3 py-2">{taskMessage}</p>}
              {taskErrors.length > 0 && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
    {taskErrors.map((err, index) => (
      <p key={index} className="text-sm text-red-700">
        {err.field}: {err.message}
      </p>
    ))}
  </div>
)}
            </form>
          </div>
        </div>

        </>}

        {/* Tasks List — full width */}
        <TaskList
  tasks={tasks}
  taskMessage={tasksMessage}
  user={user?.id}
  workspaceId={id}
  members={members}
  canManage={canManageWorkspace}
  onTaskChange={async () => {
    const refreshed = await getTask(id);
    setTasks(Array.isArray(refreshed.tasks) ? refreshed.tasks : []);
  }}
/>

      </div>
    </div>
  );
}

export default WorkspacePage;
