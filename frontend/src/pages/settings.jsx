import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, House, SlidersHorizontal } from "lucide-react";
import { useAuth } from "../features/auth/authContext";
import { getPreferences, savePreferences } from "../utils/preferences";

function SettingsPage() {
  const { user, userLoading } = useAuth();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({ landingPage: "dashboard", showNotificationBadge: true });

  useEffect(() => {
    if (!userLoading && !user?.id) navigate("/login", { replace: true });
    if (user?.id) setPreferences(getPreferences(user.id));
  }, [user, userLoading, navigate]);

  const update = changes => {
    const next = { ...preferences, ...changes };
    setPreferences(next);
    savePreferences(user.id, next);
  };

  if (userLoading || !user?.id) return null;

  return (
    <main className="min-h-screen bg-[#F7F5F3] pt-24 pb-12">
      <div className="mx-auto max-w-3xl px-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8A7464]">Personalize Flow</p>
        <h1 className="mb-2 text-3xl font-semibold text-[#202940]">Settings</h1>
        <p className="mb-7 text-sm text-[#6F6258]">Choose where Flow takes you and how notifications appear.</p>

        <section className="overflow-hidden rounded-2xl border border-[#4B4038]/15 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-[#4B4038]/10 px-6 py-4">
            <SlidersHorizontal size={18} className="text-[#8A7464]" />
            <h2 className="font-semibold text-[#202940]">Your preferences</h2>
          </div>

          <div className="flex flex-col gap-3 border-b border-[#4B4038]/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <House size={18} className="mt-0.5 text-[#8A7464]" />
              <div>
                <label htmlFor="landing-page" className="text-sm font-medium text-[#202940]">Default page</label>
                <p className="mt-1 text-xs text-[#6F6258]">Used when you click the Flow logo or sign in.</p>
              </div>
            </div>
            <select id="landing-page" value={preferences.landingPage} onChange={event => update({ landingPage: event.target.value })} className="rounded-lg border border-[#4B4038]/20 bg-white px-3 py-2 text-sm text-[#202940] outline-none focus:border-[#9A8678]">
              <option value="dashboard">Dashboard</option>
              <option value="logged">My workspaces</option>
              <option value="teams">Teams</option>
            </select>
          </div>

          <label className="flex cursor-pointer items-start justify-between gap-4 px-6 py-5">
            <span className="flex items-start gap-3">
              <Bell size={18} className="mt-0.5 text-[#8A7464]" />
              <span>
                <span className="block text-sm font-medium text-[#202940]">Unread notification badge</span>
                <span className="mt-1 block text-xs text-[#6F6258]">Show a dot on the bell when you have unread notifications.</span>
              </span>
            </span>
            <input type="checkbox" checked={preferences.showNotificationBadge} onChange={event => update({ showNotificationBadge: event.target.checked })} className="mt-1 h-4 w-4 accent-[#202940]" />
          </label>
        </section>

        <p className="mt-4 text-xs text-[#8A7464]">These preferences are saved in this browser for your account.</p>
      </div>
    </main>
  );
}

export default SettingsPage;
