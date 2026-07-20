import { formatMessageTime, getAvatarColor, getInitials } from "../../lib/avatars";
import type { ChatMessage } from "../../types";

interface Props {
  message: ChatMessage;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: Props) {
  if (message.from === "system") {
    return (
      <div className="message-row system">
        <div className="system-pill">{message.text}</div>
      </div>
    );
  }

  const initials = getInitials(message.from);
  const color = getAvatarColor(message.from);

  return (
    <div className={`message-row ${isOwn ? "own" : "other"}`}>
      {!isOwn && (
        <div className="avatar" style={{ background: color }} aria-hidden>
          {initials}
        </div>
      )}
      <div className="message-content">
        {!isOwn && (
          <div className="message-meta">
            <span className="message-author">{message.from}</span>
            <span className="message-time">{formatMessageTime(message.timestamp)}</span>
            {message.encrypted && <span className="encrypted-tag" title="End-to-end encrypted">🔒</span>}
          </div>
        )}
        <div className={`message-bubble ${isOwn ? "own" : "other"}`}>
          <p>{message.text}</p>
          {isOwn && (
            <span className="message-time-inline">
              {formatMessageTime(message.timestamp)}
              {message.encrypted && " · 🔒"}
            </span>
          )}
        </div>
      </div>
      {isOwn && (
        <div className="avatar" style={{ background: color }} aria-hidden>
          {initials}
        </div>
      )}
    </div>
  );
}
