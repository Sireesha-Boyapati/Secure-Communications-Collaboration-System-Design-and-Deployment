interface Props {
  online: string[];
  currentUser: string;
}

export default function OnlineUsers({ online, currentUser }: Props) {
  const others = online.filter((u) => u !== currentUser);

  return (
    <div className="online-users">
      <span className="live-dot" aria-hidden />
      <strong>Live now ({online.length}):</strong>{" "}
      {online.length === 0 ? (
        <span className="muted">just you</span>
      ) : (
        online.map((user) => (
          <span key={user} className={`online-chip ${user === currentUser ? "you" : ""}`}>
            {user === currentUser ? `${user} (you)` : user}
          </span>
        ))
      )}
      {others.length > 0 && (
        <span className="muted realtime-note"> · realtime encrypted relay active</span>
      )}
    </div>
  );
}
