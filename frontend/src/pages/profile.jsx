import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, UserRound } from "lucide-react";
import { useAuth } from "../features/auth/authContext";

function ProfilePage() {
  const { user, userLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userLoading && !user?.id) navigate("/login", { replace: true });
  }, [user, userLoading, navigate]);

  if (userLoading || !user?.id) return null;

  const name = user.name || "User";
  const initials = name.split(/\s+/).filter(Boolean).map(part => part[0]).join("").toUpperCase().slice(0, 2);

  return (
    <main className="min-h-screen bg-[#F7F5F3] pt-24 pb-12">
      <div className="mx-auto max-w-3xl px-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8A7464]">Account</p>
        <h1 className="mb-7 text-3xl font-semibold text-[#202940]">Your Profile</h1>
        <section className="overflow-hidden rounded-2xl border border-[#4B4038]/15 bg-white shadow-sm">
          <div className="flex items-center gap-4 bg-[#202940] px-6 py-7">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4B4038] text-lg font-semibold text-[#F4E6DA]">{initials || <UserRound />}</div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold text-[#F4E6DA]">{name}</h2>
              <p className="mt-1 text-sm text-[#CAAA98]">Flow account</p>
            </div>
          </div>
          <div className="divide-y divide-[#4B4038]/10 px-6">
            <div className="flex items-center gap-3 py-5">
              <UserRound size={18} className="text-[#8A7464]" />
              <div><p className="text-xs font-medium uppercase tracking-wider text-[#8A7464]">Name</p><p className="mt-1 text-sm text-[#202940]">{name}</p></div>
            </div>
            <div className="flex items-center gap-3 py-5">
              <Mail size={18} className="text-[#8A7464]" />
              <div><p className="text-xs font-medium uppercase tracking-wider text-[#8A7464]">Email</p><p className="mt-1 text-sm text-[#202940]">{user.email || user.info?.email || "No email available"}</p></div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ProfilePage;
