// src/components/TaskCard.jsx
import React from "react";
import { Card } from "antd";

const TaskCard = ({ task }) => {
  return (
    <Card
      size="small"
      style={{ marginBottom: 8 }}
      title={task.title}
    >
      <p>负责人: {task.owner}</p>
    </Card>
  );
};

export default TaskCard;
