import { BASE_URL } from "./auth";

export const taskUpdates= async(data)=>{
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/task-update/${data.workspaceId}`, {
    method:'POST',
    headers:{
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  return res.json()
}