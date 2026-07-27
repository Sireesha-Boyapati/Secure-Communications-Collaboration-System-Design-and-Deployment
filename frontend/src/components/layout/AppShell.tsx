import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { createRoom, joinRoom, listMyRooms } from "../../api/rooms";
import { ApiError } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { getAvatarColor, getInitials } from "../../lib/avatars";
import type { Room } from "../../types";

export default function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomName, setRoomName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [shareHistory, setShareHistory] = useState(false);

  const loadRooms = async () => {
    try {
      setRooms(await listMyRooms());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRooms();
  }, [location.pathname]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const room = await createRoom(roomName);
      setRoomName("");
      setShowCreate(false);
      await loadRooms();
      setSuccess(`Room created — invite: ${room.invite_code}`);
      navigate(`/room/${room.id}`, { state: { highlightInvite: room.invite_code } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create room");
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const room = await joinRoom(inviteCode, shareHistory);
      setInviteCode("");
      setShareHistory(false);
      setShowJoin(false);
      await loadRooms();
      const rotated = room.keys_rotated ? " Keys rotated — verify teammates." : "";
      setSuccess(`Joined ${room.name}.${rotated}`);
      navigate(`/room/${room.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid invite code");
    }
  };

  const activeRoomId = location.pathname.startsWith("/room/")
    ? location.pathname.split("/room/")[1]
    : null;

  return (
    <div className="teams-shell app-bg">
      <nav className="teams-rail" aria-label="App navigation">
        <div className="rail-logo" title="StudySafe">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <Link to="/dashboard" className={`rail-btn ${location.pathname === "/dashboard" ? "active" : ""}`} title="Home">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
          <span>Home</span>
        </Link>
        <div className="rail-btn active-static" title="Secure chat">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
          <span>Chat</span>
        </div>
      </nav>

      <aside className="teams-sidebar">
        <header className="teams-sidebar-header">
          <h1>StudySafe</h1>
          <span className="teams-subtitle">Encrypted teams</span>
        </header>

        <div className="teams-sidebar-actions">
          <button type="button" className="teams-primary-btn" onClick={() => { setShowCreate(!showCreate); setShowJoin(false); }}>
            + New channel
          </button>
          <button type="button" className="teams-secondary-btn" onClick={() => { setShowJoin(!showJoin); setShowCreate(false); }}>
            Join with code
          </button>
        </div>

        {showCreate && (
          <form className="teams-form" onSubmit={(e) => void handleCreate(e)}>
            <input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="Channel name" required />
            <button type="submit">Create</button>
          </form>
        )}

        {showJoin && (
          <form className="teams-form" onSubmit={(e) => void handleJoin(e)}>
            <input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Invite code e.g. K7M2XP"
              maxLength={8}
              required
            />
            <label className="teams-check">
              <input type="checkbox" checked={shareHistory} onChange={(e) => setShareHistory(e.target.checked)} />
              Share chat history (same encryption epoch)
            </label>
            <button type="submit">Join channel</button>
          </form>
        )}

        <div className="teams-channel-list">
          <p className="teams-section-label">Your channels</p>
          {loading ? (
            <p className="teams-muted">Loading…</p>
          ) : rooms.length === 0 ? (
            <p className="teams-muted">No channels yet.</p>
          ) : (
            <ul>
              {rooms.map((room) => (
                <li key={room.id}>
                  <Link to={`/room/${room.id}`} className={`teams-channel ${activeRoomId === room.id ? "active" : ""}`}>
                    <span className="channel-icon">#</span>
                    <span className="channel-info">
                      <span className="channel-name">{room.name}</span>
                      <span className="channel-meta">{room.member_count} members · epoch {room.crypto_epoch ?? 1}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <div className="teams-toast teams-toast-error">{error}</div>}
        {success && <div className="teams-toast teams-toast-ok">{success}</div>}

        <footer className="teams-user-bar">
          <span className="avatar avatar-sm" style={{ background: getAvatarColor(user?.display_name ?? "?") }}>
            {getInitials(user?.display_name ?? "?")}
          </span>
          <div className="teams-user-info">
            <strong>{user?.display_name}</strong>
            <span>{user?.email}</span>
          </div>
          <button type="button" className="teams-signout" onClick={logout}>Sign out</button>
        </footer>
      </aside>

      <main className="teams-main">
        <Outlet context={{ rooms, reloadRooms: loadRooms }} />
      </main>
    </div>
  );
}
