from fastapi import WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, List, Set, Optional
from uuid import UUID
from datetime import datetime
import json
import asyncio
import logging

from app.database import get_db
from app.services.channel_service import ChannelService
from app.schemas import MessageEvent, TypingEvent, UserPresenceEvent, WebSocketEvent
from app.utils.auth import get_current_user_from_token

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Store active connections by user_id
        self.active_connections: Dict[UUID, WebSocket] = {}
        # Store user presence by channel
        self.channel_presence: Dict[UUID, Set[UUID]] = {}
        # Store typing indicators by channel
        self.typing_users: Dict[UUID, Dict[UUID, datetime]] = {}
        # Store user info for connections
        self.user_info: Dict[UUID, Dict] = {}

    async def connect(self, websocket: WebSocket, user_id: UUID, user_info: Dict):
        """Accept WebSocket connection and store user info"""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        self.user_info[user_id] = user_info
        logger.info(f"User {user_id} connected to WebSocket")

    def disconnect(self, user_id: UUID):
        """Remove user connection and clean up presence"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        
        if user_id in self.user_info:
            del self.user_info[user_id]
        
        # Remove from all channel presence
        for channel_id in list(self.channel_presence.keys()):
            self.channel_presence[channel_id].discard(user_id)
            if not self.channel_presence[channel_id]:
                del self.channel_presence[channel_id]
        
        # Remove from typing indicators
        for channel_id in list(self.typing_users.keys()):
            if user_id in self.typing_users[channel_id]:
                del self.typing_users[channel_id][user_id]
            if not self.typing_users[channel_id]:
                del self.typing_users[channel_id]
        
        logger.info(f"User {user_id} disconnected from WebSocket")

    async def send_personal_message(self, message: str, user_id: UUID):
        """Send message to specific user"""
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_text(message)
            except Exception as e:
                logger.error(f"Error sending personal message to {user_id}: {e}")
                self.disconnect(user_id)

    async def send_to_channel(self, message: str, channel_id: UUID, exclude_user: Optional[UUID] = None):
        """Send message to all users in a channel"""
        if channel_id not in self.channel_presence:
            return
        
        disconnected_users = []
        for user_id in self.channel_presence[channel_id]:
            if exclude_user and user_id == exclude_user:
                continue
            
            if user_id in self.active_connections:
                try:
                    await self.active_connections[user_id].send_text(message)
                except Exception as e:
                    logger.error(f"Error sending to user {user_id} in channel {channel_id}: {e}")
                    disconnected_users.append(user_id)
        
        # Clean up disconnected users
        for user_id in disconnected_users:
            self.disconnect(user_id)

    def join_channel(self, user_id: UUID, channel_id: UUID):
        """Add user to channel presence"""
        if channel_id not in self.channel_presence:
            self.channel_presence[channel_id] = set()
        self.channel_presence[channel_id].add(user_id)

    def leave_channel(self, user_id: UUID, channel_id: UUID):
        """Remove user from channel presence"""
        if channel_id in self.channel_presence:
            self.channel_presence[channel_id].discard(user_id)
            if not self.channel_presence[channel_id]:
                del self.channel_presence[channel_id]

    def set_typing(self, user_id: UUID, channel_id: UUID, is_typing: bool):
        """Set user typing status"""
        if channel_id not in self.typing_users:
            self.typing_users[channel_id] = {}
        
        if is_typing:
            self.typing_users[channel_id][user_id] = datetime.now()
        else:
            self.typing_users[channel_id].pop(user_id, None)

    def get_typing_users(self, channel_id: UUID) -> List[UUID]:
        """Get users currently typing in channel"""
        if channel_id not in self.typing_users:
            return []
        
        # Remove users who stopped typing more than 5 seconds ago
        now = datetime.now()
        active_typers = []
        for user_id, typing_time in list(self.typing_users[channel_id].items()):
            if (now - typing_time).seconds < 5:
                active_typers.append(user_id)
            else:
                del self.typing_users[channel_id][user_id]
        
        return active_typers

    def get_channel_users(self, channel_id: UUID) -> List[Dict]:
        """Get online users in channel"""
        if channel_id not in self.channel_presence:
            return []
        
        users = []
        for user_id in self.channel_presence[channel_id]:
            if user_id in self.user_info:
                users.append({
                    "user_id": user_id,
                    "name": self.user_info[user_id].get("name", "Unknown"),
                    "role": self.user_info[user_id].get("role", "unknown")
                })
        
        return users

# Global connection manager
manager = ConnectionManager()

async def websocket_endpoint(websocket: WebSocket, token: str, db: Session = Depends(get_db)):
    """WebSocket endpoint for real-time messaging"""
    try:
        # Authenticate user
        current_user = get_current_user_from_token(token)
        user_id = current_user["user"].id
        user_info = {
            "name": current_user["user"].name,
            "role": current_user["role"]
        }
        
        # Connect user
        await manager.connect(websocket, user_id, user_info)
        
        # Send initial presence update
        await websocket.send_text(json.dumps({
            "type": "connected",
            "data": {
                "user_id": str(user_id),
                "message": "Connected to real-time messaging"
            }
        }))
        
        try:
            while True:
                # Receive message from client
                data = await websocket.receive_text()
                message_data = json.loads(data)
                
                await handle_websocket_message(message_data, user_id, user_info, db)
                
        except WebSocketDisconnect:
            manager.disconnect(user_id)
            logger.info(f"User {user_id} disconnected")
            
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close()

async def handle_websocket_message(message_data: dict, user_id: UUID, user_info: dict, db: Session):
    """Handle incoming WebSocket messages"""
    message_type = message_data.get("type")
    channel_id = message_data.get("channel_id")
    
    if not channel_id:
        return
    
    try:
        channel_id = UUID(channel_id)
    except ValueError:
        return
    
    channel_service = ChannelService(db)
    
    # Check if user is member of channel
    if not channel_service.channel_repo.is_member(channel_id, user_id):
        return
    
    if message_type == "join_channel":
        await handle_join_channel(channel_id, user_id, user_info)
    
    elif message_type == "leave_channel":
        await handle_leave_channel(channel_id, user_id, user_info)
    
    elif message_type == "typing":
        await handle_typing(channel_id, user_id, user_info, message_data.get("is_typing", False))
    
    elif message_type == "stop_typing":
        await handle_typing(channel_id, user_id, user_info, False)
    
    elif message_type == "message":
        await handle_new_message(message_data, user_id, user_info, channel_service)
    
    elif message_type == "reaction":
        await handle_reaction(message_data, user_id, user_info, channel_service)

async def handle_join_channel(channel_id: UUID, user_id: UUID, user_info: dict):
    """Handle user joining a channel"""
    manager.join_channel(user_id, channel_id)
    
    # Notify other users in channel
    presence_event = UserPresenceEvent(
        user_id=user_id,
        user_name=user_info["name"],
        channel_id=channel_id,
        is_online=True,
        last_seen=datetime.now()
    )
    
    await manager.send_to_channel(
        json.dumps({
            "type": "user_joined",
            "data": presence_event.dict()
        }),
        channel_id,
        exclude_user=user_id
    )

async def handle_leave_channel(channel_id: UUID, user_id: UUID, user_info: dict):
    """Handle user leaving a channel"""
    manager.leave_channel(user_id, channel_id)
    
    # Notify other users in channel
    presence_event = UserPresenceEvent(
        user_id=user_id,
        user_name=user_info["name"],
        channel_id=channel_id,
        is_online=False,
        last_seen=datetime.now()
    )
    
    await manager.send_to_channel(
        json.dumps({
            "type": "user_left",
            "data": presence_event.dict()
        }),
        channel_id,
        exclude_user=user_id
    )

async def handle_typing(channel_id: UUID, user_id: UUID, user_info: dict, is_typing: bool):
    """Handle typing indicators"""
    manager.set_typing(user_id, channel_id, is_typing)
    
    typing_event = TypingEvent(
        user_id=user_id,
        user_name=user_info["name"],
        channel_id=channel_id,
        is_typing=is_typing
    )
    
    await manager.send_to_channel(
        json.dumps({
            "type": "typing",
            "data": typing_event.dict()
        }),
        channel_id,
        exclude_user=user_id
    )

async def handle_new_message(message_data: dict, user_id: UUID, user_info: dict, channel_service: ChannelService):
    """Handle new message creation"""
    try:
        # Create message using service
        message_create = {
            "content": message_data.get("content"),
            "message_type": message_data.get("message_type", "text"),
            "reply_to_id": message_data.get("reply_to_id")
        }
        
        channel_id = UUID(message_data["channel_id"])
        user_role = CreatorRoleEnum(user_info["role"])
        
        message = channel_service.create_message(
            message_create, channel_id, user_id, user_role
        )
        
        if message:
            # Broadcast message to all channel members
            message_event = MessageEvent(
                message=message,
                channel_id=channel_id
            )
            
            await manager.send_to_channel(
                json.dumps({
                    "type": "new_message",
                    "data": message_event.dict()
                }),
                channel_id
            )
            
    except Exception as e:
        logger.error(f"Error handling new message: {e}")

async def handle_reaction(message_data: dict, user_id: UUID, user_info: dict, channel_service: ChannelService):
    """Handle message reaction"""
    try:
        message_id = UUID(message_data.get("message_id"))
        emoji = message_data.get("emoji")
        action = message_data.get("action", "add")  # add or remove
        
        user_role = CreatorRoleEnum(user_info["role"])
        
        if action == "add":
            reaction = channel_service.add_reaction(message_id, user_id, user_role, {"emoji": emoji})
        else:
            success = channel_service.remove_reaction(message_id, user_id, emoji)
            reaction = {"emoji": emoji, "action": "removed"} if success else None
        
        if reaction:
            # Broadcast reaction to channel
            channel_id = message_data.get("channel_id")
            if channel_id:
                await manager.send_to_channel(
                    json.dumps({
                        "type": "reaction",
                        "data": {
                            "message_id": str(message_id),
                            "user_id": str(user_id),
                            "user_name": user_info["name"],
                            "emoji": emoji,
                            "action": action,
                            "reaction": reaction
                        }
                    }),
                    UUID(channel_id)
                )
                
    except Exception as e:
        logger.error(f"Error handling reaction: {e}")

# Background task to clean up inactive typing indicators
async def cleanup_typing_indicators():
    """Clean up old typing indicators"""
    while True:
        try:
            now = datetime.now()
            for channel_id in list(manager.typing_users.keys()):
                for user_id in list(manager.typing_users[channel_id].keys()):
                    typing_time = manager.typing_users[channel_id][user_id]
                    if (now - typing_time).seconds > 10:  # 10 seconds timeout
                        del manager.typing_users[channel_id][user_id]
                
                if not manager.typing_users[channel_id]:
                    del manager.typing_users[channel_id]
            
            await asyncio.sleep(5)  # Run every 5 seconds
            
        except Exception as e:
            logger.error(f"Error in typing cleanup: {e}")
            await asyncio.sleep(5)

# Utility functions for external use
async def broadcast_message_to_channel(channel_id: UUID, message_data: dict):
    """Broadcast message to all users in a channel (for use by other services)"""
    await manager.send_to_channel(
        json.dumps({
            "type": "system_message",
            "data": message_data
        }),
        channel_id
    )

async def notify_user(user_id: UUID, notification_data: dict):
    """Send notification to specific user"""
    await manager.send_personal_message(
        json.dumps({
            "type": "notification",
            "data": notification_data
        }),
        user_id
    )

def get_online_users_in_channel(channel_id: UUID) -> List[Dict]:
    """Get list of online users in a channel"""
    return manager.get_channel_users(channel_id)

def is_user_online(user_id: UUID) -> bool:
    """Check if user is online"""
    return user_id in manager.active_connections

