import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Users, Calendar } from "lucide-react";
import { Button } from "../components/ui/button";
import { useToast } from "../contexts/ToastContext";
import { inviteAPI } from "../api";

export default function InviteAccept() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await inviteAPI.getInvitation(token);
        setInvitation(response.data.invitation);
      } catch (error) {
        console.error("Error fetching invitation:", error);
        setError(
          error.response?.data?.error || "Invalid or expired invitation"
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInvitation();
    } else {
      setError("No invitation token provided");
      setLoading(false);
    }
  }, [token]);

  const handleAcceptInvitation = async () => {
    setAccepting(true);
    try {
      const response = await inviteAPI.acceptInvitation(token);
      showSuccess(response.data.message || "Successfully joined the board!");

      // Redirect to the board after a short delay
      setTimeout(() => {
        navigate(`/board/${response.data.boardId}`);
      }, 2000);
    } catch (error) {
      console.error("Error accepting invitation:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to accept invitation";
      showError(errorMessage);
      setError(errorMessage);
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading invitation...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Invalid Invitation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button onClick={() => navigate("/")} className="w-full">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Invitation not found
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">You're Invited!</h1>
          <p className="text-blue-100">
            {invitation.invitedBy.name} has invited you to collaborate
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Board Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {invitation.board.title}
            </h2>
            {invitation.board.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {invitation.board.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{invitation.role} access</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Expires {formatDate(invitation.expiresAt)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleAcceptInvitation}
              disabled={accepting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {accepting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Joining Board...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept Invitation & Join Board
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> You'll be automatically added to the board
              and can start collaborating immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
