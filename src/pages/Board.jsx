import { useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import Column from "../components/Column";
import Card from "../components/Card";

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
          assignees: ["John Doe"],
        },
        {
          id: "card-2",
          title: "Design database schema",
          description: "Create MongoDB schema for users and boards",
          dueDate: "2024-02-22",
          labels: ["Backend", "Database"],
          assignees: ["Jane Smith"],
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
          assignees: ["John Doe"],
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
          assignees: ["Jane Smith"],
        },
        {
          id: "card-5",
          title: "Create repository",
          description: "Set up GitHub repository and documentation",
          dueDate: "2024-02-16",
          labels: ["Setup"],
          assignees: ["John Doe"],
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

    // If dropped outside a droppable area
    if (!destination) return;

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // If dragging a column
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

    // If dragging a card
    const sourceColumn = data.columns[source.droppableId];
    const destColumn = data.columns[destination.droppableId];
    const sourceCards = Array.from(sourceColumn.cards);
    const destCards =
      source.droppableId === destination.droppableId
        ? sourceCards
        : Array.from(destColumn.cards);

    // Remove card from source
    sourceCards.splice(source.index, 1);
    // Add card to destination
    destCards.splice(
      destination.index,
      0,
      sourceColumn.cards.find((card) => card.id === draggableId)
    );

    setData({
      ...data,
      columns: {
        ...data.columns,
        [source.droppableId]: {
          ...sourceColumn,
          cards: sourceCards,
        },
        [destination.droppableId]: {
          ...destColumn,
          cards: destCards,
        },
      },
    });
  };

  return (
    <div className="h-[calc(100vh-4rem)] p-4">
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
                return <Column key={column.id} column={column} index={index} />;
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
  );
}
