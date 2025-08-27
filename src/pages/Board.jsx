import { useState, useEffect, useRef, useCallback } from "react";
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
import { useSocket } from "../contexts/SocketContext";
import { Dialog } from "../components/ui/dialog";
import Card from "../components/Card";
import CardModal from "../components/CardModal";
import UserPresence from "../components/UserPresence";
import NotificationToast from "../components/NotificationToast";
import BoardSharing from "../components/BoardSharing";

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
    cards: [{ title: "Signed up for BoardHub" }],
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

  // Validate board ID
  useEffect(() => {
    if (!id) {
      console.error("No board ID provided");
      setError("Invalid board URL");
      return;
    }

    console.log("Board component mounted with ID:", id);
  }, [id]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { showSuccess, showError } = useToast();
  const {
    socket,
    isConnected,
    joinBoard,
    leaveBoard,
    emitCardCreated,
    emitCardUpdated,
    emitCardDeleted,
    emitCardMoved,
    emitListCreated,
    emitListUpdated,
    emitListDeleted,
    emitBoardUpdated,
  } = useSocket();

  // Debug logging
  console.log("Board component - socket:", socket);
  console.log("Board component - isConnected:", isConnected);
  console.log("Board component - board ID:", id);
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
  const [isFetching, setIsFetching] = useState(false);
  const hasLoadedRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

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

  // Debounce success messages to prevent spam
  const debouncedShowSuccess = useRef(
    debounce((message) => {
      showSuccess(message);
    }, 1000)
  ).current;

  // Define fetchBoard function outside useEffect so it can be used in real-time listeners
  const fetchBoard = useCallback(async () => {
    if (isFetching) {
      console.log("Already fetching board, skipping...");
      return;
    }

    // Rate limiting: prevent fetching more than once every 2 seconds
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 2000) {
      console.log(
        "Rate limit: skipping fetch, last fetch was",
        now - lastFetchTimeRef.current,
        "ms ago"
      );
      return;
    }

    console.log("fetchBoard called for board ID:", id);
    lastFetchTimeRef.current = now;
    setIsFetching(true);
    setLoading(true);
    setError("");

    try {
      const res = await boardAPI.getBoard(id);
      console.log("Board data received:", res.data);
      // Process the board data to ensure IDs are strings
      const processedBoard = {
        ...res.data,
        lists: (res.data.lists || []).map((list) => ({
          ...list,
          _id: String(list._id),
          cards: (list.cards || []).map((card) => ({
            ...card,
            _id: String(card._id),
          })),
        })),
      };
      setBoard(processedBoard);
      debouncedShowSuccess("Board loaded successfully");
    } catch (err) {
      console.error("Error fetching board:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
      });

      if (err.response?.status === 404) {
        setError("Board not found");
        showError("Board not found");
      } else if (err.response?.status === 401) {
        setError("Authentication required");
        showError("Please log in to access this board");
      } else if (err.response?.status === 403) {
        console.log("403 Error response data:", err.response?.data);

        // Check if this is a case where user needs to join the board
        // Try to join regardless of needsToJoin flag for now (fallback)
        const shouldTryJoin =
          err.response?.data?.needsToJoin ||
          err.response?.data?.message === "Not authorized to access this board";

        if (shouldTryJoin) {
          console.log("Attempting to join board automatically...");
          // Attempt to join the board automatically
          try {
            const joinRes = await boardAPI.joinBoard(id);
            console.log("Successfully joined board:", joinRes.data);

            // Use the board data from the join response
            const processedBoard = {
              ...joinRes.data.board,
              lists: (joinRes.data.board.lists || []).map((list) => ({
                ...list,
                _id: String(list._id),
                cards: (list.cards || []).map((card) => ({
                  ...card,
                  _id: String(card._id),
                })),
              })),
            };
            setBoard(processedBoard);
            showSuccess("Welcome to the board! You've been added as a member.");
            return;
          } catch (joinErr) {
            console.error("Failed to join board:", joinErr);
            console.error("Join error details:", {
              message: joinErr.message,
              response: joinErr.response?.data,
              status: joinErr.response?.status,
            });

            // If join failed with 404, the join endpoint might not exist yet
            if (joinErr.response?.status === 404) {
              setError("Board sharing not available");
              showError(
                "Board sharing feature is not available. Please ask the board owner to add you manually."
              );
            } else {
              setError("Failed to join board");
              showError("Failed to join board via shared link");
            }
            return;
          }
        }
        setError("Access denied");
        showError("You don't have permission to access this board");
      } else {
        setError("Failed to load board data");
        showError("Failed to load board data");
      }
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [id, showSuccess, showError, isFetching]);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      console.log("Initial board load for ID:", id);
      fetchBoard();
      hasLoadedRef.current = true;
    }

    // Only join board if socket is connected
    if (isConnected && socket) {
      console.log("Joining board:", id);
      joinBoard(id);
    }

    // Cleanup: leave board when component unmounts
    return () => {
      if (isConnected && socket) {
        console.log("Leaving board:", id);
        leaveBoard(id);
      }
    };
  }, [id, joinBoard, leaveBoard, fetchBoard, isConnected, socket]);

  // Add real-time update listeners
  useEffect(() => {
    if (!socket || !isConnected) {
      console.log("Socket not connected, skipping real-time listeners");
      return;
    }

    console.log("Setting up real-time listeners for board:", id);

    // Listen for card updates from other users
    const handleCardCreated = (data) => {
      if (data.boardId === id) {
        console.log("Received card-created event:", data);
        setBoard((prev) => {
          // Check if card already exists to prevent duplicates
          const cardExists = prev.lists.some((list) =>
            list.cards.some((card) => card._id === data.card._id)
          );
          if (cardExists) return prev;

          return {
            ...prev,
            lists: prev.lists.map((list) =>
              list._id === data.listId
                ? { ...list, cards: [...list.cards, data.card] }
                : list
            ),
          };
        });
      }
    };

    const handleCardUpdated = (data) => {
      if (data.boardId === id) {
        setBoard((prev) => ({
          ...prev,
          lists: prev.lists.map((list) =>
            list._id === data.listId
              ? {
                  ...list,
                  cards: list.cards.map((card) =>
                    card._id === data.cardId
                      ? { ...card, ...data.updatedFields }
                      : card
                  ),
                }
              : list
          ),
        }));
      }
    };

    const handleCardDeleted = (data) => {
      if (data.boardId === id) {
        setBoard((prev) => ({
          ...prev,
          lists: prev.lists.map((list) =>
            list._id === data.listId
              ? {
                  ...list,
                  cards: list.cards.filter((c) => c._id !== data.cardId),
                }
              : list
          ),
        }));
      }
    };

    const handleCardMoved = (data) => {
      if (data.boardId === id) {
        console.log("Received card-moved event:", data);
        // Don't call fetchBoard here as it causes infinite loops
        // Instead, we'll handle card movement updates in the UI directly
        // The card movement is already handled by the drag-and-drop logic
      }
    };

    const handleListCreated = (data) => {
      if (data.boardId === id) {
        console.log("Received list-created event:", data);
        setBoard((prev) => {
          // Check if list already exists to prevent duplicates
          const listExists = prev.lists.some(
            (list) => list._id === data.list._id
          );
          if (listExists) return prev;

          return {
            ...prev,
            lists: [...prev.lists, data.list],
          };
        });
      }
    };

    const handleListUpdated = (data) => {
      if (data.boardId === id) {
        setBoard((prev) => ({
          ...prev,
          lists: prev.lists.map((list) =>
            list._id === data.listId ? { ...list, title: data.title } : list
          ),
        }));
      }
    };

    const handleListDeleted = (data) => {
      if (data.boardId === id) {
        setBoard((prev) => ({
          ...prev,
          lists: prev.lists.filter((list) => list._id !== data.listId),
        }));
      }
    };

    // Add event listeners
    socket.on("card-created", handleCardCreated);
    socket.on("card-updated", handleCardUpdated);
    socket.on("card-deleted", handleCardDeleted);
    socket.on("card-moved", handleCardMoved);
    socket.on("list-created", handleListCreated);
    socket.on("list-updated", handleListUpdated);
    socket.on("list-deleted", handleListDeleted);

    // Cleanup listeners
    return () => {
      if (socket) {
        socket.off("card-created", handleCardCreated);
        socket.off("card-updated", handleCardUpdated);
        socket.off("card-deleted", handleCardDeleted);
        socket.off("card-moved", handleCardMoved);
        socket.off("list-created", handleListCreated);
        socket.off("list-updated", handleListUpdated);
        socket.off("list-deleted", handleListDeleted);
      }
    };
  }, [socket, isConnected, id]);

  // Add a new list
  const handleAddList = async (title) => {
    try {
      const res = await listAPI.createList(id, { title });
      setBoard((prev) => ({ ...prev, lists: [...prev.lists, res.data] }));
      showSuccess("List added");

      // Emit real-time event
      emitListCreated({
        boardId: id,
        list: res.data,
      });
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

      // Emit real-time event
      emitListUpdated({
        boardId: id,
        listId,
        title: newTitle,
      });
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

      // Emit real-time event
      emitListDeleted({
        boardId: id,
        listId,
        listTitle: list.title,
      });
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
          description: card.description || "",
          labels: card.labels || [],
          checklists: card.checklists || [],
          dueDate: card.dueDate || { start: null, end: null },
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
    // Ensure new card uses the new structure
    const newCard = {
      title: cardData.title || "",
      description: cardData.description || "",
      labels: cardData.labels || [],
      checklists: cardData.checklists || [],
      dueDate: cardData.dueDate || { start: null, end: null },
    };
    try {
      const res = await cardAPI.createCard(listId, newCard);
      setBoard((prev) => ({
        ...prev,
        lists: prev.lists.map((list) =>
          list._id === listId
            ? { ...list, cards: [...list.cards, res.data] }
            : list
        ),
      }));
      showSuccess("Card added");

      // Emit real-time event
      emitCardCreated({
        boardId: id,
        listId,
        card: res.data,
      });
    } catch (err) {
      showError("Failed to add card");
    }
  };

  // Edit a card
  const handleEditCard = async (cardId, listId, updatedFields) => {
    try {
      await cardAPI.updateCard(cardId, updatedFields);
      setBoard((prev) => ({
        ...prev,
        lists: prev.lists.map((list) =>
          list._id === listId
            ? {
                ...list,
                cards: list.cards.map((card) =>
                  card._id === cardId ? { ...card, ...updatedFields } : card
                ),
              }
            : list
        ),
      }));
      showSuccess("Card updated");

      // Emit real-time event
      emitCardUpdated({
        boardId: id,
        listId,
        cardId,
        updatedFields,
      });
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

      // Emit real-time event
      emitCardDeleted({
        boardId: id,
        listId,
        cardId,
      });
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

      // Emit real-time event
      emitCardMoved({
        boardId: id,
        cardId: draggableId,
        sourceListId: source.droppableId,
        destinationListId: destination.droppableId,
        sourceIndex: source.index,
        destinationIndex: destination.index,
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

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md w-full text-center">
          <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
            {error}
          </div>
          <div className="text-red-500 dark:text-red-300 text-sm mb-4">
            Please check your permissions or try refreshing the page.
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );

  if (!board)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md w-full text-center">
          <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
            Board not found or failed to load.
          </div>
          <div className="text-red-500 dark:text-red-300 text-sm mb-4">
            The board may have been deleted or you may not have permission to
            access it.
          </div>
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );

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
        <div className="flex items-center gap-3 flex-wrap">
          {/* Board sharing */}
          <BoardSharing board={board} onMemberUpdate={fetchBoard} />
          {/* Real-time user presence */}
          <UserPresence />
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
                          className="bg-card rounded-lg p-3 md:p-4 w-72 md:w-80 min-w-[18rem] md:min-w-[20rem] flex-shrink-0 max-h-[calc(100vh-100px)] flex flex-col border border-border transition-colors duration-300"
                        >
                          <div className="flex justify-between items-center mb-3 md:mb-4">
                            {editingListId === list._id ? (
                              <input
                                className="text-base md:text-lg font-semibold bg-muted text-foreground rounded px-2 py-1 w-40 border border-border transition-colors duration-200"
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
                                className="text-base md:text-lg text-foreground font-semibold cursor-pointer truncate pr-2 transition-colors duration-200"
                                onClick={() => {
                                  setEditingListId(list._id);
                                  setEditingListTitle(list.title);
                                }}
                              >
                                {list.title}
                              </h2>
                            )}
                            <div className="relative group">
                              <MoreHorizontal className="text-muted-foreground cursor-pointer w-5 h-5 transition-colors duration-200" />
                              <div className="absolute right-0 mt-2 w-40 bg-popover rounded shadow-lg z-10 hidden group-hover:block border border-border transition-colors duration-300">
                                <button
                                  className="flex items-center w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent transition-colors duration-200"
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
      {/* Render CardModal if a card is selected */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={closeCardModal}
          onUpdate={(updatedCard) => {
            setBoard((prev) => ({
              ...prev,
              lists: prev.lists.map((list) =>
                list._id === selectedCard.list._id
                  ? {
                      ...list,
                      cards: list.cards.map((c) =>
                        c._id === updatedCard._id ? updatedCard : c
                      ),
                    }
                  : list
              ),
            }));
          }}
        />
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

      {/* Real-time notifications */}
      <NotificationToast />
    </div>
  );
}
