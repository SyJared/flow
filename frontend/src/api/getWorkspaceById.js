import { BASE_URL } from "./auth";

export const getWorkspaceById = async (id) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/workspace/${id}`, {
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
  const res = await fetch(`${BASE_URL}/workspace-members/${id}`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });
  return res.json();
};
