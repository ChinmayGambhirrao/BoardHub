import React, { useState } from "react";
import { PaperClipIcon, XMarkIcon } from "@heroicons/react/24/outline";

const CardModal = ({ card, onClose, onUpdate, onDelete }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/cards/${card._id}/attachments`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const attachment = await response.json();
      onUpdate({
        ...card,
        attachments: [...card.attachments, attachment],
      });
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAttachment = async (attachmentId) => {
    try {
      const response = await fetch(
        `/api/cards/${card._id}/attachments/${attachmentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove attachment");
      }

      onUpdate({
        ...card,
        attachments: card.attachments.filter((a) => a._id !== attachmentId),
      });
    } catch (error) {
      console.error("Remove attachment error:", error);
      setUploadError("Failed to remove attachment. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto">
        <div className="p-6">
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Attachments
            </h3>

            <div className="mb-4">
              <label className="block">
                <span className="sr-only">Choose file</span>
                <input
                  type="file"
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
              {uploading && (
                <p className="mt-2 text-sm text-gray-500">Uploading...</p>
              )}
              {uploadError && (
                <p className="mt-2 text-sm text-red-500">{uploadError}</p>
              )}
            </div>

            {card.attachments && card.attachments.length > 0 && (
              <div className="space-y-2">
                {card.attachments.map((attachment) => (
                  <div
                    key={attachment._id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center space-x-2">
                      <PaperClipIcon className="h-5 w-5 text-gray-400" />
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {attachment.originalName}
                      </a>
                    </div>
                    <button
                      onClick={() => handleRemoveAttachment(attachment._id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
