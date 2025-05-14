import { Draggable, Droppable } from "react-beautiful-dnd";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import Card from "./Card";

export default function Column({ column, index }) {
  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="flex h-fit min-w-[272px] flex-col rounded-md bg-muted/50 p-2"
        >
          <div
            {...provided.dragHandleProps}
            className="mb-2 flex items-center justify-between px-2 py-1"
          >
            <h3 className="font-semibold">{column.title}</h3>
            <span className="text-sm text-muted-foreground">
              {column.cards.length}
            </span>
          </div>
          <Droppable droppableId={column.id} type="card">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex flex-col gap-2"
              >
                {column.cards.map((card, index) => (
                  <Card key={card.id} card={card} index={index} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          <Button
            variant="ghost"
            className="mt-2 w-full justify-start"
            onClick={() => console.log("Add card to", column.id)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add a card
          </Button>
        </div>
      )}
    </Draggable>
  );
}
