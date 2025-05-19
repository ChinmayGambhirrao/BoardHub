import React, { useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import styled from "styled-components";
import Card from "./Card";

const ListContainer = styled.div`
  background-color: #ebecf0;
  border-radius: 3px;
  min-width: 272px;
  max-width: 272px;
  margin-right: 8px;
  height: fit-content;
  max-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
`;

const ListHeader = styled.div`
  padding: 10px 8px;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ListTitle = styled.h3`
  font-weight: 600;
  font-size: 14px;
  margin: 0;
`;

const CardList = styled.div`
  padding: 0 8px;
  overflow-y: auto;
  flex-grow: 1;
`;

const AddCardButton = styled.button`
  margin: 8px;
  padding: 8px;
  color: #5e6c84;
  background: none;
  width: calc(100% - 16px);
  text-align: left;
  border-radius: 3px;

  &:hover {
    background-color: rgba(9, 30, 66, 0.08);
    color: #172b4d;
  }
`;

const AddCardForm = styled.form`
  padding: 0 8px 8px 8px;
`;

const CardTextarea = styled.textarea`
  width: 100%;
  border: none;
  resize: none;
  padding: 8px;
  border-radius: 3px;
  box-shadow: 0 1px 0 rgba(9, 30, 66, 0.25);
  font-family: inherit;
  margin-bottom: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
`;

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
    <ListContainer>
      <ListHeader>
        <ListTitle>{list.title}</ListTitle>
      </ListHeader>

      <Droppable droppableId={list.id} type="CARD">
        {(provided) => (
          <CardList ref={provided.innerRef} {...provided.droppableProps}>
            {list.cards.map((card, index) => (
              <Card key={card.id} card={card} index={index} />
            ))}
            {provided.placeholder}
          </CardList>
        )}
      </Droppable>

      {isAddingCard ? (
        <AddCardForm onSubmit={handleAddCard}>
          <CardTextarea
            value={newCardText}
            onChange={(e) => setNewCardText(e.target.value)}
            placeholder="Enter a title for this card..."
            autoFocus
          />
          <ButtonGroup>
            <button className="btn btn-primary" type="submit">
              Add Card
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => setIsAddingCard(false)}
            >
              Cancel
            </button>
          </ButtonGroup>
        </AddCardForm>
      ) : (
        <AddCardButton onClick={() => setIsAddingCard(true)}>
          + Add a card
        </AddCardButton>
      )}
    </ListContainer>
  );
};

export default List;
