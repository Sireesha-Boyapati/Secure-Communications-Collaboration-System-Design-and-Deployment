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
      setSuccess(`Room created! Share invite code: ${room.invite_code}`);
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
      const room = await joinRoom(inviteCode);
      setInviteCode("");
      setShowJoin(false);
      await loadRooms();
      setSuccess(`Joined ${room.name}`);
      navigate(`/room/${room.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid invite code — not the room name");
    }
  };

  const activeRoomId = location.pathname.startsWith("/room/")
    ? location.pathname.split("/room/")[1]
    : null;

  return (
    <div className="app-shell realtime-bg">
      <aside className="sidebar glass-dark">
        <div className="sidebar-brand">
          <div className="brand-mark" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <strong>StudySafe</strong>
            <span>Encrypted teams</span>
          </div>
        </div>

        <div className="sidebar-actions">
          <button type="button" className="sidebar-btn" onClick={() => { setShowCreate(!showCreate); setShowJoin(false); }}>
            + New room
          </button>
          <button type="button" className="sidebar-btn sidebar-btn-ghost" onClick={() => { setShowJoin(!showJoin); setShowCreate(false); }}>
            Join with code
          </button>
        </div>

        {showCreate && (
          <form className="sidebar-form" onSubmit={(e) => void handleCreate(e)}>
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Room name (e.g. B9IS103 Team)"
              required
            />
            <button type="submit">Create</button>
          </form>
        )}

        {showJoin && (
          <form className="sidebar-form" onSubmit={(e) => void handleJoin(e)}>
            <input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g. K7M2XP (not room name)"
              maxLength={8}
              required
            />
            <button type="submit">Join</button>
          </form>
        )}

        <nav className="room-nav" aria-label="Your rooms">
          <p className="room-nav-label">Workspaces</p>
          {loading ? (
            <p className="sidebar-muted">Loading rooms…</p>
          ) : rooms.length === 0 ? (
            <p className="sidebar-muted">No rooms yet. Create or join one above.</p>
          ) : (
            <ul>
              {rooms.map((room) => (
                <li key={room.id}>
                  <Link
                    to={`/room/${room.id}`}
                    className={`room-link ${activeRoomId === room.id ? "active" : ""}`}
                  >
                    <span className="room-hash">#</span>
                    <span className="room-link-text">
                      <span className="room-link-name">{room.name}</span>
                      <span className="room-link-meta">
                        {room.member_count} members · code <strong>{room.invite_code}</strong>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </nav>

        <Link to="/dashboard" className={`sidebar-home ${location.pathname === "/dashboard" ? "active" : ""}`}>
          Overview
        </Link>

        {error && <div className="sidebar-error">{error}</div>}
        {success && <div className="sidebar-success">{success}</div>}

        <div className="sidebar-user">
          <div
            className="avatar avatar-sm"
            style={{ background: getAvatarColor(user?.display_name ?? "?") }}
          >
            {getInitials(user?.display_name ?? "?")}
          </div>
          <div className="sidebar-user-info">
            <strong>{user?.display_name}</strong>
            <span>{user?.email}</span>
          </div>
          <button type="button" className="sign-out-btn" onClick={logout} title="Sign out">
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-panel">
        <Outlet context={{ rooms, reloadRooms: loadRooms }} />
      </main>
    </div>
  );
}
