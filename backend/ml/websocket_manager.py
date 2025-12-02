from typing import Dict, List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, role: str):
        await websocket.accept()
        if role not in self.active_connections:
            self.active_connections[role] = []
        self.active_connections[role].append(websocket)
        print(f"🔗 New connection: {role} - {len(self.active_connections[role])} active")

    def disconnect(self, websocket: WebSocket, role: str):
        if role in self.active_connections and websocket in self.active_connections[role]:
            self.active_connections[role].remove(websocket)
            print(f"❌ Disconnected: {role} - {len(self.active_connections[role])} active")

    async def broadcast(self, message: dict, target_role: str = None):
        roles = [target_role] if target_role else self.active_connections.keys()
        disconnected = []

        for role in roles:
            for connection in self.active_connections.get(role, []):
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"⚠️ Error sending message: {e}")
                    disconnected.append((connection, role))

        for websocket, role in disconnected:
            self.disconnect(websocket, role)
