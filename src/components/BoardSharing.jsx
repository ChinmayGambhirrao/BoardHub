import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { X, UserPlus, Copy, Mail, Users } from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";

const BoardSharing = ({ board, onMemberUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (board && board.members) {
      setMembers(board.members);
    }
  }, [board]);

  const handleInvite = async () => {
    if (!email.trim()) {
      showError("Please enter an email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/boards/${board._id}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ email, role }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess(`Invitation sent to ${email}`);
        setEmail("");
        setRole("member");
        if (onMemberUpdate) {
          onMemberUpdate();
        }
      } else {
        showError(data.message || "Failed to send invitation");
      }
    } catch (error) {
      showError("Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const response = await fetch(
        `/api/boards/${board._id}/members/${memberId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        showSuccess("Member removed successfully");
        setMembers(members.filter((m) => m._id !== memberId));
        if (onMemberUpdate) {
          onMemberUpdate();
        }
      } else {
        showError("Failed to remove member");
      }
    } catch (error) {
      showError("Failed to remove member");
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      const response = await fetch(
        `/api/boards/${board._id}/members/${memberId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (response.ok) {
        showSuccess("Member role updated successfully");
        setMembers(
          members.map((m) => (m._id === memberId ? { ...m, role: newRole } : m))
        );
        if (onMemberUpdate) {
          onMemberUpdate();
        }
      } else {
        showError("Failed to update member role");
      }
    } catch (error) {
      showError("Failed to update member role");
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/board/${board._id}`;
    navigator.clipboard.writeText(inviteLink);
    showSuccess("Invite link copied to clipboard");
  };

  const isOwner = board?.owner === user?._id;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Board</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invite Link Section */}
          <div className="space-y-2">
            <Label>Invite Link</Label>
            <div className="flex gap-2">
              <Input
                value={`${window.location.origin}/board/${board?._id}`}
                readOnly
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={copyInviteLink}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Invite by Email Section */}
          {isOwner && (
            <div className="space-y-2">
              <Label>Invite by Email</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleInvite} disabled={isLoading} size="sm">
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="space-y-2">
            <Label>Board Members</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {members.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={member.user?.avatar} />
                      <AvatarFallback className="text-xs">
                        {member.user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {member.user?.name || "Unknown User"}
                    </span>
                    <span className="text-xs text-gray-500">{member.role}</span>
                  </div>

                  {isOwner && member.user?._id !== user?._id && (
                    <div className="flex items-center gap-1">
                      <Select
                        value={member.role}
                        onValueChange={(newRole) =>
                          handleRoleChange(member._id, newRole)
                        }
                      >
                        <SelectTrigger className="w-20 h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member._id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() =>
                window.open(
                  `mailto:?subject=Join my board&body=Check out this board: ${window.location.origin}/board/${board?._id}`
                )
              }
            >
              <Mail className="w-4 h-4 mr-1" />
              Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={copyInviteLink}
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BoardSharing;
