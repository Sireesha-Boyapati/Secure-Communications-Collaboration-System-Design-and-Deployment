import { Link, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAvatarColor, getInitials } from "../lib/avatars";
import type { Room } from "../types";

interface OutletContext {
  rooms: Room[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { rooms } = useOutletContext<OutletContext>();

  return (
    <div className="home-view">
      <div className="home-view-inner">
        <div className="home-pulse" aria-hidden>
          <span className="pulse-ring" />
          <span className="pulse-dot" />
        </div>
        <h1>Realtime encrypted chat</h1>
        <p className="home-lead">
          Hey {user?.display_name} — pick a room from the left or start a new conversation.
          Messages sync live over WebSocket.
        </p>

        {rooms.length === 0 ? (
          <div className="home-empty">
            <p>No conversations yet</p>
            <span>Use <strong>+ New room</strong> or <strong>Join with code</strong> in the sidebar.</span>
          </div>
        ) : (
          <div className="conversation-preview-list">
            <p className="preview-label">Recent conversations</p>
            {rooms.map((room) => (
              <Link key={room.id} to={`/room/${room.id}`} className="conversation-preview">
                <span
                  className="avatar"
                  style={{ background: getAvatarColor(room.name) }}
                >
                  {getInitials(room.name)}
                </span>
                <span className="preview-body">
                  <span className="preview-title">{room.name}</span>
                  <span className="preview-sub">
                    {room.member_count} online-ready · tap to open live chat
                  </span>
                </span>
                <span className="preview-live">Live</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
