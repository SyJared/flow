import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { getNotif, markAsRead } from "../../api/getNotif";

function Notification() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([])
  const [notifMessage, setNotifMessage] = useState('')

  const [readMessage, setReadMessage] =useState('')  

  useEffect(() => {
  const loadNotif = async () => {
    try {
      const res = await getNotif();

      if (!res.results || res.results.length === 0) {
        setNotifMessage("No notifications");
        setNotifications([]);
      } else {
        setNotifications(res.results);
      }

    } catch (error) {
      console.log(error);
    }
  };

  loadNotif();
}, []);

const handleRead = async () => {
  try {
    const res = await markAsRead();

    if (res.success) {
      setReadMessage(res.message);

      setNotifications(prev =>
        prev.map(n => ({
          ...n,
          is_read: 1
        }))
      );
    }

  } catch (error) {
    console.log(error, "handleread");
  }
};

const hasUnread = notifications?.some?.(n => n.is_read === 0) ?? false


  return (
    <div className="relative">
      {/* Bell Button */}
      
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-md text-[#9A8678] hover:text-[#CAAA98] hover:bg-[#4B4038]/30 transition-colors"
      >
        <Bell size={18} />
        {hasUnread && (
  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#CAAA98]" />
)}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-[#2F2925] border border-[#4B4038] rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#4B4038] flex justify-between items-center">
            <h2 className="text-sm font-semibold text-[#E8D9CC]">
              Notifications
            </h2>
            <button className="text-xs text-[#CAAA98] hover:underline" onClick={()=>handleRead()}>
              Mark all read
            </button>
            {readMessage && (<p>{readMessage}</p>)}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
  {notifications.length === 0 ? (
    <p className="p-4 text-xs text-gray-400">No notifications</p>
  ) : (
    notifications.map((n) => (
      <div
        key={n.id}
        className="px-4 py-3 border-b border-[#4B4038]/40 hover:bg-[#4B4038]/20"
      >
        <p className="text-sm text-[#E8D9CC]">
          <span className="font-semibold">{n.actor_name}</span>{" "}
          {n.type === "create_task" && "created a task"}
          {n.type === "task_doing" && "started working on"}
          {n.type === "task_done" && "completed"}

          {n.task_title && (
            <span className="font-semibold"> {n.task_title}</span>
          )}
        </p>

        <p className="text-[10px] text-[#9A8678] mt-1">
          {new Date(n.created_at).toLocaleString()}
        </p>
      </div>
    ))
  )}
</div>

        </div>
      )}
    </div>
  );
}

export default Notification;