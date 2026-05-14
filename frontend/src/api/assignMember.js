import { BASE_URL } from "./auth";

export const assignMember = async (data) =>{
  const token = localStorage.getItem("token");
  const res = await fetch (`${BASE_URL}/assign-member/${data.workspaceId}`,{
    method: 'POST',
    headers:{
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  return res.json();
}

export const editMember = async (data) =>{
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/edit-member/${data.id}`,{
    method: 'POST',
    headers:{
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  return res.json();
}
