/**
 * The navigation demo's model, after hopper-native's HistoryNavigator (ADR-021, ADR-024, ADR-025): every focus is a
 * visit; Back / Forward walk a snapshot of distinct places, newest first, and arriving anywhere else ends the walk;
 * Toggle brings forward the most recent other app (on the place it was on); Toggle Tab goes to the most recent other
 * place.
 */
import { navPlaces, type NavMove } from "../content/facts";

export type NavPlace = (typeof navPlaces)[number];
export type PlaceId = NavPlace["id"];

export const place = (id: PlaceId): NavPlace => navPlaces.find((p) => p.id === id)!;

export type Outcome = { to: PlaceId; note: string } | { to: null; note: string };

export class Timeline {
  private visits: PlaceId[];
  private walk: { snap: PlaceId[]; i: number } | null = null;

  constructor(start: readonly PlaceId[] = navPlaces.map((p) => p.id)) {
    this.visits = [...start];
  }

  get here(): PlaceId {
    return this.visits[this.visits.length - 1];
  }

  /** Distinct places, newest first. */
  recent(): PlaceId[] {
    return [...new Set([...this.visits].reverse())];
  }

  /** What the trail shows: the walk's snapshot while walking, else the recent places; and which one you're on. */
  trail(): { ids: PlaceId[]; at: number } {
    if (this.walk) return { ids: this.walk.snap, at: this.walk.i };
    return { ids: this.recent(), at: 0 };
  }

  get walking() {
    return this.walk !== null;
  }

  move(m: NavMove): Outcome {
    switch (m) {
      case "back": {
        this.walk ??= { snap: this.recent(), i: 0 };
        if (this.walk.i + 1 >= this.walk.snap.length) return { to: null, note: "That’s as far back as it goes." };
        this.walk.i++;
        return this.arrive(this.walk.snap[this.walk.i]);
      }
      case "forward": {
        if (!this.walk || this.walk.i === 0) return { to: null, note: "Nothing to undo. Forward undoes a Back." };
        this.walk.i--;
        return this.arrive(this.walk.snap[this.walk.i]);
      }
      case "toggle": {
        this.walk = null;
        const app = place(this.here).app;
        const to = this.recent().find((id) => place(id).app !== app);
        return to ? this.arrive(to) : { to: null, note: "No other app to flip to." };
      }
      case "toggle-tab": {
        this.walk = null;
        const to = this.recent()[1];
        return to ? this.arrive(to) : { to: null, note: "No other place to flip to." };
      }
    }
  }

  private arrive(to: PlaceId): Outcome {
    this.visits.push(to);
    return { to, note: "" };
  }
}
