import { BASE_URL } from "./auth";

export const handleStatusDoing = async (data)=>{
  const token = localStorage.getItem('token');
  const res =await fetch(`${BASE_URL}/status-doing/${data.workspaceId}`,{
    method:"POST",
    headers: {
      'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
return res.json();
}

export const taskMarkAsDone = async (data)=>{
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/mark-done/${data.workspaceId}`,{
    method:'POST',
    headers:{
      'Content-Type': 'application/json',
      Authorization : `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  return res.json()
}