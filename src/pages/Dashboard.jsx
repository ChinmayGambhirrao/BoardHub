import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const Dashboard = () => {
  const [personalBoards, setPersonalBoards] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for boards - in a real app, this would come from an API
    const mockPersonalBoards = [
      { id: "1", title: "Basic Board", background: "#0079bf", template: true },
      {
        id: "2",
        title: "Kanban Template",
        background: "#00c2e0",
        template: true,
      },
      {
        id: "3",
        title: "Daily Task Management Template",
        background: "#6e5dc6",
        template: true,
      },
      {
        id: "4",
        title: "Remote Team Hub",
        background: "#ff9f1a",
        template: true,
      },
    ];

    const mockRecentlyViewed = [
      { id: "1", title: "Basic Board", background: "#0079bf", template: true },
      {
        id: "5",
        title: "My Trello board",
        background: "#a259ff",
        template: false,
      },
    ];

    setPersonalBoards(mockPersonalBoards);
    setRecentlyViewed(mockRecentlyViewed);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
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

              <div className="grid grid-cols-4 gap-4">
                {personalBoards.map((board) => (
                  <div key={board.id} className="relative overflow-hidden">
                    <Link
                      to={`/board/${board.id}`}
                      className="block h-32 rounded overflow-hidden"
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
                        <div className="mt-8">
                          <h3 className="text-white font-medium">
                            {board.title}
                          </h3>
                        </div>
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
      </div>
    </div>
  );
};

export default Dashboard;
