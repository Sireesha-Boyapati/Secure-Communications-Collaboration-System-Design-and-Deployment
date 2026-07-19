interface Props {
  typingUsers: string[];
}

export default function TypingIndicator({ typingUsers }: Props) {
  if (!typingUsers.length) return null;

  const label =
    typingUsers.length === 1
      ? `${typingUsers[0]} is typing…`
      : `${typingUsers.join(", ")} are typing…`;

  return (
    <div className="typing-indicator" aria-live="polite">
      <span className="typing-dots">
        <span />
        <span />
        <span />
      </span>
      {label}
    </div>
  );
}
