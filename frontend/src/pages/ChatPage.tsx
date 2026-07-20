import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ChatRoom from "../components/chat/ChatRoom";
import { getRoom } from "../api/rooms";
import { useAuth } from "../context/AuthContext";
import type { Room } from "../types";

export default function ChatPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    if (!roomId) return;
    void getRoom(roomId).then(setRoom).catch(() => setRoom(null));
  }, [roomId]);

  if (!roomId || !user) return null;

  return (
    <ChatRoom
      roomId={roomId}
      roomName={room?.name ?? "Loading…"}
      inviteCode={room?.invite_code}
      memberCount={room?.member_count}
      username={user.display_name}
    />
  );
}
