// src/api/kanban.js

const API_URL = "http://localhost:8000/api/kanban";
const WS_URL = "ws://localhost:8000/ws/kanban";

// 加载初始数据
export async function fetchKanbanConfig() {
//   const res = await fetch(`${API_URL}/init`);
//   return res.json();
// 。。。测试数据
    

    return {
        "columns": [
          { "id": "todo", "title": "待办" },
          { "id": "inprogress", "title": "进行中" },
          { "id": "done", "title": "已完成" },
          { "id": "done1", "title": "待入职" },
          { "id": "done2", "title": "淘汰" }
        ],
        "tasks": {
          "todo": [
            { "id": "t1", "title": "写接口文档", "owner": "user123" },
            { "id": "t2", "title": "搭建前端框架", "owner": "user456" }
          ],
          "inprogress": [
            { "id": "t3", "title": "数据库设计", "owner": "user123" }
          ],
          "done": [
            { "id": "t4", "title": "需求评审", "owner": "user789" }
          ],
          "done1": [
            { "id": "t5", "title": "需求评审2", "owner": "user789" }
          ],
          "done2": [
            { "id": "t6", "title": "需求评审3", "owner": "user789" }
          ]
        }
      }
      
}

// 更新数据
export async function updateKanban(columns, tasks) {
  await fetch(`${API_URL}/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ columns, tasks }),
  });
}

// 建立 WebSocket
export function createKanbanWS(onMessage) {
  const ws = new WebSocket(WS_URL);
  ws.onmessage = (event) => {
    const { type, payload } = JSON.parse(event.data);
    if (type === "UPDATE") {
      onMessage(payload);
    }
  };
  return ws;
}
