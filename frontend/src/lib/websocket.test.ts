import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../api/client", () => ({
  getToken: () => "unit-test-jwt",
}));

describe("wsUrl", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      location: { protocol: "http:", host: "localhost:5173" },
    });
  });

  it("builds room WebSocket URL with encoded path and JWT query param", async () => {
    const { wsUrl } = await import("./websocket");
    const url = wsUrl("lab room/1");
    expect(url).toBe(
      "ws://localhost:5173/ws/lab%20room%2F1?token=unit-test-jwt",
    );
  });
});
