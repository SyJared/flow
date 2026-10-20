import { API_BASE } from "./auth";

export const assignMember = async (data) =>{
  const token = localStorage.getItem("token");
  const res = await fetch (`${API_BASE}/member/add-member/${data.workspaceId}`,{
    method: 'POST',
    headers:{
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  return res.json();
}

export const editMember = async ({id, role, memberId}) =>{
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/member/edit-role/${id}`,{
    method: 'PUT',
    headers:{
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({role, memberId})
  })
  return res.json();
}

export const bestMember = async(id) =>{
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/tasks/best-member/${id}`,{
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Recommendation request failed");
  return result;
}
