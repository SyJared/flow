import { BASE_URL } from "./auth";


export const createWorkspace = async (data) =>{
  const token = localStorage.getItem("token");
  const res = await fetch (`http://localhost:5000/api/workspaces/create-workspace`, {
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

  const res = await fetch(`http://localhost:5000/api/workspaces/edit-workspace/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name })
  });

  return res.json();
};

export const deleteWorkspace = async ({id})=>{
  const token = localStorage.getItem('token');
  const res = await fetch(`http://localhost:5000/api/workspaces/delete-workspace/${id}`, {
    method: "DELETE",
    headers:{
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  })
  return res.json()
}