import { describe, expect, it } from "vitest";
import { useHomeStore } from "../apps/web/stores/home";

describe("home recovery", () => {
  it("tracks the latest event id after applying an event", () => {
    useHomeStore.setState({
      lastEventId: undefined,
    });

    useHomeStore.getState().handleEvent({
      id: "evt_2",
      type: "calm_state_changed",
      data: { calmState: "working", summary: "CIAO is working quietly." },
    } as never);

    expect(useHomeStore.getState().lastEventId).toBe("evt_2");
  });
});
