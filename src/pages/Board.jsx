import { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Plus, MoreHorizontal, X } from "lucide-react";
import { useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { boardAPI, listAPI, cardAPI } from "../api";
import { useToast } from "../contexts/ToastContext";
import { Dialog } from "../components/ui/dialog";

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
        setBoard(res.data);
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
    try {
      await listAPI.deleteList(listId);
      setBoard((prev) => ({
        ...prev,
        lists: prev.lists.filter((list) => list._id !== listId),
      }));
      showSuccess("List deleted");
    } catch (err) {
      showError("Failed to delete list");
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
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    if (type === "list") {
      // Reorder lists
      const newLists = Array.from(board.lists);
      const [removed] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, removed);
      setBoard((prev) => ({ ...prev, lists: newLists }));
      try {
        await listAPI.reorderLists(id, {
          lists: newLists.map((l, idx) => ({ id: l._id, position: idx })),
        });
        showSuccess("Lists reordered");
      } catch (err) {
        showError("Failed to reorder lists");
      }
      return;
    }
    // Moving cards
    const sourceList = board.lists.find((l) => l._id === source.droppableId);
    const destList = board.lists.find((l) => l._id === destination.droppableId);
    if (!sourceList || !destList) return;
    const sourceCards = Array.from(sourceList.cards);
    const [removed] = sourceCards.splice(source.index, 1);
    if (sourceList._id === destList._id) {
      sourceCards.splice(destination.index, 0, removed);
      setBoard((prev) => ({
        ...prev,
        lists: prev.lists.map((l) =>
          l._id === sourceList._id ? { ...l, cards: sourceCards } : l
        ),
      }));
    } else {
      const destCards = Array.from(destList.cards);
      destCards.splice(destination.index, 0, removed);
      setBoard((prev) => ({
        ...prev,
        lists: prev.lists.map((l) => {
          if (l._id === sourceList._id) return { ...l, cards: sourceCards };
          if (l._id === destList._id) return { ...l, cards: destCards };
          return l;
        }),
      }));
    }
    try {
      await cardAPI.moveCard(draggableId, {
        destinationListId: destList._id,
        position: destination.index,
      });
      showSuccess("Card moved");
    } catch (err) {
      showError("Failed to move card");
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
    >
      {/* Board header */}
      <div className="flex items-center justify-between px-8 py-4 bg-black/20">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">{board?.title}</h1>
          <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded">
            Template
          </span>
          <span className="text-white/80 text-sm">
            This is a public template for anyone on the internet to copy.
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Fake member avatars */}
          {["DO", "JH", "ZS", "CC"].map((initials, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold border-2 border-white -ml-2 first:ml-0"
            >
              {initials}
            </div>
          ))}
        </div>
      </div>
      {/* Lists as columns */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          droppableId="board-droppable"
          direction="horizontal"
          type="list"
        >
          {(provided) => (
            <div
              className="flex gap-4 px-8 py-8 overflow-x-auto"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {board.lists &&
                board.lists.map((list, listIdx) => (
                  <Draggable
                    draggableId={list._id}
                    index={listIdx}
                    key={list._id}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-black/60 rounded-lg p-4 w-80 min-w-[20rem] flex-shrink-0"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-lg text-white font-semibold">
                            {list.title}
                          </h2>
                          <MoreHorizontal className="text-white/60" />
                        </div>
                        {/* Cards */}
                        <Droppable droppableId={list._id} type="card">
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="space-y-2 min-h-[40px]"
                            >
                              {list.cards &&
                                list.cards.map((card, cardIdx) => (
                                  <Draggable
                                    draggableId={card._id}
                                    index={cardIdx}
                                    key={card._id}
                                  >
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="bg-gray-800 rounded p-3 mb-2 flex flex-col gap-2 cursor-pointer hover:bg-gray-700 transition"
                                        onClick={() =>
                                          openCardModal(card, list)
                                        }
                                      >
                                        <span className="text-white">
                                          {card.title}
                                        </span>
                                        {card.description &&
                                          card.description.trim() !== "" && (
                                            <span className="text-gray-300 text-xs mt-1 line-clamp-2">
                                              {card.description}
                                            </span>
                                          )}
                                        {/* Add icons/labels/attachments/checklists as needed */}
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                        {/* Add card button/dialog */}
                        {showAddCard[list._id] ? (
                          <div className="mt-2">
                            <input
                              ref={cardTitleInputRef}
                              type="text"
                              value={newCardTitle}
                              onChange={(e) => setNewCardTitle(e.target.value)}
                              className="w-full px-2 py-1 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none"
                              placeholder="Card title"
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  handleAddCardSubmit(list._id);
                                if (e.key === "Escape") closeAddCard();
                              }}
                            />
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                onClick={() => handleAddCardSubmit(list._id)}
                              >
                                Add Card
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={closeAddCard}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            className="mt-2 text-white/80 hover:bg-white/10"
                            onClick={() => openAddCard(list._id)}
                          >
                            + Add a card
                          </Button>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
              {/* Add list button */}
              <div
                className="bg-black/40 rounded-lg p-4 w-80 min-w-[20rem] flex-shrink-0 flex items-center justify-center cursor-pointer hover:bg-black/60 transition mt-8"
                onClick={() => {
                  const title = prompt("List title?");
                  if (title) handleAddList(title);
                }}
              >
                <Plus className="w-5 h-5 text-white mr-2" />
                <span className="text-white/80">Add another list</span>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {/* Card modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#22272b] rounded-lg p-8 w-full max-w-lg shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-white/70 hover:text-white"
              onClick={closeCardModal}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-4">
              {selectedCard.title}
            </h2>
            <label className="block text-white/80 mb-2">Description</label>
            <textarea
              className="w-full px-3 py-2 rounded bg-[#282E33] text-white mb-4 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <div className="text-white/80 font-semibold">Actions</div>
              <Button size="sm" onClick={openMoveDialog}>
                Move
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Move card dialog */}
      {showMoveDialog && selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#22272b] rounded-lg p-8 w-full max-w-xs shadow-lg relative">
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
                  className="flex-1 bg-gray-700 text-white"
                  disabled
                >
                  Inbox
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-blue-900 text-white"
                  disabled
                >
                  Board
                </Button>
              </div>
              <label className="block text-white/80 mb-1">Board</label>
              <select
                className="w-full mb-2 rounded bg-gray-900 text-white px-2 py-1"
                disabled
              >
                <option>{board.title}</option>
              </select>
              <label className="block text-white/80 mb-1">List</label>
              <select
                className="w-full mb-2 rounded bg-gray-900 text-white px-2 py-1"
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
              <label className="block text-white/80 mb-1">Position</label>
              <select
                className="w-full mb-4 rounded bg-gray-900 text-white px-2 py-1"
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
    </div>
  );
}
