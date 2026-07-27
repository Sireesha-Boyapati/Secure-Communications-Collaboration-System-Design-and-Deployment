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
          <div className="chat-empty home-empty">
            <p>No channels yet</p>
            <span>Create a channel or join with an invite code from the sidebar.</span>
          </div>
        ) : (
          <section className="home-recent">
            <h2 className="home-recent-title">Recent channels</h2>
            <ul className="home-recent-list">
              {rooms.map((room) => (
                <li key={room.id}>
                  <Link to={`/room/${room.id}`} className="home-recent-item">
                    <span className="avatar" style={{ background: getAvatarColor(room.name) }}>
                      {getInitials(room.name)}
                    </span>
                    <div className="home-recent-text">
                      <span className="home-recent-name">#{room.name}</span>
                      <span className="home-recent-meta">
                        {room.member_count} members · epoch {room.crypto_epoch ?? 1}
                      </span>
                    </div>
                    <span className="home-recent-live">Live</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
