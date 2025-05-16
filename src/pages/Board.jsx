import { useState, useEffect } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Plus, MoreHorizontal } from "lucide-react";
import { useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import Column from "../components/Column";
import Card from "../components/Card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { LoadingSpinner, ProgressBar } from "../components/ui/loading-spinner";
import { useError } from "../contexts/ErrorContext";
import { useLoading } from "../contexts/LoadingContext";
import { useToast } from "../contexts/ToastContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

// Mock board info
const boardInfo = {
  name: "Basic Board",
  isTemplate: true,
  members: [
    { name: "Alice", avatar: "", initials: "AL" },
    { name: "Bob", avatar: "", initials: "BO" },
    { name: "Carol", avatar: "", initials: "CA" },
  ],
};

// Dummy data
const initialData = {
  columns: {
    "column-1": {
      id: "column-1",
      title: "To Do",
      cards: [
        {
          id: "card-1",
          title: "Create login page",
          description: "Implement user authentication with JWT",
          dueDate: "2024-02-20",
          labels: ["Frontend", "Auth"],
          assignees: ["Alice"],
          attachments: 2,
          checklist: { total: 3, completed: 1 },
        },
        {
          id: "card-2",
          title: "Design database schema",
          description: "Create MongoDB schema for users and boards",
          dueDate: "2024-02-22",
          labels: ["Backend", "Database"],
          assignees: ["Bob"],
          attachments: 0,
          checklist: { total: 2, completed: 2 },
        },
      ],
    },
    "column-2": {
      id: "column-2",
      title: "In Progress",
      cards: [
        {
          id: "card-3",
          title: "Set up authentication",
          description: "Implement JWT authentication middleware",
          dueDate: "2024-02-25",
          labels: ["Backend", "Auth"],
          assignees: ["Carol"],
          attachments: 1,
          checklist: { total: 4, completed: 2 },
        },
      ],
    },
    "column-3": {
      id: "column-3",
      title: "Done",
      cards: [
        {
          id: "card-4",
          title: "Project setup",
          description: "Initialize project with Vite and dependencies",
          dueDate: "2024-02-15",
          labels: ["Setup"],
          assignees: ["Alice"],
          attachments: 0,
          checklist: { total: 1, completed: 1 },
        },
        {
          id: "card-5",
          title: "Create repository",
          description: "Set up GitHub repository and documentation",
          dueDate: "2024-02-16",
          labels: ["Setup"],
          assignees: ["Bob"],
          attachments: 0,
          checklist: { total: 0, completed: 0 },
        },
      ],
    },
  },
  columnOrder: ["column-1", "column-2", "column-3"],
};

export default function Board() {
  const { id } = useParams();
  const [data, setData] = useState(initialData);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const { setError } = useError();
  const { setComponentLoading, getComponentState, setProgressState } =
    useLoading();
  const { showSuccess, showError } = useToast();

  // Simulate loading board data
  useEffect(() => {
    const loadBoard = async () => {
      setComponentLoading("board", true, "Loading board...");
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData(initialData);
        showSuccess("Board loaded successfully");
      } catch (error) {
        setError("DATA_LOADING_ERROR", "Failed to load board data");
        showError("Failed to load board data");
      } finally {
        setComponentLoading("board", false);
      }
    };

    loadBoard();
  }, [id, setComponentLoading, setError, showSuccess, showError]);

  const onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "column") {
      const newColumnOrder = Array.from(data.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);

      setData({
        ...data,
        columnOrder: newColumnOrder,
      });
      showSuccess("Column reordered successfully");
      return;
    }

    // Moving cards
    const start = data.columns[source.droppableId];
    const finish = data.columns[destination.droppableId];

    // Moving within the same column
    if (start === finish) {
      const newCards = Array.from(start.cards);
      const [removed] = newCards.splice(source.index, 1);
      newCards.splice(destination.index, 0, removed);

      const newColumn = {
        ...start,
        cards: newCards,
      };

      setData({
        ...data,
        columns: {
          ...data.columns,
          [newColumn.id]: newColumn,
        },
      });
      showSuccess("Card moved successfully");
      return;
    }

    // Moving from one column to another
    const startCards = Array.from(start.cards);
    const [removed] = startCards.splice(source.index, 1);
    const finishCards = Array.from(finish.cards);
    finishCards.splice(destination.index, 0, removed);

    setData({
      ...data,
      columns: {
        ...data.columns,
        [start.id]: {
          ...start,
          cards: startCards,
        },
        [finish.id]: {
          ...finish,
          cards: finishCards,
        },
      },
    });
    showSuccess("Card moved successfully");
  };

  const handleArchiveBoard = async () => {
    setComponentLoading("board", true, "Archiving board...");
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showSuccess("Board archived successfully");
      // TODO: Redirect to dashboard
    } catch (error) {
      setError("UNEXPECTED_ERROR", "Failed to archive board");
      showError("Failed to archive board");
    } finally {
      setComponentLoading("board", false);
      setIsArchiveDialogOpen(false);
    }
  };

  const boardState = getComponentState("board");

  if (boardState.isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-muted-foreground">{boardState.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] p-4 flex flex-col">
      {/* Board Header */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">{boardInfo.name}</h2>
          {boardInfo.isTemplate && (
            <Badge className="bg-gray-700 text-xs px-2 py-1">Template</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Avatars */}
          <div className="flex -space-x-2">
            {boardInfo.members.map((member) => (
              <Avatar
                key={member.name}
                className="h-8 w-8 border-2 border-background"
              >
                {member.avatar ? (
                  <AvatarImage src={member.avatar} alt={member.name} />
                ) : (
                  <AvatarFallback>{member.initials}</AvatarFallback>
                )}
              </Avatar>
            ))}
          </div>
          {/* Menu/Settings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-5 w-5 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Board Actions</DropdownMenuLabel>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsArchiveDialogOpen(true)}>
                Archive Board
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Copy Board Link</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Archive Board Dialog */}
      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Board</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to archive this board? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsArchiveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleArchiveBoard}
              disabled={boardState.isLoading}
            >
              {boardState.isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Archiving...
                </>
              ) : (
                "Archive Board"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Board Columns */}
      <div className="flex-1 min-h-0">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" type="column" direction="horizontal">
            {(provided) => (
              <div
                className="flex h-full gap-4 overflow-x-auto"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {data.columnOrder.map((columnId, index) => {
                  const column = data.columns[columnId];
                  return (
                    <Column key={column.id} column={column} index={index} />
                  );
                })}
                {provided.placeholder}
                <div className="flex h-fit min-w-[272px] items-center justify-center rounded-md border border-dashed p-4">
                  <Button variant="ghost" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Add another list
                  </Button>
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
