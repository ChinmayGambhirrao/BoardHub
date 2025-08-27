import React, { useState } from "react";
import { Share2, Users, Copy, Mail } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";
import { Input } from "./ui/input";
import { useToast } from "../contexts/ToastContext";

export default function BoardSharing({ board, onMemberUpdate }) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const { showSuccess, showError } = useToast();

  const handleCopyLink = () => {
    const boardUrl = `${window.location.origin}/board/${board._id}`;
    navigator.clipboard
      .writeText(boardUrl)
      .then(() => {
        showSuccess("Board link copied to clipboard!");
      })
      .catch(() => {
        showError("Failed to copy link");
      });
  };

  const handleInviteByEmail = async () => {
    if (!inviteEmail.trim()) {
      showError("Please enter an email address");
      return;
    }

    try {
      // TODO: Implement API call to invite user by email
      showSuccess(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
    } catch (error) {
      showError("Failed to send invitation");
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowShareDialog(true)}
        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>

      {showShareDialog && (
        <Dialog onClose={() => setShowShareDialog(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Share Board
            </h3>

            <div className="space-y-4">
              {/* Copy Link Section */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Share Link
                </label>
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}/board/${board._id}`}
                    readOnly
                    className="flex-1"
                  />
                  <Button onClick={handleCopyLink} size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Anyone with this link can view the board
                </p>
              </div>

              {/* Email Invitation Section */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Invite by Email
                </label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleInviteByEmail} size="sm">
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Board Members */}
              {board?.members && board.members.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Board Members ({board.members.length})
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {board.members.map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                      >
                        <span className="text-sm">
                          {member.email || member.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {member.role || "Member"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowShareDialog(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
