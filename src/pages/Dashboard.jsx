import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Plus, Menu as MenuIcon } from "lucide-react";
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [boardsPerRow, setBoardsPerRow] = useState(4); // default to 4 for desktop
  const gridRef = useRef(null);
  const cardRef = useRef(null);

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

  // Calculate boards per row responsively
  useEffect(() => {
    function calculateBoardsPerRow() {
      if (!gridRef.current || !cardRef.current) return;
      const gridWidth = gridRef.current.offsetWidth;
      const cardWidth = cardRef.current.offsetWidth;
      if (cardWidth === 0) return;
      const perRow = Math.max(1, Math.floor(gridWidth / cardWidth));
      setBoardsPerRow(perRow);
    }
    calculateBoardsPerRow();
    window.addEventListener("resize", calculateBoardsPerRow);
    return () => window.removeEventListener("resize", calculateBoardsPerRow);
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
    <div className="bg-background min-h-screen transition-colors duration-300">
      {/* Hamburger for mobile */}
      <button
        className="sm:hidden p-3 text-foreground focus:outline-none transition-colors duration-200"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open sidebar menu"
      >
        <MenuIcon className="w-6 h-6" />
      </button>
      {/* Sidebar Drawer for mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex">
          <div className="bg-card w-64 h-full p-4 overflow-y-auto relative border-r border-border transition-colors duration-300">
            <button
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close sidebar menu"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col space-y-1 mt-8">
              <Button
                variant="ghost"
                className="justify-start text-foreground hover:bg-accent h-8 transition-colors duration-200"
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
                className="justify-start text-muted-foreground hover:bg-accent h-8 transition-colors duration-200"
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
                className="justify-start text-muted-foreground hover:bg-accent h-8 transition-colors duration-200"
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
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Workspaces
              </h3>
              <div className="flex items-center py-1.5 px-2 bg-accent rounded mb-1 transition-colors duration-200">
                <div className="h-8 w-8 bg-teal-600 rounded flex items-center justify-center text-white mr-2">
                  T
                </div>
                <span className="text-foreground font-medium">
                  BoardHub Workspace
                </span>
              </div>
              <div className="flex flex-col pl-10 space-y-1">
                <Button
                  variant="ghost"
                  className="justify-start text-muted-foreground hover:bg-accent h-8 transition-colors duration-200"
                >
                  Boards
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-muted-foreground hover:bg-accent h-8 transition-colors duration-200"
                >
                  Members
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-muted-foreground hover:bg-accent h-8 transition-colors duration-200"
                >
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-muted-foreground hover:bg-accent h-8 transition-colors duration-200"
                >
                  Billing
                </Button>
              </div>
            </div>
          </div>
          <div className="flex-1" onClick={() => setDrawerOpen(false)} />
        </div>
      )}
      <div className="max-w-[1200px] mx-auto py-10 px-4">
        {/* Boards section */}
        <div className="flex items-start mb-8">
          <div className="w-64 mr-6 hidden sm:block">
            <div className="flex flex-col space-y-1">
              <Button
                variant="ghost"
                className="justify-start text-foreground hover:bg-accent h-8 transition-colors duration-200"
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
                className="justify-start text-muted-foreground hover:bg-accent h-8 transition-colors duration-200"
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
                className="justify-start text-muted-foreground hover:bg-accent h-8 transition-colors duration-200"
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
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Workspaces
              </h3>
              <div className="flex items-center py-1.5 px-2 bg-accent rounded mb-1 transition-colors duration-200">
                <div className="h-8 w-8 bg-teal-600 rounded flex items-center justify-center text-white mr-2">
                  T
                </div>
                <span className="text-foreground font-medium">
                  BoardHub Workspace
                </span>
              </div>

              <div className="flex flex-col pl-10 space-y-1">
                <Button
                  variant="ghost"
                  className="justify-start text-muted-foreground hover:bg-accent h-8 transition-colors duration-200"
                >
                  Boards
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-muted-foreground hover:bg-accent h-8 transition-colors duration-200"
                >
                  Members
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-muted-foreground hover:bg-accent h-8 transition-colors duration-200"
                >
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-muted-foreground hover:bg-accent h-8 transition-colors duration-200"
                >
                  Billing
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1">
            {/* Templates section */}
            <div className="relative mb-10 bg-card rounded-md p-4 z-10 border border-border transition-colors duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <svg
                    className="h-6 w-6 mr-2 text-foreground"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3 3a2 2 0 012-2h14a2 2 0 012 2v18a2 2 0 01-2 2H5a2 2 0 01-2-2V3zm16 0H5v18h14V3z" />
                    <path d="M7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h8v2H7v-2z" />
                  </svg>
                  <h2 className="text-lg font-medium text-foreground">
                    Most popular templates
                  </h2>
                </div>
              </div>

              <p className="text-muted-foreground mb-6">
                Get going faster with a template from the Trello community or
              </p>

              <div className="flex items-center mb-4">
                <Select>
                  <SelectTrigger className="w-64 border-border bg-muted text-foreground h-9 transition-colors duration-200">
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
              <div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8"
                ref={gridRef}
              >
                {/* Create new board card */}
                <div
                  className="flex flex-col items-center justify-center h-32 rounded bg-muted hover:bg-accent cursor-pointer border-2 border-dashed border-border transition-colors duration-200"
                  onClick={() => setShowModal(true)}
                  ref={cardRef}
                >
                  <Plus className="w-8 h-8 text-foreground mb-2" />
                  <span className="text-foreground font-semibold">
                    Create new board
                  </span>
                </div>
                {/* User boards */}
                {(expanded
                  ? personalBoards
                  : personalBoards.slice(0, boardsPerRow * 2)
                ).map((board) => (
                  <div key={board._id} className="relative overflow-hidden">
                    <Link
                      to={`/board/${board._id}`}
                      className="block h-32 rounded overflow-hidden hover:opacity-90 transition-opacity duration-200"
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
              {/* View More / Show Less button */}
              {personalBoards.length > boardsPerRow * 2 && (
                <div className="flex justify-center mb-4">
                  <Button
                    variant="outline"
                    className="text-primary border-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                    onClick={() => setExpanded((prev) => !prev)}
                  >
                    {expanded ? "Show Less" : "View More"}
                  </Button>
                </div>
              )}

              <div className="mt-4">
                <a
                  href="#"
                  className="text-primary hover:underline text-sm transition-colors duration-200"
                >
                  Browse the full template gallery
                </a>
              </div>
            </div>

            {/* Recently viewed section */}
            <div className="mb-8 z-10">
              <h2 className="flex items-center text-lg font-medium text-foreground mb-4">
                <svg
                  className="h-5 w-5 mr-2 text-foreground"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm1-13h-2v6l5.2 3.2.8-1.2-4-2.5V7z" />
                </svg>
                Recently viewed
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-card rounded-lg p-8 w-full max-w-sm shadow-lg relative border border-border transition-colors duration-300">
              <button
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                onClick={() => setShowModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-foreground mb-4">
                Create board
              </h2>
              <form onSubmit={handleCreateBoard}>
                <label className="block text-muted-foreground mb-2">
                  Board name
                </label>
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-muted text-foreground mb-4 border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-200"
                  placeholder="e.g. Project Launch"
                  required
                />
                <label className="block text-muted-foreground mb-2">
                  Background color
                </label>
                <div className="flex gap-2 mb-4">
                  {BOARD_COLORS.map((color) => (
                    <button
                      type="button"
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newBoardColor === color
                          ? "border-primary"
                          : "border-transparent"
                      } transition-colors duration-200`}
                      style={{ background: color }}
                      onClick={() => setNewBoardColor(color)}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-2 rounded bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors duration-200"
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
