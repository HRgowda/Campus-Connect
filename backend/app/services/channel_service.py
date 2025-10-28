from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any, Tuple
from uuid import UUID
from datetime import datetime, timedelta
import os
import shutil
from pathlib import Path

from app.repository.channel_repository import ChannelRepository
from app.schemas import (
    ChannelCreate, ChannelUpdate, ChannelResponse, ChannelListResponse,
    ChannelMemberCreate, ChannelMemberUpdate, ChannelMemberResponse,
    MessageCreate, MessageUpdate, MessageResponse, MessageListResponse,
    MessageReactionCreate, MessageReactionResponse,
    PinnedMessageResponse, ChannelInviteCreate, ChannelInviteResponse,
    ChannelInviteJoin, FileUploadResponse, ChannelSearchParams,
    MessageQueryParams, ChannelStats, ChannelNotification,
    ChannelTypeEnum, ChannelRoleEnum, MessageTypeEnum, CreatorRoleEnum
)
from app.models.channel import Channel, ChannelMember, Message, MessageReaction, PinnedMessage, ChannelInvite

class ChannelService:
    def __init__(self, db: Session):
        self.db = db
        self.channel_repo = ChannelRepository(db)
    
    # Channel Operations
    def create_channel(self, channel_data: ChannelCreate, creator_id: UUID, creator_role: CreatorRoleEnum) -> ChannelResponse:
        """Create a new channel"""
        # Check if channel name already exists
        existing = self.channel_repo.get_channel_by_name(channel_data.name)
        if existing:
            raise ValueError("Channel name already exists")
        
        channel = self.channel_repo.create_channel(channel_data, creator_id, creator_role)
        return self._format_channel_response(channel, creator_id)

    def get_channel(self, channel_id: UUID, user_id: UUID) -> Optional[ChannelResponse]:
        """Get channel by ID"""
        channel = self.channel_repo.get_channel(channel_id)
        if not channel:
            return None
        
        # Check if user has access to private channel
        if channel.is_private and not self.channel_repo.is_member(channel_id, user_id):
            return None
        
        return self._format_channel_response(channel, user_id)

    def update_channel(self, channel_id: UUID, channel_data: ChannelUpdate, user_id: UUID) -> Optional[ChannelResponse]:
        """Update channel"""
        # Check permissions
        user_role = self.channel_repo.get_member_role(channel_id, user_id)
        if not user_role or user_role not in [ChannelRoleEnum.ADMIN, ChannelRoleEnum.OWNER]:
            raise PermissionError("Insufficient permissions to update channel")
        
        channel = self.channel_repo.update_channel(channel_id, channel_data)
        if not channel:
            return None
        
        return self._format_channel_response(channel, user_id)

    def delete_channel(self, channel_id: UUID, user_id: UUID) -> bool:
        """Delete channel"""
        # Check if user is owner
        user_role = self.channel_repo.get_member_role(channel_id, user_id)
        if not user_role or user_role != ChannelRoleEnum.OWNER:
            raise PermissionError("Only channel owner can delete channel")
        
        return self.channel_repo.delete_channel(channel_id)

    def search_channels(self, params: ChannelSearchParams, user_id: UUID) -> ChannelListResponse:
        """Search channels"""
        channels, total = self.channel_repo.search_channels(params, user_id)
        
        formatted_channels = [self._format_channel_response(channel, user_id) for channel in channels]
        
        return ChannelListResponse(
            channels=formatted_channels,
            total=total,
            page=params.page,
            per_page=params.per_page,
            has_next=(params.page * params.per_page) < total,
            has_prev=params.page > 1
        )

    def get_user_channels(self, user_id: UUID, page: int = 1, per_page: int = 20) -> ChannelListResponse:
        """Get user's channels"""
        channels, total = self.channel_repo.get_user_channels(user_id, page, per_page)
        
        formatted_channels = [self._format_channel_response(channel, user_id) for channel in channels]
        
        return ChannelListResponse(
            channels=formatted_channels,
            total=total,
            page=page,
            per_page=per_page,
            has_next=(page * per_page) < total,
            has_prev=page > 1
        )

    def get_all_public_channels(self, user_id: UUID, page: int = 1, per_page: int = 20) -> ChannelListResponse:
        """Get all public channels (simplified)"""
        channels = self.channel_repo.get_all_public_channels(page, per_page)
        
        # Format channels with member status
        formatted_channels = []
        for channel in channels:
            is_member = self.channel_repo.is_member(channel.id, user_id)
            user_role = None
            if is_member:
                member = self.channel_repo.get_channel_member(channel.id, user_id)
                user_role = member.channel_role.value if member else None
            
            channel_response = self._format_channel_response(channel, user_id)
            channel_response.is_member = is_member
            channel_response.user_role = user_role
            formatted_channels.append(channel_response)
        
        return ChannelListResponse(
            channels=formatted_channels,
            total=len(formatted_channels),
            page=page,
            per_page=per_page,
            has_next=False,
            has_prev=False
        )

    # Channel Member Operations
    def add_member(self, channel_id: UUID, user_id: UUID, user_role: str) -> Optional[ChannelMemberResponse]:
        """Add member to channel (simplified - anyone can join public channels)"""
        # Check if user is already a member
        if self.channel_repo.is_member(channel_id, user_id):
            raise ValueError("User is already a member of this channel")
        
        # Check if channel exists and is not archived
        channel = self.channel_repo.get_channel(channel_id)
        if not channel:
            raise ValueError("Channel not found")
        if channel.is_archived:
            raise ValueError("Cannot join archived channel")
        
        member = self.channel_repo.add_member(channel_id, user_id, user_role)
        if not member:
            return None
        
        return self._format_member_response(member)

    def join_channel(self, channel_id: UUID, user_id: UUID, user_role: str) -> ChannelMemberResponse:
        """Join channel directly (simplified)"""
        return self.add_member(channel_id, user_id, user_role)

    def remove_member(self, channel_id: UUID, member_id: UUID, remover_id: UUID) -> bool:
        """Remove member from channel"""
        # Check permissions
        remover_role = self.channel_repo.get_member_role(channel_id, remover_id)
        member_role = self.channel_repo.get_member_role(channel_id, member_id)
        
        if not remover_role:
            raise PermissionError("You are not a member of this channel")
        
        # Can remove if: owner, admin removing non-admin, or removing self
        can_remove = (
            remover_role == ChannelRoleEnum.OWNER or
            (remover_role == ChannelRoleEnum.ADMIN and member_role not in [ChannelRoleEnum.ADMIN, ChannelRoleEnum.OWNER]) or
            remover_id == member_id
        )
        
        if not can_remove:
            raise PermissionError("Insufficient permissions to remove this member")
        
        return self.channel_repo.remove_member(channel_id, member_id)

    def update_member(self, channel_id: UUID, member_id: UUID, member_data: ChannelMemberUpdate, updater_id: UUID) -> Optional[ChannelMemberResponse]:
        """Update channel member"""
        # Check permissions
        updater_role = self.channel_repo.get_member_role(channel_id, updater_id)
        if not updater_role or updater_role not in [ChannelRoleEnum.ADMIN, ChannelRoleEnum.OWNER]:
            raise PermissionError("Insufficient permissions to update members")
        
        member = self.channel_repo.update_member(channel_id, member_id, member_data)
        if not member:
            return None
        
        return self._format_member_response(member)

    def get_channel_members(self, channel_id: UUID, user_id: UUID) -> List[ChannelMemberResponse]:
        """Get channel members"""
        # Check if user is member
        if not self.channel_repo.is_member(channel_id, user_id):
            raise PermissionError("You are not a member of this channel")
        
        members = self.channel_repo.get_channel_members(channel_id)
        return [self._format_member_response(member) for member in members]

    def join_channel(self, channel_id: UUID, user_id: UUID, user_role: CreatorRoleEnum) -> Optional[ChannelMemberResponse]:
        """Join a channel"""
        channel = self.channel_repo.get_channel(channel_id)
        if not channel:
            return None
        
        # Check if channel is private
        if channel.is_private:
            raise PermissionError("Cannot join private channel without invitation")
        
        member = self.channel_repo.add_member(channel_id, user_id, user_role)
        if not member:
            return None
        
        return self._format_member_response(member)

    def leave_channel(self, channel_id: UUID, user_id: UUID) -> bool:
        """Leave a channel"""
        # Check if user is owner
        user_role = self.channel_repo.get_member_role(channel_id, user_id)
        if user_role == ChannelRoleEnum.OWNER:
            raise PermissionError("Channel owner cannot leave channel. Transfer ownership or delete channel.")
        
        return self.channel_repo.remove_member(channel_id, user_id)

    # Message Operations
    def create_message(self, message_data: MessageCreate, channel_id: UUID, sender_id: UUID, sender_role: CreatorRoleEnum) -> Optional[MessageResponse]:
        """Create a new message"""
        # Check if user is member and not muted
        member = self.channel_repo.db.query(ChannelMember).filter(
            ChannelMember.channel_id == channel_id,
            ChannelMember.member_id == sender_id
        ).first()
        
        if not member or member.is_muted or member.is_banned:
            raise PermissionError("Cannot send messages to this channel")
        
        message = self.channel_repo.create_message(message_data, channel_id, sender_id, sender_role)
        if not message:
            return None
        
        return self._format_message_response(message)

    def get_messages(self, channel_id: UUID, params: MessageQueryParams, user_id: UUID) -> MessageListResponse:
        """Get channel messages"""
        # Check if user is member
        if not self.channel_repo.is_member(channel_id, user_id):
            raise PermissionError("You are not a member of this channel")
        
        messages, total = self.channel_repo.get_messages(channel_id, params)
        
        formatted_messages = [self._format_message_response(message) for message in messages]
        
        # Update last read timestamp
        self.channel_repo.update_last_read(channel_id, user_id)
        
        return MessageListResponse(
            messages=formatted_messages,
            total=total,
            page=params.page,
            per_page=params.per_page,
            has_next=(params.page * params.per_page) < total,
            has_prev=params.page > 1
        )

    def update_message(self, message_id: UUID, message_data: MessageUpdate, user_id: UUID) -> Optional[MessageResponse]:
        """Update message"""
        message = self.channel_repo.update_message(message_id, message_data, user_id)
        if not message:
            return None
        
        return self._format_message_response(message)

    def delete_message(self, message_id: UUID, user_id: UUID) -> bool:
        """Delete message"""
        return self.channel_repo.delete_message(message_id, user_id)

    # Message Reactions
    def add_reaction(self, message_id: UUID, user_id: UUID, user_role: CreatorRoleEnum, reaction_data: MessageReactionCreate) -> Optional[MessageReactionResponse]:
        """Add reaction to message"""
        reaction = self.channel_repo.add_reaction(message_id, user_id, user_role, reaction_data.emoji)
        if not reaction:
            return None
        
        return self._format_reaction_response(reaction)

    def remove_reaction(self, message_id: UUID, user_id: UUID, emoji: str) -> bool:
        """Remove reaction from message"""
        return self.channel_repo.remove_reaction(message_id, user_id, emoji)

    def get_message_reactions(self, message_id: UUID) -> List[MessageReactionResponse]:
        """Get message reactions"""
        reactions = self.channel_repo.get_message_reactions(message_id)
        return [self._format_reaction_response(reaction) for reaction in reactions]

    # Pinned Messages
    def pin_message(self, channel_id: UUID, message_id: UUID, user_id: UUID, user_role: CreatorRoleEnum) -> Optional[PinnedMessageResponse]:
        """Pin a message"""
        # Check permissions
        user_channel_role = self.channel_repo.get_member_role(channel_id, user_id)
        if not user_channel_role or user_channel_role not in [ChannelRoleEnum.ADMIN, ChannelRoleEnum.OWNER]:
            raise PermissionError("Insufficient permissions to pin messages")
        
        pinned = self.channel_repo.pin_message(channel_id, message_id, user_id, user_role)
        if not pinned:
            return None
        
        return self._format_pinned_message_response(pinned)

    def unpin_message(self, channel_id: UUID, message_id: UUID, user_id: UUID) -> bool:
        """Unpin a message"""
        # Check permissions
        user_channel_role = self.channel_repo.get_member_role(channel_id, user_id)
        if not user_channel_role or user_channel_role not in [ChannelRoleEnum.ADMIN, ChannelRoleEnum.OWNER]:
            raise PermissionError("Insufficient permissions to unpin messages")
        
        return self.channel_repo.unpin_message(channel_id, message_id)

    def get_pinned_messages(self, channel_id: UUID, user_id: UUID) -> List[PinnedMessageResponse]:
        """Get pinned messages"""
        # Check if user is member
        if not self.channel_repo.is_member(channel_id, user_id):
            raise PermissionError("You are not a member of this channel")
        
        pinned_messages = self.channel_repo.get_pinned_messages(channel_id)
        return [self._format_pinned_message_response(pinned) for pinned in pinned_messages]

    # Channel Invites
    def create_invite(self, channel_id: UUID, invited_user_id: UUID, invited_by_id: UUID, invite_type: str = "invitation", message: str = None) -> ChannelInviteResponse:
        """Create channel invite"""
        # Check if user is admin/owner
        member = self.channel_repo.get_channel_member(channel_id, invited_by_id)
        if not member or member.channel_role not in [ChannelRoleEnum.ADMIN, ChannelRoleEnum.OWNER]:
            raise HTTPException(status_code=403, detail="Only admins can create invites")
        
        # Check if user is already a member
        if self.channel_repo.is_member(channel_id, invited_user_id):
            raise HTTPException(status_code=400, detail="User is already a member of this channel")
        
        # Check if there's already a pending invite
        existing_invite = self.channel_repo.check_existing_invite(channel_id, invited_user_id)
        if existing_invite:
            raise HTTPException(status_code=400, detail="User already has a pending invite to this channel")
        
        invite_data = {
            "channel_id": channel_id,
            "invited_by_id": invited_by_id,
            "invited_user_id": invited_user_id,
            "status": "pending",
            "invite_type": invite_type,
            "message": message
        }
        
        invite = self.channel_repo.create_invite(invite_data)
        return ChannelInviteResponse.from_orm(invite)

    def create_join_request(self, channel_id: UUID, user_id: UUID, message: str = None) -> ChannelInviteResponse:
        """Create join request for a channel"""
        # Check if user is already a member
        if self.channel_repo.is_member(channel_id, user_id):
            raise HTTPException(status_code=400, detail="User is already a member of this channel")
        
        # Check if there's already a pending request
        existing_request = self.channel_repo.check_existing_invite(channel_id, user_id)
        if existing_request:
            raise HTTPException(status_code=400, detail="User already has a pending request for this channel")
        
        invite_data = {
            "channel_id": channel_id,
            "invited_by_id": user_id,
            "invited_user_id": user_id,
            "status": "pending",
            "invite_type": "join_request",
            "message": message
        }
        
        invite = self.channel_repo.create_invite(invite_data)
        return ChannelInviteResponse.from_orm(invite)

    def handle_invite_action(self, invite_id: UUID, action: str, user_id: UUID) -> bool:
        """Handle invite actions (approve, reject, accept, decline)"""
        invite = self.channel_repo.get_invite_by_id(invite_id)
        if not invite:
            raise HTTPException(status_code=404, detail="Invite not found")
        
        if action in ["approve", "reject"]:
            # Only admins can approve/reject
            member = self.channel_repo.get_channel_member(invite.channel_id, user_id)
            if not member or member.channel_role not in [ChannelRoleEnum.ADMIN, ChannelRoleEnum.OWNER]:
                raise HTTPException(status_code=403, detail="Only admins can approve/reject requests")
            
            if action == "approve":
                # Add user to channel
                self.channel_repo.add_member(invite.channel_id, invite.invited_user_id, "STUDENT")  # Default role
                self.channel_repo.update_invite_status(invite_id, "approved")
            else:
                self.channel_repo.update_invite_status(invite_id, "rejected")
        
        elif action in ["accept", "decline"]:
            # Only the invited user can accept/decline
            if invite.invited_user_id != user_id:
                raise HTTPException(status_code=403, detail="Only the invited user can accept/decline")
            
            if action == "accept":
                # Add user to channel
                self.channel_repo.add_member(invite.channel_id, invite.invited_user_id, "STUDENT")  # Default role
                self.channel_repo.update_invite_status(invite_id, "accepted")
            else:
                self.channel_repo.update_invite_status(invite_id, "declined")
        
        return True

    def get_user_invites(self, user_id: UUID) -> List[ChannelInviteResponse]:
        """Get all invites for a user"""
        invites = self.channel_repo.get_user_invites(user_id)
        return [ChannelInviteResponse.from_orm(invite) for invite in invites]

    def get_channel_invites(self, channel_id: UUID, user_id: UUID) -> List[ChannelInviteResponse]:
        """Get all invites for a channel (admin only)"""
        # Check if user is admin/owner
        member = self.channel_repo.get_channel_member(channel_id, user_id)
        if not member or member.channel_role not in [ChannelRoleEnum.ADMIN, ChannelRoleEnum.OWNER]:
            raise HTTPException(status_code=403, detail="Only admins can view channel invites")
        
        invites = self.channel_repo.get_channel_invites(channel_id)
        return [ChannelInviteResponse.from_orm(invite) for invite in invites]

    # File Upload
    def upload_file(self, file, channel_id: UUID, user_id: UUID) -> FileUploadResponse:
        """Upload file for message"""
        # Check if user is member
        if not self.channel_repo.is_member(channel_id, user_id):
            raise PermissionError("You are not a member of this channel")
        
        # Create upload directory
        upload_dir = Path("uploads/channels") / str(channel_id)
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        file_extension = file.filename.split(".")[-1] if "." in file.filename else ""
        filename = f"{user_id}_{int(datetime.now().timestamp())}.{file_extension}"
        file_path = upload_dir / filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Determine message type
        message_type = self._get_message_type(file.content_type, file_extension)
        
        return FileUploadResponse(
            file_url=f"/uploads/channels/{channel_id}/{filename}",
            file_name=file.filename,
            file_size=file.size,
            message_type=message_type
        )

    # Channel Statistics
    def get_channel_stats(self, channel_id: UUID, user_id: UUID) -> ChannelStats:
        """Get channel statistics"""
        # Check if user is member
        if not self.channel_repo.is_member(channel_id, user_id):
            raise PermissionError("You are not a member of this channel")
        
        stats = self.channel_repo.get_channel_stats(channel_id)
        return ChannelStats(**stats)

    # Helper Methods
    def _format_channel_response(self, channel: Channel, user_id: UUID) -> ChannelResponse:
        """Format channel for response"""
        member_count = len(channel.members) if channel.members else 0
        is_member = self.channel_repo.is_member(channel.id, user_id)
        user_role = self.channel_repo.get_member_role(channel.id, user_id) if is_member else None
        
        return ChannelResponse(
            id=channel.id,
            name=channel.name,
            description=channel.description,
            channel_type=channel.channel_type,
            is_private=channel.is_private,
            max_members=channel.max_members,
            tags=channel.tags,
            avatar_url=channel.avatar_url,
            is_archived=channel.is_archived,
            created_by_id=channel.created_by_id,
            created_by_role=channel.created_by_role,
            created_at=channel.created_at,
            updated_at=channel.updated_at,
            member_count=member_count,
            is_member=is_member,
            user_role=user_role
        )

    def _format_member_response(self, member: ChannelMember) -> ChannelMemberResponse:
        """Format channel member for response"""
        return ChannelMemberResponse(
            id=member.id,
            channel_id=member.channel_id,
            member_id=member.member_id,
            member_role=member.member_role,
            channel_role=member.channel_role,
            is_muted=member.is_muted,
            is_banned=member.is_banned,
            joined_at=member.joined_at,
            last_read_at=member.last_read_at
        )

    def _format_message_response(self, message: Message) -> MessageResponse:
        """Format message for response"""
        # Get reactions grouped by emoji
        reactions = {}
        for reaction in message.reactions:
            if reaction.emoji not in reactions:
                reactions[reaction.emoji] = []
            reactions[reaction.emoji].append({
                "user_id": reaction.user_id,
                "user_role": reaction.user_role,
                "created_at": reaction.created_at
            })
        
        # Convert reactions dict to list format expected by schema
        reactions_list = []
        for emoji, users in reactions.items():
            reactions_list.append({
                "emoji": emoji,
                "users": users,
                "count": len(users)
            })
        
        # Get sender name
        sender_name = self._get_user_name(message.sender_id, message.sender_role)
        
        return MessageResponse(
            id=message.id,
            content=message.content,
            message_type=message.message_type,
            file_url=message.file_url,
            file_name=message.file_name,
            file_size=message.file_size,
            is_edited=message.is_edited,
            edited_at=message.edited_at,
            reply_to_id=message.reply_to_id,
            channel_id=message.channel_id,
            sender_id=message.sender_id,
            sender_name=sender_name,
            sender_role=message.sender_role,
            created_at=message.created_at,
            updated_at=message.updated_at,
            reactions=reactions_list,
            reply_to=self._format_message_response(message.reply_to) if message.reply_to else None
        )

    def _format_reaction_response(self, reaction: MessageReaction) -> MessageReactionResponse:
        """Format reaction for response"""
        return MessageReactionResponse(
            id=reaction.id,
            message_id=reaction.message_id,
            user_id=reaction.user_id,
            user_role=reaction.user_role,
            emoji=reaction.emoji,
            created_at=reaction.created_at
        )

    def _get_user_name(self, user_id: UUID, user_role: str) -> Optional[str]:
        """Get user name by ID and role"""
        try:
            if user_role == "student":
                from app.models import Students
                user = self.db.query(Students).filter(Students.id == user_id).first()
                return user.name if user else None
            else:
                from app.models import Professors
                user = self.db.query(Professors).filter(Professors.id == user_id).first()
                return user.name if user else None
        except Exception:
            return None

    def _format_pinned_message_response(self, pinned: PinnedMessage) -> PinnedMessageResponse:
        """Format pinned message for response"""
        return PinnedMessageResponse(
            id=pinned.id,
            channel_id=pinned.channel_id,
            message_id=pinned.message_id,
            pinned_by_id=pinned.pinned_by_id,
            pinned_by_role=pinned.pinned_by_role,
            pinned_at=pinned.pinned_at,
            message=self._format_message_response(pinned.message)
        )

    def _format_invite_response(self, invite: ChannelInvite) -> ChannelInviteResponse:
        """Format invite for response"""
        return ChannelInviteResponse(
            id=invite.id,
            channel_id=invite.channel_id,
            invite_code=invite.invite_code,
            invited_by_id=invite.invited_by_id,
            invited_by_role=invite.invited_by_role,
            max_uses=invite.max_uses,
            uses_count=invite.uses_count,
            expires_at=invite.expires_at,
            is_active=invite.is_active,
            created_at=invite.created_at
        )

    def _get_message_type(self, content_type: str, file_extension: str) -> MessageTypeEnum:
        """Determine message type from file"""
        if content_type.startswith("image/"):
            return MessageTypeEnum.IMAGE
        elif content_type.startswith("video/"):
            return MessageTypeEnum.VIDEO
        elif content_type.startswith("audio/"):
            return MessageTypeEnum.AUDIO
        elif content_type in ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
            return MessageTypeEnum.DOCUMENT
        else:
            return MessageTypeEnum.FILE