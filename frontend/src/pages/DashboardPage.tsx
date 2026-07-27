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
        <h1>Welcome, {user?.display_name}</h1>
        <p className="home-lead">
          Secure team chat with end-to-end encryption, key verification, and realtime WebSocket messaging —
          built for confidential collaboration.
        </p>

        <div className="home-stats">
          <div className="stat-card">
            <strong>{rooms.length}</strong>
            <span>Channels</span>
          </div>
          <div className="stat-card">
            <strong>E2E</strong>
            <span>Encrypted</span>
          </div>
          <div className="stat-card">
            <strong>Live</strong>
            <span>WebSocket</span>
          </div>
        </div>

        {rooms.length === 0 ? (
          <div className="chat-empty">
            <p>No channels yet</p>
            <span>Create a channel or join with an invite code from the sidebar.</span>
          </div>
        ) : (
          <div className="conversation-preview-list">
            <p className="teams-section-label" style={{ textAlign: "left" }}>Recent channels</p>
            {rooms.map((room) => (
              <Link key={room.id} to={`/room/${room.id}`} className="conversation-preview">
                <span className="avatar" style={{ background: getAvatarColor(room.name) }}>
                  {getInitials(room.name)}
                </span>
                <span className="preview-body">
                  <span className="preview-title">{room.name}</span>
                  <span className="preview-sub">
                    {room.member_count} members · epoch {room.crypto_epoch ?? 1}
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
