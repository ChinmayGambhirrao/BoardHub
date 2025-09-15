import { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Plus,
  MoreHorizontal,
  X,
  Edit,
  Trash2,
  Move,
  Archive,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { boardAPI, listAPI, cardAPI } from "../api";
import { useToast } from "../contexts/ToastContext";
import { Dialog } from "../components/ui/dialog";
import Card from "../components/Card";

const SAMPLE_LISTS = [
  {
    title: "To-Do",
    cards: [
      { title: "This is a card! 👋 Select it to see its card back." },
      { title: "Hold and drag to move this card to another list 👉" },
      {
        title:
          "Invite collaborators to your board by selecting the menu to the right of the notifications bell.",
      },
    ],
  },
  {
    title: "Doing",
    cards: [
      { title: "This card has an attachment.", attachment: true },
      {
        title: "This card has a label and a checklist.",
        label: true,
        checklist: true,
      },
    ],
  },
  {
    title: "🎉 Done",
    cards: [{ title: "Signed up for Trello" }],
  },
];

// Debounce utility
function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function Board() {
  const { id } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { showSuccess, showError } = useToast();
  const [showAddCard, setShowAddCard] = useState({});
  const [newCardTitle, setNewCardTitle] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [moveTarget, setMoveTarget] = useState({ listId: "", position: 0 });
  const cardTitleInputRef = useRef();
  const [editingListId, setEditingListId] = useState(null);
  const [editingListTitle, setEditingListTitle] = useState("");
  const [showDeleteListModal, setShowDeleteListModal] = useState(false);
  const [listToDelete, setListToDelete] = useState(null);
  const [undoData, setUndoData] = useState(null);
  const [showUndo, setShowUndo] = useState(false);
  const [showAddListModal, setShowAddListModal] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const addListInputRef = useRef();

  const debouncedSaveDescription = useRef(
    debounce(async (cardId, description, listId) => {
      try {
        await cardAPI.updateCard(cardId, { description });
        setBoard((prev) => ({
          ...prev,
          lists: prev.lists.map((list) =>
            list._id === listId
              ? {
                  ...list,
                  cards: list.cards.map((card) =>
                    card._id === cardId ? { ...card, description } : card
                  ),
                }
              : list
          ),
        }));
      } catch (err) {
        // Optionally show error
      }
    }, 600)
  ).current;

  useEffect(() => {
    const fetchBoard = async () => {
      setLoading(true);
      setError("");
      try {
        let res = await boardAPI.getBoard(id);
        // If board has no lists, add sample lists/cards
        if (!res.data.lists || res.data.lists.length === 0) {
          for (const sampleList of SAMPLE_LISTS) {
            const listRes = await listAPI.createList(id, {
              title: sampleList.title,
            });
            for (const card of sampleList.cards) {
              await cardAPI.createCard(listRes.data._id, { title: card.title });
            }
          }
          res = await boardAPI.getBoard(id);
        }

        // Process the board data to ensure IDs are strings
        const processedBoard = {
          ...res.data,
          lists: res.data.lists.map((list) => ({
            ...list,
            _id: String(list._id),
            cards: (list.cards || []).map((card) => ({
              ...card,
              _id: String(card._id),
            })),
          })),
        };

        setBoard(processedBoard);
        showSuccess("Board loaded successfully");
      } catch (err) {
        setError("Failed to load board data");
        showError("Failed to load board data");
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, [id, showSuccess, showError]);

  // Add a new list
  const handleAddList = async (title) => {
    try {
      const res = await listAPI.createList(id, { title });
      setBoard((prev) => ({ ...prev, lists: [...prev.lists, res.data] }));
      showSuccess("List added");
    } catch (err) {
      showError("Failed to add list");
    }
  };

  // Edit a list
  const handleEditList = async (listId, newTitle) => {
    try {
      await listAPI.updateList(listId, { title: newTitle });
      setBoard((prev) => ({
        ...prev,
        lists: prev.lists.map((list) =>
          list._id === listId ? { ...list, title: newTitle } : list
        ),
      }));
      showSuccess("List updated");
    } catch (err) {
      showError("Failed to update list");
    }
  };

  // Delete a list
  const handleDeleteList = async (listId) => {
    const list = board.lists.find((l) => l._id === listId);
    setUndoData({ list, cards: list.cards });
    setShowUndo(true);
    setBoard((prev) => ({
      ...prev,
      lists: prev.lists.filter((l) => l._id !== listId),
    }));
    setShowDeleteListModal(false);
    setListToDelete(null);
    try {
      await listAPI.deleteList(listId);
      showSuccess("List deleted");
    } catch (err) {
      showError("Failed to delete list");
    }
  };

  const handleUndoDeleteList = async () => {
    if (!undoData) return;
    try {
      // Re-create the list
      const res = await listAPI.createList(id, { title: undoData.list.title });
      // Re-create cards
      for (const card of undoData.cards) {
        await cardAPI.createCard(res.data._id, {
          title: card.title,
          description: card.description,
        });
      }
      // Refresh board
      const boardRes = await boardAPI.getBoard(id);
      setBoard(boardRes.data);
      showSuccess("List restored");
    } catch (err) {
      showError("Failed to restore list");
    } finally {
      setShowUndo(false);
      setUndoData(null);
    }
  };

  // Add a new card to a list
  const handleAddCard = async (listId, cardData) => {
    try {
      const res = await cardAPI.createCard(listId, cardData);
      setBoard((prev) => ({
        ...prev,
        lists: prev.lists.map((list) =>
          list._id === listId
            ? { ...list, cards: [...list.cards, res.data] }
            : list
        ),
      }));
      showSuccess("Card added");
    } catch (err) {
      showError("Failed to add card");
    }
  };

  // Edit a card
  const handleEditCard = async (cardId, listId, newTitle) => {
    try {
      await cardAPI.updateCard(cardId, { title: newTitle });
      setBoard((prev) => ({
        ...prev,
        lists: prev.lists.map((list) =>
          list._id === listId
            ? {
                ...list,
                cards: list.cards.map((card) =>
                  card._id === cardId ? { ...card, title: newTitle } : card
                ),
              }
            : list
        ),
      }));
      showSuccess("Card updated");
    } catch (err) {
      showError("Failed to update card");
    }
  };

  // Delete a card
  const handleDeleteCard = async (cardId, listId) => {
    try {
      await cardAPI.deleteCard(cardId);
      setBoard((prev) => ({
        ...prev,
        lists: prev.lists.map((list) =>
          list._id === listId
            ? { ...list, cards: list.cards.filter((c) => c._id !== cardId) }
            : list
        ),
      }));
      showSuccess("Card deleted");
    } catch (err) {
      showError("Failed to delete card");
    }
  };

  // Drag-and-drop handler
  const onDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;

    // If there's no destination or dropped in the same place, do nothing
    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Handle list reordering
    if (type === "list") {
      const newLists = Array.from(board.lists);
      const [movedList] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, movedList);

      // Update UI first
      setBoard((prevBoard) => ({
        ...prevBoard,
        lists: newLists,
      }));

      // Then update server
      try {
        await listAPI.reorderLists(id, {
          lists: newLists.map((list, idx) => ({
            id: list._id,
            position: idx,
          })),
        });
      } catch (err) {
        console.error("Failed to reorder lists:", err);
        showError("Failed to reorder lists");
        // Revert the UI change
        setBoard((prevBoard) => ({
          ...prevBoard,
          lists: board.lists,
        }));
      }
      return;
    }

    // Handle card movement
    const sourceList = board.lists.find(
      (list) => list._id === source.droppableId
    );
    const destList = board.lists.find(
      (list) => list._id === destination.droppableId
    );

    if (!sourceList || !destList) {
      console.error("Source or destination list not found");
      return;
    }

    // Make copies of the card arrays
    const sourceCards = Array.from(sourceList.cards || []);
    const destCards =
      source.droppableId === destination.droppableId
        ? sourceCards
        : Array.from(destList.cards || []);

    // Find the card being moved
    const cardIndex = sourceCards.findIndex((card) => card._id === draggableId);
    if (cardIndex === -1) {
      console.error("Card not found in source list");
      return;
    }

    // Move the card
    const [movedCard] = sourceCards.splice(cardIndex, 1);
    destCards.splice(destination.index, 0, movedCard);

    // Update UI first
    setBoard((prevBoard) => ({
      ...prevBoard,
      lists: prevBoard.lists.map((list) => {
        if (list._id === source.droppableId) {
          return { ...list, cards: sourceCards };
        }
        if (list._id === destination.droppableId) {
          return { ...list, cards: destCards };
        }
        return list;
      }),
    }));

    // Then update server
    try {
      await cardAPI.moveCard(draggableId, {
        destinationListId: destination.droppableId,
        position: destination.index,
      });
    } catch (err) {
      console.error("Failed to move card:", err);
      showError("Failed to move card");
      // Revert the UI change
      setBoard((prevBoard) => ({
        ...prevBoard,
        lists: board.lists,
      }));
    }
  };

  // Add card dialog logic
  const openAddCard = (listId) => {
    setShowAddCard({ [listId]: true });
    setTimeout(() => cardTitleInputRef.current?.focus(), 100);
  };
  const closeAddCard = () => {
    setShowAddCard({});
    setNewCardTitle("");
  };
  const handleAddCardSubmit = async (listId) => {
    if (!newCardTitle.trim()) return;
    await handleAddCard(listId, { title: newCardTitle });
    closeAddCard();
  };

  // Card modal logic
  const openCardModal = (card, list) => {
    setSelectedCard({ ...card, list });
  };
  const closeCardModal = () => setSelectedCard(null);

  // Move dialog logic
  const openMoveDialog = () => setShowMoveDialog(true);
  const closeMoveDialog = () => setShowMoveDialog(false);
  const handleMoveCard = async () => {
    if (!selectedCard) return;
    await cardAPI.moveCard(selectedCard._id, {
      destinationListId: moveTarget.listId,
      position: moveTarget.position,
    });
    setShowMoveDialog(false);
    setSelectedCard(null);
    // Refresh board
    const res = await boardAPI.getBoard(id);
    setBoard(res.data);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!board) return null;

  return (
    <div
      style={{ background: board?.background || "#0079bf", minHeight: "100vh" }}
      className="flex flex-col"
    >
      {/* Board header - Made responsive */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-3 md:px-8 py-4 bg-black/20">
        <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-2 md:mb-0">
          <h1 className="text-xl md:text-2xl font-bold text-white">
            {board?.title}
          </h1>
          <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded">
            Template
          </span>
          <span className="text-white/80 text-xs md:text-sm hidden md:inline">
            This is a public template for anyone on the internet to copy.
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Fake member avatars */}
          {["DO", "JH", "ZS", "CC"].map((initials, i) => (
            <div
              key={i}
              className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs md:text-sm font-bold border-2 border-white -ml-2 first:ml-0"
            >
              {initials}
            </div>
          ))}
        </div>
      </div>
      {/* Lists as columns - Made responsive with horizontal scroll */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          droppableId="board-droppable"
          direction="horizontal"
          type="list"
        >
          {(provided) => (
            <div
              className="flex flex-col gap-4 px-2 py-4 md:flex-row md:gap-4 md:px-8 md:py-8 md:overflow-x-auto md:pb-8 md:touch-pan-x min-h-[calc(100vh-80px)]"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {board.lists &&
                board.lists.map((list, listIndex) => {
                  // Skip lists with missing IDs
                  if (!list._id) {
                    console.warn("List missing _id:", list);
                    return null;
                  }

                  return (
                    <Draggable
                      key={list._id}
                      draggableId={list._id}
                      index={listIndex}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-black/60 rounded-lg p-3 md:p-4 w-72 md:w-80 min-w-[18rem] md:min-w-[20rem] flex-shrink-0 max-h-[calc(100vh-100px)] flex flex-col"
                        >
                          <div className="flex justify-between items-center mb-3 md:mb-4">
                            {editingListId === list._id ? (
                              <input
                                className="text-base md:text-lg font-semibold bg-gray-900 text-white rounded px-2 py-1 w-40"
                                value={editingListTitle}
                                autoFocus
                                onChange={(e) =>
                                  setEditingListTitle(e.target.value)
                                }
                                onBlur={() => {
                                  if (
                                    editingListTitle.trim() &&
                                    editingListTitle !== list.title
                                  ) {
                                    handleEditList(
                                      list._id,
                                      editingListTitle.trim()
                                    );
                                  }
                                  setEditingListId(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    if (
                                      editingListTitle.trim() &&
                                      editingListTitle !== list.title
                                    ) {
                                      handleEditList(
                                        list._id,
                                        editingListTitle.trim()
                                      );
                                    }
                                    setEditingListId(null);
                                  } else if (e.key === "Escape") {
                                    setEditingListId(null);
                                  }
                                }}
                              />
                            ) : (
                              <h2
                                className="text-base md:text-lg text-white font-semibold cursor-pointer truncate pr-2"
                                onClick={() => {
                                  setEditingListId(list._id);
                                  setEditingListTitle(list.title);
                                }}
                              >
                                {list.title}
                              </h2>
                            )}
                            <div className="relative group">
                              <MoreHorizontal className="text-white/60 cursor-pointer w-5 h-5" />
                              <div className="absolute right-0 mt-2 w-40 bg-gray-800 rounded shadow-lg z-10 hidden group-hover:block">
                                <button
                                  className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gray-700"
                                  onClick={() => {
                                    setEditingListId(list._id);
                                    setEditingListTitle(list.title);
                                  }}
                                >
                                  <Edit className="w-4 h-4 mr-2" /> Edit
                                </button>
                                <button
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                                  onClick={() => {
                                    setShowDeleteListModal(true);
                                    setListToDelete(list._id);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </button>
                              </div>
                            </div>
                          </div>
                          {/* Cards - Made responsive with scrolling */}
                          <Droppable droppableId={list._id} type="card">
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="space-y-2 min-h-[40px] overflow-y-auto flex-grow"
                              >
                                {list.cards &&
                                  list.cards.map((card, cardIndex) => (
                                    <Card
                                      key={card._id}
                                      card={card}
                                      index={cardIndex}
                                      listId={list._id}
                                      onOpenCard={openCardModal}
                                      onDeleteCard={handleDeleteCard}
                                    />
                                  ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                          {/* Add card button */}
                          {showAddCard[list._id] ? (
                            <div className="mt-2">
                              <textarea
                                ref={cardTitleInputRef}
                                className="w-full p-2 rounded bg-gray-700 text-white resize-none text-sm md:text-base"
                                placeholder="Enter a title for this card..."
                                value={newCardTitle}
                                onChange={(e) =>
                                  setNewCardTitle(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddCard(list._id, {
                                      title: newCardTitle,
                                    });
                                    setNewCardTitle("");
                                    setShowAddCard({
                                      ...showAddCard,
                                      [list._id]: false,
                                    });
                                  }
                                }}
                              />
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    handleAddCard(list._id, {
                                      title: newCardTitle,
                                    });
                                    setNewCardTitle("");
                                    setShowAddCard({
                                      ...showAddCard,
                                      [list._id]: false,
                                    });
                                  }}
                                >
                                  Add Card
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setShowAddCard({
                                      ...showAddCard,
                                      [list._id]: false,
                                    });
                                    setNewCardTitle("");
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              className="mt-2 text-white/80 hover:bg-white/10 text-sm md:text-base"
                              onClick={() => openAddCard(list._id)}
                            >
                              + Add a card
                            </Button>
                          )}
                        </div>
                      )}
                    </Draggable>
                  );
                })}
              {provided.placeholder}
              {/* Add list button */}
              <div
                className="bg-black/40 rounded-lg p-3 md:p-4 w-72 md:w-80 min-w-[18rem] md:min-w-[20rem] flex-shrink-0 flex items-center justify-center cursor-pointer hover:bg-black/60 transition mt-0 md:mt-8 h-16 md:h-auto"
                onClick={() => {
                  setShowAddListModal(true);
                  setTimeout(() => addListInputRef.current?.focus(), 100);
                }}
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5 text-white mr-2" />
                <span className="text-white/80 text-sm md:text-base">
                  Add another list
                </span>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {/* Card modal - Made responsive */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 md:p-0">
          <div className="bg-[#22272b] rounded-lg p-4 md:p-8 w-full max-w-lg shadow-lg relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-white/70 hover:text-white"
              onClick={closeCardModal}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 pr-6">
              {selectedCard.title}
            </h2>
            <label className="block text-white/80 mb-2 text-sm md:text-base">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 rounded bg-[#282E33] text-white mb-4 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              placeholder="Add a more detailed description..."
              value={selectedCard.description || ""}
              onChange={(e) => {
                setSelectedCard({
                  ...selectedCard,
                  description: e.target.value,
                });
                debouncedSaveDescription(
                  selectedCard._id,
                  e.target.value,
                  selectedCard.list._id
                );
              }}
            />
            <div className="flex justify-between items-center mt-4">
              <div className="text-white/80 font-semibold text-sm md:text-base">
                Actions
              </div>
              <Button size="sm" onClick={openMoveDialog}>
                Move
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Move card dialog - Made responsive */}
      {showMoveDialog && selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 md:p-0">
          <div className="bg-[#22272b] rounded-lg p-4 md:p-8 w-full max-w-xs shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-white/70 hover:text-white"
              onClick={closeMoveDialog}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white mb-4">Move card</h2>
            <div className="mb-4">
              <div className="flex gap-2 mb-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 bg-gray-700 text-white text-xs md:text-sm"
                  disabled
                >
                  Inbox
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-blue-900 text-white text-xs md:text-sm"
                  disabled
                >
                  Board
                </Button>
              </div>
              <label className="block text-white/80 mb-1 text-sm">Board</label>
              <select
                className="w-full mb-2 rounded bg-gray-900 text-white px-2 py-1 text-sm"
                disabled
              >
                <option>{board.title}</option>
              </select>
              <label className="block text-white/80 mb-1 text-sm">List</label>
              <select
                className="w-full mb-2 rounded bg-gray-900 text-white px-2 py-1 text-sm"
                value={moveTarget.listId || selectedCard.list._id}
                onChange={(e) =>
                  setMoveTarget({ ...moveTarget, listId: e.target.value })
                }
              >
                {board.lists.map((list) => (
                  <option key={list._id} value={list._id}>
                    {list.title}
                  </option>
                ))}
              </select>
              <label className="block text-white/80 mb-1 text-sm">
                Position
              </label>
              <select
                className="w-full mb-4 rounded bg-gray-900 text-white px-2 py-1 text-sm"
                value={moveTarget.position}
                onChange={(e) =>
                  setMoveTarget({
                    ...moveTarget,
                    position: Number(e.target.value),
                  })
                }
              >
                {(() => {
                  const list = board.lists.find(
                    (l) =>
                      l._id === (moveTarget.listId || selectedCard.list._id)
                  );
                  return list
                    ? Array.from(
                        { length: (list.cards?.length || 0) + 1 },
                        (_, i) => (
                          <option key={i} value={i}>
                            {i + 1}
                          </option>
                        )
                      )
                    : null;
                })()}
              </select>
              <Button size="sm" className="w-full" onClick={handleMoveCard}>
                Move
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Custom delete modal - Made responsive */}
      {showDeleteListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 md:p-0">
          <div className="bg-[#22272b] rounded-lg p-4 md:p-8 w-full max-w-xs shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-white/70 hover:text-white"
              onClick={() => setShowDeleteListModal(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white mb-4">Delete list?</h2>
            <p className="text-white/80 mb-4 text-sm md:text-base">
              Are you sure you want to delete this list and all its cards? This
              action can be undone.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                className="w-full"
                onClick={() => handleDeleteList(listToDelete)}
              >
                Delete
              </Button>
              <Button
                size="sm"
                className="w-full"
                onClick={() => setShowDeleteListModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Undo snackbar - Made responsive */}
      {showUndo && (
        <div className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 md:px-6 py-2 md:py-3 rounded shadow-lg flex items-center gap-2 md:gap-4 text-sm md:text-base">
          <span>List deleted.</span>
          <Button size="sm" onClick={handleUndoDeleteList}>
            Undo
          </Button>
          <button
            className="ml-1 md:ml-2 text-white/60 hover:text-white"
            onClick={() => setShowUndo(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Add list modal - Made responsive */}
      {showAddListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 md:p-0">
          <div className="bg-[#22272b] rounded-lg p-4 md:p-8 w-full max-w-xs shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-white/70 hover:text-white"
              onClick={() => {
                setShowAddListModal(false);
                setNewListTitle("");
              }}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white mb-4">Add new list</h2>
            <input
              ref={addListInputRef}
              className="w-full px-3 py-2 rounded bg-gray-900 text-white mb-4 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              placeholder="List title"
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newListTitle.trim()) {
                  handleAddList(newListTitle.trim());
                  setShowAddListModal(false);
                  setNewListTitle("");
                } else if (e.key === "Escape") {
                  setShowAddListModal(false);
                  setNewListTitle("");
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="w-full"
                disabled={!newListTitle.trim()}
                onClick={() => {
                  if (newListTitle.trim()) {
                    handleAddList(newListTitle.trim());
                    setShowAddListModal(false);
                    setNewListTitle("");
                  }
                }}
              >
                Add
              </Button>
              <Button
                size="sm"
                className="w-full"
                variant="ghost"
                onClick={() => {
                  setShowAddListModal(false);
                  setNewListTitle("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
