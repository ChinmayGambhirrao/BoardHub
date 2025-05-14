import { Draggable } from "react-beautiful-dnd";
import { Calendar, Users } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Badge } from "./ui/badge";

export default function Card({ card, index }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Draggable draggableId={card.id} index={index}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={`cursor-pointer rounded-md border bg-card p-3 shadow-sm transition-shadow hover:shadow-md ${
                snapshot.isDragging ? "shadow-lg" : ""
              }`}
            >
              <h4 className="mb-2 font-medium">{card.title}</h4>
              <p className="mb-3 text-sm text-muted-foreground">
                {card.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {card.labels.map((label) => (
                  <Badge key={label} variant="secondary">
                    {label}
                  </Badge>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(card.dueDate), "MMM d")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{card.assignees.length}</span>
                </div>
              </div>
            </div>
          )}
        </Draggable>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{card.title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <h4 className="mb-2 font-medium">Description</h4>
            <p className="text-sm text-muted-foreground">{card.description}</p>
          </div>
          <div>
            <h4 className="mb-2 font-medium">Labels</h4>
            <div className="flex flex-wrap gap-2">
              {card.labels.map((label) => (
                <Badge key={label} variant="secondary">
                  {label}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-2 font-medium">Due Date</h4>
            <p className="text-sm text-muted-foreground">
              {format(new Date(card.dueDate), "MMMM d, yyyy")}
            </p>
          </div>
          <div>
            <h4 className="mb-2 font-medium">Assignees</h4>
            <div className="flex flex-wrap gap-2">
              {card.assignees.map((assignee) => (
                <Badge key={assignee} variant="outline">
                  {assignee}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
