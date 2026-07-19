"""WebSocket event type constants."""

PRESENCE = "presence"
# Typing control schema (validated in app.main WebSocket handler):
# {"type": "typing", "is_typing": <bool>} — username comes from JWT, not client body.
TYPING = "typing"
MESSAGE = "message"
SYSTEM = "system"
ERROR = "error"
