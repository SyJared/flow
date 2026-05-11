import { BASE_URL } from "./auth";


export const createWorkspace = async (data) =>{
  const token = localStorage.getItem("token");
  const res = await fetch (`${BASE_URL}/create-workspace`, {
    method: 'POST',
    headers:{
      'Content-Type': 'application/json',
       Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  return res.json();
}

export const getWorkspaces = async()=>{
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/workspaces`,{
    method:'GET',
    headers:{
      Authorization: `Bearer ${token}`
    }
  })
  return res.json();
}

export const editWorkspace = async ({ id, name }) => {
  const token = localStorage.getItem('token');

  const res = await fetch(`${BASE_URL}/edit-workspace/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ id, name })
  });

  return res.json();
};

export const deleteWorkspace = async ({workspaceId})=>{
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/delete-workspace/${workspaceId}`, {
    method: "POST",
    headers:{
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({workspaceId})
  })
  return res.json()
}