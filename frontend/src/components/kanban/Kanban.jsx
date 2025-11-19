// src/components/Kanban.jsx
import React, {useState, useEffect} from "react";
import { Row, Col, Card, Typography, Badge, Spin } from "antd";
import { DndContext, closestCenter, useDroppable, useDraggable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import SortableItem from "./SortableItem";
// import TaskCard from "./TaskCard";

import "./Kanban.css";

const { Title } = Typography;

// 单个任务卡片
function TaskCard({ id, title, owner }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
    const style = {
      transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
      marginBottom: 8,
      cursor: "grab"
    };
    return (
      <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        <Card
        size="small"
        style={{ marginBottom: 8 }}
        title={title}
        >
        <p>负责人: {owner}</p>
        </Card>
      </div>
    );
  }
  
  // 列容器
  function Column({ id, title, tasks }) {
    const { isOver, setNodeRef } = useDroppable({ id });
    const style = {
        background: isOver ? 'blue' : 'red'
    };
    return (
      <Col span={4} ref={setNodeRef}>
        <Title level={4} >
          {title} <Badge count={tasks.length} />
        </Title>

        <SortableContext 
            items={tasks.map((task) => `${id}:${task.id}`)}
            strategy={verticalListSortingStrategy} style={style}
        >
            {tasks.map((task) => (
            <SortableItem key={`${id}:${task.id}`} id={`${id}:${task.id}`}>
                <TaskCard key={`${id}:${task.id}`} id={`${id}:${task.id}`} title={task.title} owner={task.owner} />
            </SortableItem>
            ))}
        </SortableContext>
        
      </Col>
    );
  }

  
  function Kanban({columns_init, tasks_init, onDragEnd}) {

    const [loading, setLoading] = useState(true);
    const [columns, setColumns] = useState(columns_init);
    const [tasks, setTasks] = useState(tasks_init);

    useEffect(() => {
        console.log(59, columns_init, tasks_init)
        setLoading(true);
        setTasks(tasks_init);
        setColumns(columns_init);
        setLoading(false);
    }, [columns_init, tasks_init]); // 当父组件传入的新数据变化时，自动同步
  
    
    if (loading) return <Spin fullscreen />;


    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;
    
        const [fromColumnId, taskId] = active.id.split(":");
        const [toColumnId] = over.id.split(":");
    
        if (fromColumnId === toColumnId) {
          // 同列内排序
          const oldIndex = tasks[fromColumnId].findIndex((t) => t.id === taskId);
          const newIndex = tasks[toColumnId].findIndex((t) => t.id === over.id.split(":")[1]);
          const newTasks = {
            ...tasks,
            [fromColumnId]: arrayMove(tasks[fromColumnId], oldIndex, newIndex),
          };
          setTasks(newTasks);
          onChange(newTasks);
        } else {
          // 跨列移动
          const movedTask = tasks[fromColumnId].find((t) => t.id === taskId);
          const newFrom = tasks[fromColumnId].filter((t) => t.id !== taskId);
          const newTo = [...tasks[toColumnId], movedTask];
          const newTasks = {
            ...tasks,
            [fromColumnId]: newFrom,
            [toColumnId]: newTo,
          };
          setTasks(newTasks);
          onChange(newTasks);
        }
      };

    return (
        <div className="kanban">
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {columns.map((col) => (
              <Column key={col.id} id={col.id} title={col.title} tasks={tasks[col.id]} />
            ))}
          </DndContext>
        </div>
      );
  }


export default Kanban

