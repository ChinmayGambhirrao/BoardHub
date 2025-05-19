import { useState } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { Plus, MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import Card from "./Card";
import { LoadingSpinner } from "./ui/loading-spinner";
import { useError } from "../contexts/ErrorContext";
import { useLoading } from "../contexts/LoadingContext";
import { useToast } from "../contexts/ToastContext";
import CardForm from "./CardForm";
import ColumnForm from "./ColumnForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Column({ column, index }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddCardDialogOpen, setIsAddCardDialogOpen] = useState(false);
  const { setError } = useError();
  const { setComponentLoading, getComponentState } = useLoading();
  const { showSuccess, showError } = useToast();

  const columnState = getComponentState(`column-${column.id}`);

  const handleDeleteColumn = async () => {
    setComponentLoading(`column-${column.id}`, true, "Deleting column...");
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showSuccess("Column deleted successfully");
      // TODO: Remove column from state
    } catch (error) {
      setError("UNEXPECTED_ERROR", "Failed to delete column");
      showError("Failed to delete column");
    } finally {
      setComponentLoading(`column-${column.id}`, false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleEditColumn = async (data) => {
    setComponentLoading(`column-${column.id}`, true, "Updating column...");
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showSuccess("Column updated successfully");
      // TODO: Update column in state
    } catch (error) {
      setError("UNEXPECTED_ERROR", "Failed to update column");
      showError("Failed to update column");
    } finally {
      setComponentLoading(`column-${column.id}`, false);
      setIsEditDialogOpen(false);
    }
  };

  const handleAddCard = async (data) => {
    setComponentLoading(`column-${column.id}`, true, "Adding card...");
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showSuccess("Card added successfully");
      // TODO: Add card to state
    } catch (error) {
      setError("UNEXPECTED_ERROR", "Failed to add card");
      showError("Failed to add card");
    } finally {
      setComponentLoading(`column-${column.id}`, false);
      setIsAddCardDialogOpen(false);
    }
  };

  const renderCard = (card, index) => (
    <Card key={card.id} card={card} index={index} />
  );

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="flex h-fit min-w-[272px] flex-col gap-2"
        >
          <div
            {...provided.dragHandleProps}
            className="flex items-center justify-between rounded-md bg-gray-800/50 p-2"
          >
            <h3 className="font-medium text-white">{column.title}</h3>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">
                {column.cards.length}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4 text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Column Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Copy Column</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Delete Column Dialog */}
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Column</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this column? This action cannot
                be undone.
              </p>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteColumn}
                  disabled={columnState.isLoading}
                >
                  {columnState.isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Column"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Column Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Column</DialogTitle>
              </DialogHeader>
              <ColumnForm
                onClose={() => setIsEditDialogOpen(false)}
                onSubmit={handleEditColumn}
                initialData={column}
              />
            </DialogContent>
          </Dialog>

          {/* Add Card Dialog */}
          <Dialog
            open={isAddCardDialogOpen}
            onOpenChange={setIsAddCardDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Card</DialogTitle>
              </DialogHeader>
              <CardForm
                columnId={column.id}
                onClose={() => setIsAddCardDialogOpen(false)}
                onSubmit={handleAddCard}
              />
            </DialogContent>
          </Dialog>

          <Droppable droppableId={column.id} type="card">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex flex-col gap-2"
              >
                {column.cards.length > 30 ? (
                  <VirtualizedList
                    items={column.cards}
                    renderItem={renderCard}
                  />
                ) : (
                  column.cards.map((card, index) => (
                    <Card key={card.id} card={card} index={index} />
                  ))
                )}
                {provided.placeholder}
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  disabled={columnState.isLoading}
                  onClick={() => setIsAddCardDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add a card
                </Button>
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
}
