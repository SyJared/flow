import { BASE_URL } from "./auth";

export const taskUpdates= async(data)=>{
  const token = localStorage.getItem('token');
  const res = await fetch(`http://localhost:5000/api/task-update/update`, {
    method:'PUT',
    headers:{
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Could not save this update.");
  return result;
}
