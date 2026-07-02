import React, { useRef, useState } from "react";
import { Camera, Upload } from "lucide-react";
import { userAPI } from "../../services/api";

export default function AvatarUpload({ user, onUploaded }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await userAPI.uploadAvatar(file);
      if (response?.data?.user) {
        onUploaded?.(response.data.user);
      }
    } catch (uploadError) {
      setError(uploadError.response?.data?.message || "Upload failed.");
    } finally {
      setLoading(false);
      event.target.value = null;
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="h-24 w-24 rounded-full border border-white/10 object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-500 text-3xl font-bold text-white">
            {user?.name?.charAt(0) || "U"}
          </div>
        )}
        <button
          type="button"
          onClick={handleSelectFile}
          className="absolute right-0 bottom-0 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg shadow-black/20 hover:bg-slate-800 transition"
        >
          <Camera size={16} />
        </button>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-white">Profile photo</p>
        <button
          type="button"
          onClick={handleSelectFile}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-3 py-2 text-sm text-white hover:bg-indigo-400 transition"
        >
          <Upload size={14} />
          {loading ? "Uploading..." : "Change photo"}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
