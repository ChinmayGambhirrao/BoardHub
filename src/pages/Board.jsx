import { useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Plus, MoreHorizontal } from "lucide-react";
import { Button } from "../components/ui/button";
import Column from "../components/Column";
import Card from "../components/Card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
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
  const [data, setData] = useState(initialData);

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
  };

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
            {boardInfo.members.map((member, idx) => (
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
              <DropdownMenuItem>Archive Board</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Copy Board Link</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
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
