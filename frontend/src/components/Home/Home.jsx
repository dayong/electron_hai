// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { Select } from "antd";
import Kanban from "../Kanban/kanban";
import { fetchKanbanConfig, updateKanban, createKanbanWS } from "../../api/kanban";

const currentUser = { id: "user123", name: "张三" };

const Home = () => {
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState({});
  const [viewMode, setViewMode] = useState("all"); // all | mine

  useEffect(() => {
    // 初始加载
    fetchKanbanConfig().then(({ columns, tasks }) => {
        console.log(17, columns, tasks)
      setColumns(columns);
      setTasks(tasks);
    });

    // 建立 WebSocket
    const ws = createKanbanWS(({ columns, tasks }) => {
      setColumns(columns);
      setTasks(tasks);
    });

    return () => ws.close();
  }, []);

  const handleDragEnd = (event) => {
    // TODO: 实现拖拽逻辑
    // event.active.id, event.over.id
    console.log("drag end:", event);
    // updateKanban(columns, tasks);
  };

  // 过滤任务
  const filteredTasks = {};
  for (const colId in tasks) {
    filteredTasks[colId] =
      viewMode === "all"
        ? tasks[colId]
        : tasks[colId].filter((t) => t.owner === currentUser.id);
  }

  return (
    <div style={{ padding: 16 }}>
      <Select
        value={viewMode}
        onChange={setViewMode}
        style={{ marginBottom: 16 }}
        options={[
          { value: "all", label: "全部任务" },
          { value: "mine", label: "我的任务" },
        ]}
      />
      <Kanban columns_init={columns} tasks_init={tasks} />
    </div>
  );
};

export default Home;
