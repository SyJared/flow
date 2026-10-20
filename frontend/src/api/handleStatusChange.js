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
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Could not start this task.");
  return result;
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
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Could not complete this task.");
  return result;
}
