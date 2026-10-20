import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Users, FolderKanban } from "lucide-react";
import { getWorkspaces } from "../api/createWorkspace";
import { getWorkspaceMembers } from "../api/getWorkspaceById";
import { useAuth } from "../features/auth/authContext";

const initials = (name = "") => name.trim().split(/\s+/).filter(Boolean).map(part => part[0]).join("").toUpperCase().slice(0, 2) || "?";

function TeamsPage() {
  const { user, userLoading } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userLoading && !user?.id) navigate("/login", { replace: true });
  }, [user, userLoading, navigate]);

  useEffect(() => {
    if (userLoading || !user?.id) return;
    let cancelled = false;

    const loadTeams = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getWorkspaces();
        if (!response.success) throw new Error(response.message || "Could not load your teams.");
        const workspaces = Array.isArray(response.workspaces) ? response.workspaces : [];
        const teamsWithMembers = await Promise.all(workspaces.map(async workspace => {
          try {
            const memberResponse = await getWorkspaceMembers(workspace.id);
            return { ...workspace, members: Array.isArray(memberResponse.members) ? memberResponse.members : [] };
          } catch {
            return { ...workspace, members: [] };
          }
        }));
        if (!cancelled) setTeams(teamsWithMembers);
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load your teams.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadTeams();
    return () => { cancelled = true; };
  }, [user, userLoading]);

  const memberCount = teams.reduce((total, team) => total + team.members.length, 0);

  return (
    <main className="min-h-screen bg-[#F7F5F3] pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#8A7464] mb-2">People & collaboration</p>
            <h1 className="text-3xl font-semibold text-[#202940]">Your teams</h1>
            <p className="text-sm text-[#6F6258] mt-2">See the workspaces you belong to and the people you work with.</p>
          </div>
          {!loading && !error && (
            <div className="flex gap-3 text-sm text-[#5E5248]">
              <span className="rounded-lg bg-white border border-[#4B4038]/15 px-3 py-2"><strong className="text-[#202940]">{teams.length}</strong> {teams.length === 1 ? "team" : "teams"}</span>
              <span className="rounded-lg bg-white border border-[#4B4038]/15 px-3 py-2"><strong className="text-[#202940]">{memberCount}</strong> memberships</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="rounded-xl border border-[#4B4038]/15 bg-white p-8 text-center text-[#6F6258]">Loading your teams…</div>
        ) : error ? (
          <div role="alert" className="rounded-xl border border-red-200 bg-white p-6 text-sm text-red-700">{error}</div>
        ) : teams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#9A8678]/50 bg-white p-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3EEEA] text-[#4B4038]"><Users size={22} /></div>
            <h2 className="text-lg font-semibold text-[#202940]">No teams yet</h2>
            <p className="mt-2 text-sm text-[#6F6258]">Create a workspace or ask a teammate to invite you.</p>
            <button onClick={() => navigate("/logged")} className="mt-5 rounded-lg bg-[#202940] px-4 py-2 text-sm font-medium text-[#F4E6DA] hover:bg-[#2d3a55]">Go to workspaces</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map(team => (
              <article key={team.id} className="rounded-xl border border-[#4B4038]/15 bg-white shadow-sm overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#202940] text-sm font-semibold text-[#F4E6DA]">{initials(team.workspace_name)}</div>
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold text-[#202940]">{team.workspace_name}</h2>
                        <p className="mt-0.5 text-xs text-[#6F6258]">Your role: <span className="capitalize">{team.role || "member"}</span></p>
                      </div>
                    </div>
                    <button onClick={() => navigate(`/workspace/${team.id}`)} aria-label={`Open ${team.workspace_name}`} className="rounded-lg p-2 text-[#8A7464] hover:bg-[#F3EEEA] hover:text-[#202940]"><ArrowUpRight size={18} /></button>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-[#4B4038]/10 pt-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#5E5248]"><Users size={15} /> {team.members.length} {team.members.length === 1 ? "person" : "people"}</div>
                    <div className="flex -space-x-2" aria-label={`${team.members.length} team members`}>
                      {team.members.slice(0, 5).map(member => (
                        <div key={member.id} title={`${member.name} · ${member.role}`} className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#E8D8CC] text-[10px] font-semibold text-[#4B4038]">
                          {member.profile_picture ? <img src={`http://localhost:5000${member.profile_picture}`} alt="" className="h-full w-full object-cover" /> : initials(member.name)}
                        </div>
                      ))}
                      {team.members.length > 5 && <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#F3EEEA] text-[10px] font-semibold text-[#5E5248]">+{team.members.length - 5}</span>}
                    </div>
                  </div>
                  {team.members.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {team.members.slice(0, 3).map(member => (
                        <li key={member.id} className="flex items-center justify-between text-xs">
                          <span className="truncate text-[#202940]">{member.name}{Number(member.id) === Number(user.id) ? " (you)" : ""}</span>
                          <span className="ml-3 shrink-0 capitalize text-[#8A7464]">{member.role}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button onClick={() => navigate(`/workspace/${team.id}`)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[#4B4038]/20 py-2 text-xs font-semibold text-[#4B4038] hover:bg-[#F7F5F3]"><FolderKanban size={14} /> Open workspace</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default TeamsPage;
