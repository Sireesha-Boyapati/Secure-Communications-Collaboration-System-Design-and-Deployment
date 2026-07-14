import { Link, useParams } from "react-router-dom";
import ChatRoom from "../components/chat/ChatRoom";
import { useAuth } from "../context/AuthContext";

export default function ChatPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();

  if (!roomId || !user) return null;

  return (
    <div className="chat-page">
      <nav className="chat-nav">
        <Link to="/dashboard">← Back to rooms</Link>
      </nav>
      <ChatRoom roomId={roomId} username={user.display_name} />
    </div>
  );
}
