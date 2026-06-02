import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/authContext";
import { createWorkspace, deleteWorkspace, editWorkspace } from "../api/createWorkspace";
import { getWorkspaces } from "../api/createWorkspace";
import { useNavigate } from "react-router-dom";

function LoggedIn() {
  const { user, userLoading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [workspaces, setWorkspaces] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');

  useEffect(() => {
    if (userLoading) return;
    if (!user?.id) navigate("/login", { replace: true });
  }, [user, userLoading, navigate]);

  useEffect(() => {
    const getws = async () => {
      try {
        const data = await getWorkspaces();
        setWorkspaces(data.workspaces);
      } catch (err) {
        console.error('getworkspace error' + err);
      }
    };
    getws();
  }, []);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    try {
     
      const data = await createWorkspace({ name });
      if (data.success){
      setMessage(data.message);
      setWorkspaces(prev => [...prev, data.data]);
      setName('');
      }
      console.log(data);
      console.log(workspaces)
      if(!data.success){
        setMessage(data.errors[0].message);
      }
    } catch (err) {
      console.error(err);
      setMessage('Error creating workspace');
    }
  };

  const handleEditStart = (w) => {
    setEditingId(w.id);
    setEditName(w.workspace_name);
  };

  const handleEditSave = async (id) => {
    try {
      const data = await editWorkspace({ id, name: editName });

      if(data.success){
        setEditMessage(data.message);
        setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, workspace_name: editName } : w));
        setEditingId(null);
        setEditName('');
      }
      if(!data.success){
        setEditMessage(data.message);
      }
    } catch (err) {
      console.error('Edit error:', err);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = async (id) => {
    try {
      const data = await deleteWorkspace({ id });
      if(data.success){
      setDeleteMessage(data.message);
      setWorkspaces(prev => prev.filter(w => w.id !== id));
      }
      
      setDeleteMessage(data.message);
    } catch (error) {
      console.log(error);
    }
  };

  const group = { owner: [], admin: [], member: [] };

  workspaces.forEach(w => {
    group[w.role]?.push(w);
  });

  const initials = (str) =>
    str.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const iconBg = {
    owner: 'bg-[#202940] text-[#F4E6DA]',
    admin: 'bg-[#4B4038] text-[#F4E6DA]',
    member: 'bg-[#F3EEEA] text-[#3E342D] border border-[#4B4038]/20',
  };

  const WorkspaceCard = ({ w }) => (
    <div className="bg-white/95 border border-[#4B4038]/20 rounded-xl p-4 cursor-pointer transition-all hover:border-[#9A8678] hover:shadow-md">
      {editingId === w.id ? (
        <div onClick={e => e.stopPropagation()}>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium mb-3 ${iconBg[w.role]}`}>
            {initials(editName || w.workspace_name)}
          </div>

          <input
            type="text"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleEditSave(w.id);
              if (e.key === 'Escape') handleEditCancel();
            }}
            autoFocus
            className="w-full bg-[#f5f2ef] border border-[#9A8678] rounded-lg text-[#202940] text-sm px-3 py-1.5 outline-none mb-2 placeholder-[#8A7B70]"
          />

          <div className="flex gap-2">
            <button
              onClick={() => handleEditSave(w.id)}
              className="flex-1 h-7 rounded-lg bg-[#202940] text-[#F4E6DA] text-xs font-medium hover:bg-[#2d3a55] transition-colors"
            >
              Save
            </button>

            <button
              onClick={handleEditCancel}
              className="flex-1 h-7 rounded-lg bg-[#4B4038]/10 text-[#4B4038] text-xs font-medium hover:bg-[#4B4038]/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            onClick={() => navigate(`/workspace/${w.id}`)}
            className="mb-3"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium mb-2.5 ${iconBg[w.role]}`}>
              {initials(w.workspace_name)}
            </div>

            <p className="text-sm font-semibold text-[#202940] truncate">
              {w.workspace_name}
            </p>

            <p className="text-xs text-[#6F6258] mt-0.5">
              {new Date(w.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="flex gap-2" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => handleEditStart(w)}
              className="flex-1 h-7 rounded-lg border border-[#4B4038]/20 text-[#4B4038] text-xs hover:bg-[#4B4038]/10 hover:text-[#2E2722] transition-colors flex items-center justify-center gap-1"
            >
              Edit
            </button>

            <button
              onClick={() => handleDelete(w.id)}
              className="flex-1 h-7 rounded-lg border border-[#993C1D]/20 text-[#993C1D] text-xs hover:bg-[#993C1D]/10 transition-colors flex items-center justify-center gap-1"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );

  const Section = ({ title, items }) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] font-semibold text-[#5E5248] uppercase tracking-widest">
          {title}
        </span>

        <span className="text-[11px] bg-[#4B4038]/10 text-[#4B4038] rounded-full px-2 py-0.5">
          {items.length}
        </span>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
          {items.map(w => <WorkspaceCard key={w.id} w={w} />)}
        </div>
      ) : (
        <p className="text-sm text-[#6F6258]">
          No workspaces found
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F5F3] pt-9 pb-12">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Greeting */}
        {userLoading ? (
          <p className="text-lg text-[#5E5248] mb-6">
            Loading…
          </p>
        ) : (
          <h1 className="text-2xl font-semibold text-[#202940] mb-6">
            My workspaces
          </h1>
        )}

        {/* Create workspace */}
        <div className="bg-[#f5f2ef] border border-[#4B4038]/20 rounded-xl p-5 mb-8 shadow-sm">
          <p className="text-[11px] text-[#5E5248] uppercase tracking-widest mb-3 font-semibold">
            New workspace
          </p>

          <form onSubmit={handleCreateWorkspace} className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Workspace name…"
              className="flex-1 bg-white border border-[#4B4038]/30 rounded-lg text-[#202940] text-sm px-4 h-10 outline-none placeholder-[#8A7B70] focus:border-[#9A8678]"
            />

            <button
              type="submit"
              className="bg-[#202940] text-[#F4E6DA] text-sm font-medium px-5 h-10 rounded-lg hover:bg-[#2d3a55] transition-colors whitespace-nowrap"
            >
              + Create
            </button>
          </form>

          {message && (
            <p className={`text-sm mt-2.5 ${
              message.toLowerCase().includes('error')
                ? 'text-[#993C1D]'
                : 'text-[#0F6E56]'
            }`}>
              {message}
            </p>
          )}
        </div>

        {/* Workspace sections */}
        <Section title="Owner" items={group.owner} />

        <hr className="border-t border-[#4B4038]/15 my-5" />

        <Section title="Admin" items={group.admin} />

        <hr className="border-t border-[#4B4038]/15 my-5" />

        <Section title="Member" items={group.member} />

        {editMessage && (
          <p className="text-sm text-[#0F6E56] mt-2">
            {editMessage}
          </p>
        )}

        {deleteMessage && (
          <p className="text-sm text-[#993C1D] mt-2">
            {deleteMessage}
          </p>
        )}
      </div>
    </div>
  );
}

export default LoggedIn;