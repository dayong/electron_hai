// src/components/Kanban.jsx
import React, {useState} from "react";
import { Row, Col, Card, Typography, Badge } from "antd";
import { DndContext, closestCenter, useDroppable, useDraggable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import TaskCard from "./TaskCard";

const { Title } = Typography;

// const Kanban = ({ columns, tasks, onDragEnd }) => {
//   return (
//     <DndContext collisionDetection={closestCorners} onDragEnd={onDragEnd}>
//       <Row gutter={16}>
//         {columns.map((col) => (
//           <Col span={6} key={col.id} id={col.id}>
//             <Title level={4}>
//                 {col.title} <Badge count={tasks[col.id].length} />
//             </Title>
//             <SortableContext
//               items={tasks[col.id].map((t) => t.id)}
//               strategy={verticalListSortingStrategy}
//             >
//               {tasks[col.id].map((task) => (
//                 <TaskCard key={task.id} task={task} />
//               ))}
//             </SortableContext>
//           </Col>
//         ))}
//       </Row>
//     </DndContext>
//   );
// };

// 单个任务卡片
function TaskCard({ id, title }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
    const style = {
      transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
      marginBottom: 8,
      cursor: "grab"
    };
    return (
      <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        <Card size="small">{title}</Card>
      </div>
    );
  }
  
  // 列容器
  function Column({ id, title, tasks }) {
    const { setNodeRef } = useDroppable({ id });
    return (
      <Col span={6} key={id} id={id}>
        <Title level={4}>
          {title} <Badge count={tasks.length} />
        </Title>
        <div ref={setNodeRef} style={{ minHeight: 400, background: "#fafafa", padding: 8 }}>
          {tasks.map(task => (
            <TaskCard key={task.id} id={task.id} title={task.title} />
          ))}
        </div>
      </Col>
    );
  }

function Kanban({columns, tasks, onDragEnd}) {
    // const [columns, setColumns] = useState(null);
  
    const handleDragEnd = ({ active, over }) => {
        console.log('drag', active, over)
      if (!over) return;

      const fromCol = Object.keys(columns).find(key =>
        columns[key].some(task => task.id === active.id)
      );

      const toCol = over.id;

      if (fromCol !== toCol) {
        const task = columns[fromCol].find(t => t.id === active.id);
        setColumns({
          ...columns,
          [fromCol]: columns[fromCol].filter(t => t.id !== active.id),
          [toCol]: [...columns[toCol], task]
        });
      }

    };
  
    return (
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <Row gutter={16}>
            
        {columns.map((col) => (
          <Column id={col.id} title={col.title} tasks={tasks[col.id]} />
        ))}
        </Row>
      </DndContext>
    );
  }

export default Kanban;
