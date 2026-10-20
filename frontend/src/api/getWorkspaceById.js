import { API_BASE } from "./auth";

export const getWorkspaceById = async (id) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/workspaces/get-workspace/${id}`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    }
  });
  return res.json();
};

export const getWorkspaceMembers = async (id) =>{
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/member/get-members/${id}`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });
  return res.json();
};
