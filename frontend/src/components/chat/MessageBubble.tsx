import { formatMessageTime, getAvatarColor, getInitials } from "../../lib/avatars";
import type { ChatMessage } from "../../types";

function LockIcon() {
  return (
    <svg className="lock-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 8V7a3 3 0 016 0v3H9z" />
    </svg>
  );
}

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
            {message.encrypted && (
              <span title="End-to-end encrypted">
                <LockIcon />
              </span>
            )}
          </div>
        )}
        <div className={`message-bubble ${isOwn ? "own" : "other"}`}>
          <p>{message.text}</p>
          {isOwn && (
            <span className="message-time-inline">
              {formatMessageTime(message.timestamp)}
              {message.encrypted && (
                <>
                  {" · "}
                  <LockIcon />
                </>
              )}
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
