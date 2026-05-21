import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getWorkspaceById } from "../api/getWorkspaceById";
import { searchName } from "../api/searchName";
import { assignMember, editMember } from "../api/assignMember";
import { getWorkspaceMembers } from "../api/getWorkspaceById";
import { createTask } from "../api/createTask";
import { getTask } from "../api/getTask";
import { useAuth } from "../features/auth/authContext";
import TaskList from "../features/task/tasklist";

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function WorkspacePage() {

  const{user, userLoading} = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState(null);
  const { id } = useParams();

  const [nameParam, setNameParam] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchMessage, setSearchMessage] = useState('');

  const [selectedUser, setSelectedUser] = useState({ user: null, role: 'member' });
  const [assignMessage, setAssignMessage] = useState('');

  const [members, setMembers] = useState([]);

  const [tasks, setTasks] = useState([]);
  const [tasksMessage, setTasksMessage] = useState('');
  const [taskErrors, setTaskErrors] = useState([]);

  

  const [taskInfo, setTaskInfo] = useState({
    workspaceId: id,
    title: '',
    description: '',
    priority: 'low',
    dueDate: '',
    assignedTo: ''
  });
  const [taskMessage, setTaskMessage] = useState('');

  const [isEditingMembers, setIsEditingMembers] = useState(true);
  const [memberRoleEdit, setMemberRoleEdit] = useState({ id: null, role: 'member' });
  const [selectedEdit, setSelectedEdit] = useState();
  const [editMemberRoleMessage, setEditMemberRoleMessage] = useState('');

  useEffect(() => {
  if (userLoading) return; // IMPORTANT

  if (!user?.id) {
    navigate("/login", { replace: true });
  }
}, [user, userLoading, navigate]);

  useEffect(() => {
  const loadWorkspace = async () => {
    try {
      const data = await getWorkspaceById(id);
      const membersData = await getWorkspaceMembers(id);
      const tasksData = await getTask(id);

      setWorkspace(data.workspace);
      console.log(data)
      // SAFE MEMBERS
      setMembers(membersData.members || []);

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

      setTasks([]);
      setMembers([]);
      setTasksMessage('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  loadWorkspace();
}, [id]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await searchName(nameParam);
      setSearchResults(res.users);
      setSearchMessage(res.message);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssign = async () => {
    try {
      const res = await assignMember({ workspaceId: id, userId: selectedUser.user.id, role: selectedUser.role });
      setAssignMessage(res.message);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e) => {
  e.preventDefault();

  try {
    const res = await createTask(taskInfo);

    if (!res.success) {
      setTaskErrors(res.errors || []);
      setTaskMessage(res.message);
      return;
    }

    setTaskErrors([]);
    setTaskMessage(res.message);

  } catch (err) {
    console.error(err);
    setTaskMessage("Server error");
  }
};

  const handleMemberEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await editMember({ id: id, role: memberRoleEdit.role, memberId: selectedEdit.id });
      setEditMemberRoleMessage(res.message);
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading workspace…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <div className="bg-gray-900 rounded-xl px-6 py-4 mb-6 flex items-center justify-between shadow-sm">
        <div className="flex flex-col gap-1">
          <h1 className="text-amber-100 text-xl font-semibold tracking-tight">
            {workspace.workspace_name}
          </h1>
          <div className="flex items-center gap-3 text-xs uppercase tracking-wider font-medium text-amber-200/70">
            <span>
              ID: <strong className="text-amber-100 font-semibold">{id}</strong>
            </span>
            <span className="w-1 h-1 bg-amber-200/50 rounded-full"></span>
            <span>
              {new Date(workspace.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
        <span className="bg-gray-800 text-amber-100 text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full">
          Workspace
        </span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-[300px_1fr] gap-5">

        {/* Members Card — spans 2 rows */}
        <div className="row-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-gray-900 text-base font-semibold">Members</h2>
            <button
              onClick={() => setIsEditingMembers(i => !i)}
              className="w-8 h-8 rounded-lg border border-gray-300 text-gray-500 text-xs font-bold flex items-center justify-center hover:bg-gray-900 hover:text-amber-100 hover:border-gray-900 transition-colors"
            >
              {isEditingMembers ? '✕' : '✎'}
            </button>
          </div>
          <div className="p-4">
            {isEditingMembers ? (
              <>
                {members.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedEdit(m)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer mb-1 transition-colors ${selectedEdit?.id === m.id ? 'bg-gray-900' : 'hover:bg-amber-50'}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-800 to-amber-800 flex items-center justify-center text-amber-100 text-xs font-semibold flex-shrink-0">
                      {getInitials(m.name)}
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
                      <button type="submit" className="bg-gray-900 text-amber-100 text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                        Save
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
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-800 to-amber-800 flex items-center justify-center text-amber-100 text-xs font-semibold flex-shrink-0">
                    {getInitials(member.name)}
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

        {/* Search & Assign Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-gray-900 text-base font-semibold">Add Member</h2>
          </div>
          <div className="p-4">
            <form onSubmit={handleSearch}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Search by name</label>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Enter a user name…"
                  value={nameParam}
                  onChange={(e) => setNameParam(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 text-sm text-gray-900 bg-white outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
                />
                <button type="submit" className="bg-gray-900 text-amber-100 text-sm font-semibold px-4 py-2 rounded-r-lg hover:bg-gray-800 transition-colors">
                  Search
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
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-amber-800 flex items-center justify-center text-amber-100 text-xs font-semibold flex-shrink-0">
                      {getInitials(user.name)}
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
                  className="bg-amber-100 text-gray-900 text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-amber-200 transition-colors"
                >
                  Assign to Workspace
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Title</label>
                <input
                  type="text"
                  placeholder="Task title"
                  value={taskInfo.title}
                  onChange={(e) => setTaskInfo({ ...taskInfo, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Description</label>
                <textarea
                  placeholder="Task description"
                  value={taskInfo.description}
                  onChange={(e) => setTaskInfo({ ...taskInfo, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300 resize-y min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Priority</label>
                  <select
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={taskInfo.dueDate}
                    onChange={(e) => setTaskInfo({ ...taskInfo, dueDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white outline-none focus:border-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Assign to</label>
                <select
                  value={taskInfo.assignedTo}
                  onChange={(e) => setTaskInfo({ ...taskInfo, assignedTo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white outline-none focus:border-gray-400"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full bg-gray-900 text-amber-100 text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
                Create Task
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

        {/* Tasks List — full width */}
        <TaskList
  tasks={tasks}
  taskMessage={tasksMessage}
  user={user?.id}
  workspaceId={id}
/>

      </div>
    </div>
  );
}

export default WorkspacePage;