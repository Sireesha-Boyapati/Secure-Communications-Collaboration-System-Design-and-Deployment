"""Unit tests for WebSocket event type constants."""

from app.websocket import events


def test_websocket_event_constants():
    assert events.PRESENCE == "presence"
    assert events.TYPING == "typing"
    assert events.MESSAGE == "message"
    assert events.SYSTEM == "system"
    assert events.ERROR == "error"


def test_typing_constant_matches_client_protocol():
    """Client sends {"type": "typing", "is_typing": bool} — see events.TYPING."""
    assert events.TYPING == "typing"
