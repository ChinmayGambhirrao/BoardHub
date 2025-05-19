import React from "react";
import { Draggable } from "react-beautiful-dnd";
import styled from "styled-components";

const CardContainer = styled.div`
  background-color: white;
  border-radius: 3px;
  box-shadow: 0 1px 0 rgba(9, 30, 66, 0.25);
  padding: 8px;
  margin-bottom: 8px;
  word-wrap: break-word;
  cursor: pointer;

  &:hover {
    background-color: #f4f5f7;
  }
`;

const CardTitle = styled.div`
  font-size: 14px;
`;

const Card = ({ card, index }) => {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <CardContainer
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          isDragging={snapshot.isDragging}
        >
          <CardTitle>{card.title}</CardTitle>
        </CardContainer>
      )}
    </Draggable>
  );
};

export default Card;
