import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { boardAPI } from "../api";

const BOARD_COLORS = [
  "#0079bf",
  "#d29034",
  "#519839",
  "#b04632",
  "#89609e",
  "#cd5a91",
  "#4bbf6b",
  "#00aecc",
  "#838c91",
];

const Dashboard = () => {
  const [personalBoards, setPersonalBoards] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardColor, setNewBoardColor] = useState(BOARD_COLORS[0]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchBoards = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await boardAPI.getBoards();
        let boards = res.data || [];
        // If user has no boards, add a default 'Basic Board' (only once)
        if (boards.length === 0) {
          const defaultBoard = await boardAPI.createBoard({
            title: "Basic Board",
            background: BOARD_COLORS[0],
          });
          boards = [defaultBoard.data];
        }
        setPersonalBoards(boards);
      } catch (err) {
        setError("Failed to load boards");
      } finally {
        setLoading(false);
      }
    };
    fetchBoards();
  }, []);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    setCreating(true);
    try {
      const res = await boardAPI.createBoard({
        title: newBoardName,
        background: newBoardColor,
      });
      setPersonalBoards((prev) => [res.data, ...prev]);
      setShowModal(false);
      setNewBoardName("");
      setNewBoardColor(BOARD_COLORS[0]);
      navigate(`/board/${res.data._id}`);
    } catch (err) {
      setError("Failed to create board");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="bg-[#1D2125] min-h-screen">
      <div className="max-w-[1200px] mx-auto py-10 px-4">
        {/* Boards section */}
        <div className="flex items-start mb-8">
          <div className="w-64 mr-6">
            <div className="flex flex-col space-y-1">
              <Button
                variant="ghost"
                className="justify-start text-white hover:bg-white/10 h-8"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 mr-2"
                  fill="currentColor"
                >
                  <path d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2 1v13h14V6H5z" />
                </svg>
                Boards
              </Button>
              <Button
                variant="ghost"
                className="justify-start text-white/70 hover:bg-white/10 h-8"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 mr-2"
                  fill="currentColor"
                >
                  <path d="M4 4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2H4zm16 2v12H4V6h16z M6 8h12v2H6V8zm0 4h12v2H6v-2zm0 4h8v2H6v-2z" />
                </svg>
                Templates
              </Button>
              <Button
                variant="ghost"
                className="justify-start text-white/70 hover:bg-white/10 h-8"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 mr-2"
                  fill="currentColor"
                >
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
                Home
              </Button>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-medium text-white/70 mb-2">
                Workspaces
              </h3>
              <div className="flex items-center py-1.5 px-2 bg-white/10 rounded mb-1">
                <div className="h-8 w-8 bg-teal-600 rounded flex items-center justify-center text-white mr-2">
                  T
                </div>
                <span className="text-white font-medium">
                  BoardHub Workspace
                </span>
              </div>

              <div className="flex flex-col pl-10 space-y-1">
                <Button
                  variant="ghost"
                  className="justify-start text-white/70 hover:bg-white/10 h-8"
                >
                  Boards
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-white/70 hover:bg-white/10 h-8"
                >
                  Members
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-white/70 hover:bg-white/10 h-8"
                >
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-white/70 hover:bg-white/10 h-8"
                >
                  Billing
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1">
            {/* Templates section */}
            <div className="relative mb-10 bg-[#282E33] rounded-md p-4 z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <svg
                    className="h-6 w-6 mr-2 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3 3a2 2 0 012-2h14a2 2 0 012 2v18a2 2 0 01-2 2H5a2 2 0 01-2-2V3zm16 0H5v18h14V3z" />
                    <path d="M7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h8v2H7v-2z" />
                  </svg>
                  <h2 className="text-lg font-medium text-white">
                    Most popular templates
                  </h2>
                </div>
                <button className="text-white/70 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-white/70 mb-6">
                Get going faster with a template from the Trello community or
              </p>

              <div className="flex items-center mb-4">
                <Select>
                  <SelectTrigger className="w-64 border-none bg-white/10 text-white h-9">
                    <SelectValue placeholder="choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="project">Project Management</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Board grid */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {/* Create new board card */}
                <div
                  className="flex flex-col items-center justify-center h-32 rounded bg-white/10 hover:bg-white/20 cursor-pointer border-2 border-dashed border-white/20 transition"
                  onClick={() => setShowModal(true)}
                >
                  <Plus className="w-8 h-8 text-white mb-2" />
                  <span className="text-white font-semibold">
                    Create new board
                  </span>
                </div>
                {/* User boards */}
                {personalBoards.map((board) => (
                  <div key={board._id} className="relative overflow-hidden">
                    <Link
                      to={`/board/${board._id}`}
                      className="block h-32 rounded overflow-hidden bg-gray-700 hover:bg-gray-600 transition"
                      style={{ background: board.background || "#0079bf" }}
                    >
                      <div className="flex items-end h-full p-4">
                        <span className="text-white font-bold text-lg">
                          {board.title}
                        </span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <a href="#" className="text-blue-400 hover:underline text-sm">
                  Browse the full template gallery
                </a>
              </div>
            </div>

            {/* Recently viewed section */}
            <div className="mb-8 z-10">
              <h2 className="flex items-center text-lg font-medium text-white mb-4">
                <svg
                  className="h-5 w-5 mr-2 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm1-13h-2v6l5.2 3.2.8-1.2-4-2.5V7z" />
                </svg>
                Recently viewed
              </h2>

              <div className="grid grid-cols-4 gap-4">
                {recentlyViewed.map((board) => (
                  <div key={board.id} className="relative overflow-hidden">
                    <Link
                      to={`/board/${board.id}`}
                      className="block h-24 rounded overflow-hidden"
                    >
                      <div
                        className="h-full w-full p-2 flex flex-col justify-between hover:brightness-90 transition-all"
                        style={{ backgroundColor: board.background }}
                      >
                        {board.template && (
                          <div className="absolute top-2 right-2 bg-white/20 text-white text-xs px-1.5 py-0.5 rounded z-10">
                            TEMPLATE
                          </div>
                        )}
                        <div>
                          <h3 className="text-white font-medium">
                            {board.title}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Modal for creating a board */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-[#22272b] rounded-lg p-8 w-full max-w-sm shadow-lg relative">
              <button
                className="absolute top-2 right-2 text-white/70 hover:text-white"
                onClick={() => setShowModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-white mb-4">
                Create board
              </h2>
              <form onSubmit={handleCreateBoard}>
                <label className="block text-white/80 mb-2">Board name</label>
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#282E33] text-white mb-4 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Project Launch"
                  required
                />
                <label className="block text-white/80 mb-2">
                  Background color
                </label>
                <div className="flex gap-2 mb-4">
                  {BOARD_COLORS.map((color) => (
                    <button
                      type="button"
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newBoardColor === color
                          ? "border-blue-500"
                          : "border-transparent"
                      }`}
                      style={{ background: color }}
                      onClick={() => setNewBoardColor(color)}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                >
                  {creating ? "Creating..." : "Create board"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
