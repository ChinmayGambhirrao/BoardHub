import { Draggable } from "react-beautiful-dnd";
import { Calendar, Users, Paperclip, CheckSquare } from "lucide-react";
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
  // Checklist progress
  const checklistTotal = card.checklist?.total || 0;
  const checklistCompleted = card.checklist?.completed || 0;
  const checklistProgress = checklistTotal
    ? Math.round((checklistCompleted / checklistTotal) * 100)
    : 0;

  return (
    <Dialog>
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
            <DialogTrigger asChild>
              <div>
                <h4 className="mb-2 font-medium">{card.title}</h4>
                <p className="mb-3 text-sm text-muted-foreground">
                  {card.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {card.labels.map((label) => (
                    <Badge key={label} variant="secondary">
                      {label}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {/* Due date */}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(card.dueDate), "MMM d")}</span>
                  </div>
                  {/* Attachments */}
                  {typeof card.attachments === "number" &&
                    card.attachments > 0 && (
                      <div className="flex items-center gap-1">
                        <Paperclip className="h-4 w-4" />
                        <span>{card.attachments}</span>
                      </div>
                    )}
                  {/* Checklist */}
                  {typeof card.checklist === "object" &&
                    card.checklist.total > 0 && (
                      <div className="flex items-center gap-1">
                        <CheckSquare className="h-4 w-4" />
                        <span>
                          {card.checklist.completed}/{card.checklist.total}
                        </span>
                        {/* Progress bar for checklist */}
                        <div className="ml-1 h-2 w-10 rounded bg-muted">
                          <div
                            className="h-2 rounded bg-green-500"
                            style={{ width: `${checklistProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  {/* Assignees */}
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{card.assignees.length}</span>
                  </div>
                </div>
              </div>
            </DialogTrigger>
          </div>
        )}
      </Draggable>
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
          <div>
            <h4 className="mb-2 font-medium">Attachments</h4>
            <p className="text-sm text-muted-foreground">
              {card.attachments || 0} attachment(s)
            </p>
          </div>
          <div>
            <h4 className="mb-2 font-medium">Checklist</h4>
            {typeof card.checklist === "object" && card.checklist.total > 0 ? (
              <div className="flex items-center gap-2">
                <span>
                  {card.checklist.completed}/{card.checklist.total} completed
                </span>
                <div className="h-2 w-24 rounded bg-muted">
                  <div
                    className="h-2 rounded bg-green-500"
                    style={{ width: `${checklistProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                No checklist
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
