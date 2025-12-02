from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
import asyncio

app = FastAPI()

# Allow all origins (adjust if needed for production)
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# === WebSocket Connection Manager ===
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, role: str):
        await websocket.accept()
        if role not in self.active_connections:
            self.active_connections[role] = []
        self.active_connections[role].append(websocket)
        print(f"🔗 WebSocket connected: {role} - {len(self.active_connections[role])} active connections")

        # Send welcome status
        await websocket.send_json({"status": "connected", "role": role})

    def disconnect(self, websocket: WebSocket, role: str):
        if role in self.active_connections and websocket in self.active_connections[role]:
            self.active_connections[role].remove(websocket)
            print(f"❌ WebSocket disconnected: {role} - {len(self.active_connections[role])} active connections")

    async def broadcast(self, message: dict, target_role: str = None):
        disconnected = []

        # Target specific role or all roles
        roles = [target_role] if target_role else self.active_connections.keys()

        for role in roles:
            for websocket in self.active_connections.get(role, []):
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    print(f"⚠️ Error sending to {role}: {e}")
                    disconnected.append((websocket, role))

        # Remove disconnected websockets
        for websocket, role in disconnected:
            self.disconnect(websocket, role)

        print(f"📢 Broadcasted: {message} to role: {target_role if target_role else 'ALL'}")


# === Instantiate Manager ===
manager = ConnectionManager()


# === WebSocket Endpoint ===
@app.websocket("/ws/{role}")
async def websocket_endpoint(websocket: WebSocket, role: str):
    await manager.connect(websocket, role)
    try:
        while True:
            await asyncio.sleep(1)  # Keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(websocket, role)


# === POST Endpoint to Trigger Alert Broadcast ===
@app.post("/broadcast")
async def broadcast_alert(data: dict):
    """
    Expected POST JSON:
    {
        "message": "CO levels critical!",
        "type": "alert",
        "target_role": "worker"  # or "admin" or null for all
    }
    """
    target_role = data.get("target_role")  # Optional
    message = {
        "type": data.get("type", "alert"),
        "message": data.get("message", "No message provided"),
        "timestamp": data.get("timestamp", None)
    }
    await manager.broadcast(message, target_role)
    return {"status": "Broadcast sent", "sent_to": target_role or "all"}
