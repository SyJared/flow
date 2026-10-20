import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Mail, Trash2, UserRound } from "lucide-react";
import { useAuth } from "../features/auth/authContext";
import { API_ORIGIN, saveProfilePicture } from "../api/auth";

function ProfilePage() {
  const { user, setUser, userLoading } = useAuth();
  const navigate = useNavigate();
  const [pictureMessage, setPictureMessage] = useState("");
  const [savingPicture, setSavingPicture] = useState(false);

  useEffect(() => {
    if (!userLoading && !user?.id) navigate("/login", { replace: true });
  }, [user, userLoading, navigate]);

  if (userLoading || !user?.id) return null;

  const name = user.name || "User";
  const initials = name.split(/\s+/).filter(Boolean).map(part => part[0]).join("").toUpperCase().slice(0, 2);

  const handlePictureChange = async event => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setPictureMessage("Choose a PNG, JPEG, or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPictureMessage("The image must be 2 MB or smaller.");
      return;
    }

    setSavingPicture(true);
    setPictureMessage("");
    try {
      const imageData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Could not read this image."));
        reader.readAsDataURL(file);
      });
      const response = await saveProfilePicture(imageData);
      if (!response.success) throw new Error(response.message || "Could not save the picture.");
      setUser(current => ({ ...current, profile_picture: response.profilePicture }));
      setPictureMessage("Profile picture updated.");
    } catch (error) {
      setPictureMessage(error.message || "Could not save the picture.");
    } finally {
      setSavingPicture(false);
    }
  };

  const handleRemovePicture = async () => {
    setSavingPicture(true);
    setPictureMessage("");
    try {
      const response = await saveProfilePicture(null);
      if (!response.success) throw new Error(response.message || "Could not remove the picture.");
      setUser(current => ({ ...current, profile_picture: null }));
      setPictureMessage("Profile picture removed.");
    } catch (error) {
      setPictureMessage(error.message || "Could not remove the picture.");
    } finally {
      setSavingPicture(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F5F3] pt-24 pb-12">
      <div className="mx-auto max-w-3xl px-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8A7464]">Account</p>
        <h1 className="mb-7 text-3xl font-semibold text-[#202940]">Your Profile</h1>
        <section className="overflow-hidden rounded-2xl border border-[#4B4038]/15 bg-white shadow-sm">
          <div className="flex items-center gap-4 bg-[#202940] px-6 py-7">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#4B4038] text-lg font-semibold text-[#F4E6DA]">
              {user.profile_picture ? <img src={`${API_ORIGIN}${user.profile_picture}`} alt={`${name}'s profile`} className="h-full w-full object-cover" /> : initials || <UserRound />}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold text-[#F4E6DA]">{name}</h2>
              <p className="mt-1 text-sm text-[#CAAA98]">Flow account</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-b border-[#4B4038]/10 px-6 py-4">
            <label className={`inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#202940] px-4 py-2 text-sm font-medium text-[#F4E6DA] hover:bg-[#2d3a55] ${savingPicture ? "pointer-events-none opacity-60" : ""}`}>
              <Camera size={16} /> {savingPicture ? "Saving…" : user.profile_picture ? "Change picture" : "Upload picture"}
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePictureChange} className="sr-only" disabled={savingPicture} />
            </label>
            {user.profile_picture && (
              <button type="button" onClick={handleRemovePicture} disabled={savingPicture} className="inline-flex items-center gap-2 rounded-lg border border-[#4B4038]/20 px-4 py-2 text-sm font-medium text-[#4B4038] hover:bg-[#F7F5F3] disabled:opacity-50">
                <Trash2 size={15} /> Remove picture
              </button>
            )}
            <span className="text-xs text-[#6F6258]">PNG, JPEG, or WebP · up to 2 MB</span>
            {pictureMessage && <p role="status" className="w-full text-xs text-[#6F6258]">{pictureMessage}</p>}
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
