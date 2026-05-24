import { BASE_URL } from "./auth";

export const assignMember = async (data) =>{
  const token = localStorage.getItem("token");
  const res = await fetch (`http://localhost:5000/api/member/add-member/${data.workspaceId}`,{
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
  const res = await fetch(`http://localhost:5000/api/member/edit-role/${id}`,{
    method: 'PUT',
    headers:{
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({role, memberId})
  })
  return res.json();
}
