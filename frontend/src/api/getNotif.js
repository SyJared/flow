import { BASE_URL } from "./auth";

export const getNotif = async()=>{
  const token = localStorage.getItem('token')
  const res = await fetch(`${BASE_URL}/get-notification`,{
    method: "GET",
    headers: {Authorization: `Bearer ${token}`}
  })
  return res.json()
}

export const markAsRead = async()=>{
  const token = localStorage.getItem('token')
  const res = await fetch(`${BASE_URL}/read-notif`,{
    method:"POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return res.json()
}