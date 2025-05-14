import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const DashboardContainer = styled.div`
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  margin-bottom: 24px;
  font-size: 20px;
  font-weight: bold;
`;

const BoardsSection = styled.div`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: bold;
`;

const BoardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
`;

const BoardCard = styled(Link)`
  height: 100px;
  background-color: ${(props) => props.background || "#0079bf"};
  border-radius: 3px;
  padding: 8px;
  color: white;
  font-weight: bold;
  display: flex;
  align-items: flex-start;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${(props) =>
      props.background ? props.background + "ee" : "#026aa7"};
  }
`;

const CreateBoardCard = styled.div`
  height: 100px;
  background-color: #f0f2f5;
  border-radius: 3px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #172b4d;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #dfe3e6;
  }
`;

const Dashboard = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch boards from API
    // For now, use mock data
    const mockBoards = [
      { id: "1", title: "Project Alpha", background: "#0079bf" },
      { id: "2", title: "Marketing Campaign", background: "#d29034" },
      { id: "3", title: "Website Redesign", background: "#519839" },
      { id: "4", title: "Mobile App", background: "#b04632" },
    ];

    setBoards(mockBoards);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardContainer>
      <PageTitle>Your Boards</PageTitle>

      <BoardsSection>
        <SectionTitle>Personal Boards</SectionTitle>
        <BoardsGrid>
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              to={`/board/${board.id}`}
              background={board.background}
            >
              {board.title}
            </BoardCard>
          ))}

          <CreateBoardCard>Create new board</CreateBoardCard>
        </BoardsGrid>
      </BoardsSection>
    </DashboardContainer>
  );
};

export default Dashboard;
