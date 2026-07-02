import React, { useState, useEffect } from "react";
import { Upload, File, X, Image, FileText, Download } from "lucide-react";
import { attachmentAPI } from "../../services/api";
import { getSocket } from "../../socket";
import toast from "react-hot-toast";

export default function AttachmentUpload({ ticketId }) {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAttachments();
  }, [ticketId]);

  // Socket listener for new attachments
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleAttachmentAdded = (attachment) => {
      if (attachment.ticketId === ticketId) {
        setAttachments((prev) => [...prev, attachment]);
      }
    };

    socket.on("attachmentAdded", handleAttachmentAdded);
    return () => socket.off("attachmentAdded", handleAttachmentAdded);
  }, [ticketId]);

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      const response = await attachmentAPI.list(ticketId);
      setAttachments(response.data.attachments || []);
    } catch (error) {
      console.error("Failed to fetch attachments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      const response = await attachmentAPI.upload(ticketId, file);
      setAttachments((prev) => [...prev, response.data.attachment]);
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId) => {
    if (!confirm("Are you sure you want to delete this attachment?")) return;

    try {
      await attachmentAPI.remove(attachmentId);
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
      toast.success("Attachment deleted");
    } catch (error) {
      toast.error("Failed to delete attachment");
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith("image/"))
      return <Image size={20} className="text-purple-400" />;
    if (mimeType === "application/pdf")
      return <FileText size={20} className="text-red-400" />;
    return <File size={20} className="text-blue-400" />;
  };

  const getFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex items-center gap-4">
        <label className="cursor-pointer">
          <input
            type="file"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/30 transition text-indigo-400">
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload File
              </>
            )}
          </div>
        </label>
        <span className="text-xs text-slate-400">Max 10MB</span>
      </div>

      {/* Attachments List */}
      {attachments.length === 0 ? (
        <div className="text-center text-slate-400 text-sm py-4">
          No attachments yet
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg p-3"
            >
              <div className="flex items-center gap-3">
                {getFileIcon(attachment.mimeType)}
                <div>
                  <p className="text-white text-sm font-medium truncate max-w-xs">
                    {attachment.fileName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {getFileSize(attachment.fileSize)} • Uploaded by{" "}
                    {attachment.uploadedBy?.name || "Unknown"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={attachment.fileUrl}
                  download
                  className="p-1.5 text-slate-400 hover:text-white transition rounded hover:bg-white/10"
                >
                  <Download size={16} />
                </a>
                <button
                  onClick={() => handleDelete(attachment.id)}
                  className="p-1.5 text-slate-400 hover:text-red-400 transition rounded hover:bg-white/10"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
