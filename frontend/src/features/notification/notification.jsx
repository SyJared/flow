import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { getNotif, markAsRead } from "../../api/getNotif";

function Notification({ showUnreadBadge = true }) {
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
        aria-label="Notifications"
        className="relative flex h-11 w-11 items-center justify-center rounded-full text-[#6e6e73] hover:text-[#0066cc] hover:bg-black/5 transition-colors"
      >
        <Bell size={18} />
        {showUnreadBadge && hasUnread && (
  <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#0071e3]" />
)}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-black/10 rounded-2xl shadow-[0_12px_32px_rgba(29,29,31,0.14)] z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-black/10 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-[#1d1d1f]">
              Notifications
            </h2>
            <button className="min-h-11 px-2 text-xs font-medium text-[#0071e3] hover:underline" onClick={()=>handleRead()}>
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
        className="px-4 py-3 border-b border-black/5 hover:bg-black/[0.035]"
      >
        <p className="text-sm text-[#1d1d1f]">
          <span className="font-semibold">{n.actor_name}</span>{" "}
          {n.type === "create_task" && "created a task"}
          {n.type === "task_doing" && "started working on"}
          {n.type === "task_done" && "completed"}

          {n.task_title && (
            <span className="font-semibold"> {n.task_title}</span>
            
          )}
        </p>
        <span className="font-semibold"> {n.message}</span>

        <p className="text-xs text-[#6e6e73] mt-1">
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
