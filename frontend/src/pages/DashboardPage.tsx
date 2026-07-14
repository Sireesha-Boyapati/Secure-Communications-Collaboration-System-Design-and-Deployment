import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createRoom, joinRoom, listMyRooms } from "../api/rooms";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { Room } from "../types";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomName, setRoomName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRooms = async () => {
    try {
      const data = await listMyRooms();
      setRooms(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRooms();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const room = await createRoom(roomName);
      setRoomName("");
      await loadRooms();
      setRooms((prev) => [room, ...prev]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create room");
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await joinRoom(inviteCode);
      setInviteCode("");
      await loadRooms();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid invite code");
    }
  };

  return (
    <div className="dashboard">
      <header className="topbar">
        <div>
          <h1>StudySafe</h1>
          <p className="muted">Signed in as {user?.display_name} ({user?.email})</p>
        </div>
        <button type="button" className="btn-secondary" onClick={logout}>
          Sign out
        </button>
      </header>

      <div className="dashboard-grid">
        <section className="panel">
          <h2>Create room</h2>
          <form onSubmit={(e) => void handleCreate(e)}>
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="B9IS103 Team"
              required
            />
            <button type="submit">Create encrypted room</button>
          </form>
        </section>

        <section className="panel">
          <h2>Join room</h2>
          <form onSubmit={(e) => void handleJoin(e)}>
            <input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Invite code"
              required
            />
            <button type="submit">Join with invite</button>
          </form>
        </section>
      </div>

      {error && <div className="error-box">{error}</div>}

      <section className="panel rooms-list">
        <h2>Your rooms</h2>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : rooms.length === 0 ? (
          <p className="muted">No rooms yet — create one or join with an invite code.</p>
        ) : (
          <ul>
            {rooms.map((room) => (
              <li key={room.id}>
                <div>
                  <strong>{room.name}</strong>
                  <span className="muted"> · {room.member_count} members · invite: {room.invite_code}</span>
                </div>
                <Link to={`/room/${room.id}`} className="btn-primary">
                  Open chat
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
