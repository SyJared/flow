import { BASE_URL } from "./auth";

export const getWorkspaceById = async (id) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`http://localhost:5000/api/workspaces/get-workspace/${id}`, {
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
  const res = await fetch(`http://localhost:5000/api/member/get-members/${id}`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });
  return res.json();
};
