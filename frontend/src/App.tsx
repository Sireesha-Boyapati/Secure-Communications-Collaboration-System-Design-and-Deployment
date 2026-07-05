import { useState } from "react";
import ChatRoom from "./components/ChatRoom";
import "./App.css";

export default function App() {
  const [roomId, setRoomId] = useState("B9IS103");
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);

  if (joined && username.trim()) {
    return <ChatRoom roomId={roomId.trim()} username={username.trim()} onLeave={() => setJoined(false)} />;
  }

  return (
    <div className="app">
      <header className="hero">
        <h1>StudySafe</h1>
        <p>Encrypted real-time chat for student teams — B9IS103</p>
        <p className="muted">Messages encrypted in your browser. Server relays ciphertext only.</p>
      </header>

      <form
        className="join-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (username.trim() && roomId.trim()) setJoined(true);
        }}
      >
        <label>
          Display name
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Alice" required />
        </label>
        <label>
          Room code
          <input value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="B9IS103" required />
        </label>
        <button type="submit">Join encrypted room</button>
      </form>

      <section className="demo-note">
        <h3>Demo for lecturer</h3>
        <ol>
          <li>Start backend: <code>uvicorn app.main:app --reload</code></li>
          <li>Open this page in two browsers (one incognito)</li>
          <li>Join same room with different names</li>
          <li>Send a message — check <code>/docs</code> or network tab: ciphertext only</li>
        </ol>
      </section>
    </div>
  );
}
