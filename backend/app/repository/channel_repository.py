from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import and_, or_, func, desc, asc, text
from typing import List, Optional, Tuple, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta, timezone
import secrets
import string

from app.models.channel import (
    Channel, ChannelMember, Message, MessageReaction, PinnedMessage, ChannelInvite,
    ChannelTypeEnum, ChannelRoleEnum, MessageTypeEnum, CreatorRoleEnum
)
from app.schemas import (
    ChannelCreate, ChannelUpdate, ChannelMemberCreate, ChannelMemberUpdate,
    MessageCreate, MessageUpdate, MessageReactionCreate, ChannelInviteCreate,
    ChannelSearchParams, MessageQueryParams
)

class ChannelRepository:
    def __init__(self, db: Session):
        self.db = db
        
    # Channel Operations
    def create_channel(self, channel_data: ChannelCreate, creator_id: UUID, creator_role: CreatorRoleEnum) -> Channel:
        """Create a new channel"""
        db_channel = Channel(
            name=channel_data.name,
            description=channel_data.description,
            channel_type=channel_data.channel_type,
            is_private=channel_data.is_private,
            max_members=channel_data.max_members,
            tags=channel_data.tags,
            created_by_id=creator_id,
            created_by_role=creator_role
        )
        self.db.add(db_channel)
        self.db.flush()  # Get the ID before adding members
        
        # Add creator as owner
        self.add_member(db_channel.id, creator_id, creator_role, ChannelRoleEnum.OWNER)
        
        self.db.commit()
        self.db.refresh(db_channel)
        return db_channel

    def get_channel(self, channel_id: UUID) -> Optional[Channel]:
        """Get channel by ID with members and messages"""
        return self.db.query(Channel).options(
            selectinload(Channel.members),
            selectinload(Channel.messages).selectinload(Message.reactions),
            selectinload(Channel.pinned_messages).selectinload(PinnedMessage.message)
        ).filter(Channel.id == channel_id).first()

    def get_channel_by_name(self, name: str) -> Optional[Channel]:
        """Get channel by name"""
        return self.db.query(Channel).filter(Channel.name == name).first()

    def update_channel(self, channel_id: UUID, channel_data: ChannelUpdate) -> Optional[Channel]:
        """Update channel"""
        db_channel = self.get_channel(channel_id)
        if not db_channel:
            return None

        update_data = channel_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_channel, field, value)
        
        self.db.commit()
        self.db.refresh(db_channel)
        return db_channel

    def delete_channel(self, channel_id: UUID) -> bool:
        """Delete channel"""
        db_channel = self.get_channel(channel_id)
        if not db_channel:
            return False

        self.db.delete(db_channel)
        self.db.commit()
        return True

    def search_channels(self, params: ChannelSearchParams, user_id: UUID) -> Tuple[List[Channel], int]:
        """Search channels with filters"""
        query = self.db.query(Channel)
        
        # Apply filters
        if params.query:
            query = query.filter(
                or_(
                    Channel.name.ilike(f"%{params.query}%"),
                    Channel.description.ilike(f"%{params.query}%"),
                    func.array_to_string(Channel.tags, ',').ilike(f"%{params.query}%")
                )
            )
        
        if params.channel_type:
            query = query.filter(Channel.channel_type == params.channel_type)
        
        if params.is_private is not None:
            query = query.filter(Channel.is_private == params.is_private)
        
        if params.tags:
            for tag in params.tags:
                query = query.filter(func.array_to_string(Channel.tags, ',').ilike(f"%{tag}%"))
        
        # Only show public channels or channels user is member of
        query = query.filter(
            or_(
                Channel.is_private == False,
                Channel.id.in_(
                    self.db.query(ChannelMember.channel_id).filter(
                        ChannelMember.member_id == user_id
                    )
                )
            )
        )
        
        # Order by creation date
        query = query.order_by(desc(Channel.created_at))
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (params.page - 1) * params.per_page
        channels = query.offset(offset).limit(params.per_page).all()
        
        return channels, total

    def get_user_channels(self, user_id: UUID, page: int = 1, per_page: int = 20) -> Tuple[List[Channel], int]:
        """Get channels user is member of"""
        query = self.db.query(Channel).join(ChannelMember).filter(
            and_(
                ChannelMember.member_id == user_id,
                ChannelMember.is_banned == False
            )
        ).order_by(desc(Channel.updated_at))
        
        total = query.count()
        offset = (page - 1) * per_page
        channels = query.offset(offset).limit(per_page).all()
        
        return channels, total

    def get_all_public_channels(self, page: int = 1, per_page: int = 20) -> List[Channel]:
        """Get all public channels (simplified)"""
        offset = (page - 1) * per_page
        
        query = self.db.query(Channel).filter(
            and_(
                Channel.is_private == False,
                Channel.is_archived == False
            )
        ).order_by(desc(Channel.created_at))
        
        channels = query.offset(offset).limit(per_page).all()
        return channels

    # Channel Member Operations
    def add_member(self, channel_id: UUID, member_id: UUID, member_role: CreatorRoleEnum, channel_role: ChannelRoleEnum = ChannelRoleEnum.MEMBER) -> Optional[ChannelMember]:
        """Add member to channel"""
        # Check if already a member
        existing = self.db.query(ChannelMember).filter(
            and_(
                ChannelMember.channel_id == channel_id,
                ChannelMember.member_id == member_id
            )
        ).first()
        
        if existing:
            return existing
        
        # Check channel capacity
        channel = self.get_channel(channel_id)
        if channel and channel.max_members:
            current_count = self.db.query(ChannelMember).filter(
                ChannelMember.channel_id == channel_id
            ).count()
            if current_count >= channel.max_members:
                return None
        
        db_member = ChannelMember(
            channel_id=channel_id,
            member_id=member_id,
            member_role=member_role,
            channel_role=channel_role
        )
        self.db.add(db_member)
        self.db.commit()
        self.db.refresh(db_member)
        return db_member

    def remove_member(self, channel_id: UUID, member_id: UUID) -> bool:
        """Remove member from channel"""
        db_member = self.db.query(ChannelMember).filter(
            and_(
                ChannelMember.channel_id == channel_id,
                ChannelMember.member_id == member_id
            )
        ).first()
        
        if not db_member:
            return False
        
        self.db.delete(db_member)
        self.db.commit()
        return True

    def update_member(self, channel_id: UUID, member_id: UUID, member_data: ChannelMemberUpdate) -> Optional[ChannelMember]:
        """Update channel member"""
        db_member = self.db.query(ChannelMember).filter(
            and_(
                ChannelMember.channel_id == channel_id,
                ChannelMember.member_id == member_id
            )
        ).first()
        
        if not db_member:
            return None
        
        update_data = member_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_member, field, value)
        
        self.db.commit()
        self.db.refresh(db_member)
        return db_member

    def get_channel_members(self, channel_id: UUID) -> List[ChannelMember]:
        """Get all channel members"""
        return self.db.query(ChannelMember).filter(
            ChannelMember.channel_id == channel_id
        ).order_by(asc(ChannelMember.joined_at)).all()

    def get_channel_member(self, channel_id: UUID, user_id: UUID) -> Optional[ChannelMember]:
        """Get specific channel member"""
        return self.db.query(ChannelMember).filter(
            and_(
                ChannelMember.channel_id == channel_id,
                ChannelMember.member_id == user_id
            )
        ).first()

    def is_member(self, channel_id: UUID, user_id: UUID) -> bool:
        """Check if user is member of channel"""
        member = self.db.query(ChannelMember).filter(
            and_(
                ChannelMember.channel_id == channel_id,
                ChannelMember.member_id == user_id,
                ChannelMember.is_banned == False
            )
        ).first()
        return member is not None

    def get_member_role(self, channel_id: UUID, user_id: UUID) -> Optional[ChannelRoleEnum]:
        """Get user's role in channel"""
        member = self.db.query(ChannelMember).filter(
            and_(
                ChannelMember.channel_id == channel_id,
                ChannelMember.member_id == user_id
            )
        ).first()
        return member.channel_role if member else None

    # Message Operations
    def create_message(self, message_data: MessageCreate, channel_id: UUID, sender_id: UUID, sender_role: CreatorRoleEnum) -> Optional[Message]:
        """Create a new message"""
        # Check if user is member of channel
        if not self.is_member(channel_id, sender_id):
            return None
        
        db_message = Message(
            content=message_data.content,
            message_type=message_data.message_type,
            reply_to_id=message_data.reply_to_id,
            channel_id=channel_id,
            sender_id=sender_id,
            sender_role=sender_role
        )
        self.db.add(db_message)
        self.db.commit()
        self.db.refresh(db_message)
        return db_message

    def get_messages(self, channel_id: UUID, params: MessageQueryParams) -> Tuple[List[Message], int]:
        """Get messages for channel with pagination"""
        query = self.db.query(Message).filter(Message.channel_id == channel_id)
        
        # Apply time filters
        if params.before:
            query = query.filter(Message.created_at < params.before)
        if params.after:
            query = query.filter(Message.created_at > params.after)
        
        # Order by creation date (newest first)
        query = query.order_by(desc(Message.created_at))
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (params.page - 1) * params.per_page
        messages = query.offset(offset).limit(params.per_page).all()
        
        return messages, total

    def get_message(self, message_id: UUID) -> Optional[Message]:
        """Get message by ID"""
        return self.db.query(Message).options(
            selectinload(Message.reactions),
            selectinload(Message.reply_to)
        ).filter(Message.id == message_id).first()

    def update_message(self, message_id: UUID, message_data: MessageUpdate, user_id: UUID) -> Optional[Message]:
        """Update message"""
        db_message = self.get_message(message_id)
        if not db_message or db_message.sender_id != user_id:
            return None
        
        update_data = message_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_message, field, value)
        
        db_message.is_edited = True
        db_message.edited_at = datetime.now(datetime.timezone.utc)
        
        self.db.commit()
        self.db.refresh(db_message)
        return db_message

    def delete_message(self, message_id: UUID, user_id: UUID) -> bool:
        """Delete message"""
        db_message = self.get_message(message_id)
        if not db_message or db_message.sender_id != user_id:
            return False
        
        self.db.delete(db_message)
        self.db.commit()
        return True

    # Message Reactions
    def add_reaction(self, message_id: UUID, user_id: UUID, user_role: CreatorRoleEnum, emoji: str) -> Optional[MessageReaction]:
        """Add reaction to message"""
        # Check if reaction already exists
        existing = self.db.query(MessageReaction).filter(
            and_(
                MessageReaction.message_id == message_id,
                MessageReaction.user_id == user_id,
                MessageReaction.emoji == emoji
            )
        ).first()
        
        if existing:
            return existing
        
        db_reaction = MessageReaction(
            message_id=message_id,
            user_id=user_id,
            user_role=user_role,
            emoji=emoji
        )
        self.db.add(db_reaction)
        self.db.commit()
        self.db.refresh(db_reaction)
        return db_reaction

    def remove_reaction(self, message_id: UUID, user_id: UUID, emoji: str) -> bool:
        """Remove reaction from message"""
        db_reaction = self.db.query(MessageReaction).filter(
            and_(
                MessageReaction.message_id == message_id,
                MessageReaction.user_id == user_id,
                MessageReaction.emoji == emoji
            )
        ).first()
        
        if not db_reaction:
            return False
        
        self.db.delete(db_reaction)
        self.db.commit()
        return True

    def get_message_reactions(self, message_id: UUID) -> List[MessageReaction]:
        """Get all reactions for a message"""
        return self.db.query(MessageReaction).filter(
            MessageReaction.message_id == message_id
        ).all()

    # Pinned Messages
    def pin_message(self, channel_id: UUID, message_id: UUID, pinned_by_id: UUID, pinned_by_role: CreatorRoleEnum) -> Optional[PinnedMessage]:
        """Pin a message"""
        # Check if already pinned
        existing = self.db.query(PinnedMessage).filter(
            and_(
                PinnedMessage.channel_id == channel_id,
                PinnedMessage.message_id == message_id
            )
        ).first()
        
        if existing:
            return existing
        
        db_pinned = PinnedMessage(
            channel_id=channel_id,
            message_id=message_id,
            pinned_by_id=pinned_by_id,
            pinned_by_role=pinned_by_role
        )
        self.db.add(db_pinned)
        self.db.commit()
        self.db.refresh(db_pinned)
        return db_pinned

    def unpin_message(self, channel_id: UUID, message_id: UUID) -> bool:
        """Unpin a message"""
        db_pinned = self.db.query(PinnedMessage).filter(
            and_(
                PinnedMessage.channel_id == channel_id,
                PinnedMessage.message_id == message_id
            )
        ).first()
        
        if not db_pinned:
            return False
        
        self.db.delete(db_pinned)
        self.db.commit()
        return True

    def get_pinned_messages(self, channel_id: UUID) -> List[PinnedMessage]:
        """Get all pinned messages for a channel"""
        return self.db.query(PinnedMessage).options(
            selectinload(PinnedMessage.message).selectinload(Message.reactions)
        ).filter(PinnedMessage.channel_id == channel_id).order_by(desc(PinnedMessage.pinned_at)).all()

    # Channel Invites
    def create_invite(self, invite_data: dict) -> ChannelInvite:
        """Create a new channel invite"""
        invite = ChannelInvite(**invite_data)
        self.db.add(invite)
        self.db.commit()
        self.db.refresh(invite)
        return invite

    def get_invite_by_id(self, invite_id: UUID) -> Optional[ChannelInvite]:
        """Get invite by ID"""
        return self.db.query(ChannelInvite).filter(ChannelInvite.id == invite_id).first()

    def get_channel_invites(self, channel_id: UUID, status: str = None) -> List[ChannelInvite]:
        """Get all invites for a channel"""
        query = self.db.query(ChannelInvite).filter(ChannelInvite.channel_id == channel_id)
        if status:
            query = query.filter(ChannelInvite.status == status)
        return query.all()

    def get_user_invites(self, user_id: UUID, status: str = None) -> List[ChannelInvite]:
        """Get all invites for a user"""
        query = self.db.query(ChannelInvite).filter(ChannelInvite.invited_user_id == user_id)
        if status:
            query = query.filter(ChannelInvite.status == status)
        return query.all()

    def update_invite_status(self, invite_id: UUID, status: str) -> bool:
        """Update invite status"""
        invite = self.db.query(ChannelInvite).filter(ChannelInvite.id == invite_id).first()
        if invite:
            invite.status = status
            invite.updated_at = datetime.now(timezone.utc)
            self.db.commit()
            return True
        return False

    def check_existing_invite(self, channel_id: UUID, user_id: UUID) -> Optional[ChannelInvite]:
        """Check if there's already a pending invite for this user to this channel"""
        return self.db.query(ChannelInvite).filter(
            ChannelInvite.channel_id == channel_id,
            ChannelInvite.invited_user_id == user_id,
            ChannelInvite.status == "pending"
        ).first()


    def get_channel_stats(self, channel_id: UUID) -> Dict[str, Any]:
        """Get channel statistics"""
        # Total messages
        total_messages = self.db.query(Message).filter(Message.channel_id == channel_id).count()
        
        # Total members
        total_members = self.db.query(ChannelMember).filter(ChannelMember.channel_id == channel_id).count()
        
        # Messages today
        today = datetime.now(datetime.timezone.utc).date()
        messages_today = self.db.query(Message).filter(
            and_(
                Message.channel_id == channel_id,
                func.date(Message.created_at) == today
            )
        ).count()
        
        # Messages this week
        week_ago = datetime.now(datetime.timezone.utc) - timedelta(days=7)
        messages_this_week = self.db.query(Message).filter(
            and_(
                Message.channel_id == channel_id,
                Message.created_at >= week_ago
            )
        ).count()
        
        return {
            "total_messages": total_messages,
            "total_members": total_members,
            "messages_today": messages_today,
            "messages_this_week": messages_this_week
        }

    def update_last_read(self, channel_id: UUID, user_id: UUID) -> bool:
        """Update user's last read timestamp for channel"""
        db_member = self.db.query(ChannelMember).filter(
            and_(
                ChannelMember.channel_id == channel_id,
                ChannelMember.member_id == user_id
            )
        ).first()
        
        if not db_member:
            return False
        
        db_member.last_read_at = datetime.now(timezone.utc)
        self.db.commit()
        return True