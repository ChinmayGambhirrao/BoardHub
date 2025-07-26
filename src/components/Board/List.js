import React, { useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import Card from "./Card";

const List = ({ list, index }) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardText, setNewCardText] = useState("");

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!newCardText.trim()) return;
    // Here you would call an API to add the card
    // For now, just log it
    console.log("Adding card:", newCardText, "to list:", list.id);
    setNewCardText("");
    setIsAddingCard(false);
  };

  return (
    <div
      className="bg-[#ebecf0] rounded min-w-[272px] max-w-[272px] mr-2 h-fit max-h-[calc(100vh-120px)] flex flex-col \
      sm:min-w-full sm:max-w-full sm:mr-0 sm:mb-4 sm:px-2 sm:py-2"
    >
      <div className="p-2 flex justify-between items-center relative">
        <h3 className="font-semibold text-sm m-0">{list.title}</h3>
      </div>
      <Droppable droppableId={list.id} type="CARD">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="px-2 overflow-y-auto flex-grow"
          >
            {list.cards.map((card, index) => (
              <Card
                key={card.id || card._id}
                card={card}
                index={index}
                listId={list.id || list._id}
                onOpenCard={
                  typeof onOpenCard === "function" ? onOpenCard : undefined
                }
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      {isAddingCard ? (
        <form className="px-2 pb-2" onSubmit={handleAddCard}>
          <textarea
            value={newCardText}
            onChange={(e) => setNewCardText(e.target.value)}
            placeholder="Enter a title for this card..."
            autoFocus
            className="w-full border-none resize-none p-2 rounded shadow text-sm mb-2 font-sans focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={2}
          />
          <div className="flex items-center gap-2">
            <button
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              type="submit"
            >
              Add Card
            </button>
            <button
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
              type="button"
              onClick={() => setIsAddingCard(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          className="m-2 p-2 text-[#5e6c84] bg-none w-[calc(100%-16px)] text-left rounded hover:bg-gray-200 hover:text-[#172b4d] transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={() => setIsAddingCard(true)}
        >
          + Add a card
        </button>
      )}
    </div>
  );
};

export default List;
