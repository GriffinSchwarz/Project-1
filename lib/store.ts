import fs from "node:fs";
import path from "node:path";
import type {
  Agent,
  AgentMessage,
  KnowledgeFile,
  Run,
  SystemEvent,
  Task,
} from "./types";
import { defaultAgents } from "./agents";

// A tiny file-backed store. Everything lives in a module-level singleton so the
// runtime engine can hold live state across requests within one server process.
// State is persisted to .data/store.json so restarts keep history. This avoids
// native deps (no SQLite build step) and is fully portable.

export interface StoreData {
  agents: Agent[];
  tasks: Task[];
  runs: Run[];
  messages: AgentMessage[];
  files: KnowledgeFile[];
  events: SystemEvent[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

function emptyData(): StoreData {
  return {
    agents: defaultAgents(),
    tasks: [],
    runs: [],
    messages: [],
    files: seedKnowledge(),
    events: [
      {
        id: "evt-boot",
        at: Date.now(),
        level: "info",
        source: "system",
        text: "FleetView initialized. Atlas is supervising the fleet.",
      },
    ],
  };
}

function seedKnowledge(): KnowledgeFile[] {
  const now = Date.now();
  const make = (
    id: string,
    name: string,
    kind: string,
    content: string,
  ): KnowledgeFile => ({
    id,
    name,
    kind,
    content,
    scope: "all",
    size: content.length,
    createdAt: now,
    usedCount: 0,
  });
  return [
    make(
      "kf-voice",
      "Firm Voice & Differentiators.md",
      "guidelines",
      [
        "# Firm voice",
        "Confident, collaborative, concrete. We lead with the client's outcome, not our resume.",
        "## Differentiators",
        "- Design-build delivery that compresses schedule by ~15%.",
        "- In-house estimating with historical cost database across 400+ projects.",
        "- Single point of accountability from preconstruction through closeout.",
      ].join("\n"),
    ),
    make(
      "kf-rates",
      "Rate Card 2026.csv",
      "rate-card",
      [
        "item,unit,unit_cost,notes",
        "Project Manager,hr,165,loaded",
        "Superintendent,hr,140,loaded",
        "Carpenter,hr,95,prevailing wage varies",
        "Concrete (3000psi),cy,185,placed",
        "Structural steel,ton,3200,erected",
        "Overhead,%,12,on cost",
        "Profit,%,8,on cost",
      ].join("\n"),
    ),
    make(
      "kf-past",
      "Past Performance — Riverside Civic Center.md",
      "past-project",
      [
        "# Riverside Civic Center",
        "42,000 SF civic building, design-build, $18.4M, delivered 3 weeks early.",
        "Key win themes: phased occupancy plan kept the city operational; value-engineering saved $1.2M.",
      ].join("\n"),
    ),
  ];
}

let data: StoreData | null = null;
let saveTimer: NodeJS.Timeout | null = null;

function load(): StoreData {
  if (data) return data;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      const parsed = JSON.parse(raw) as StoreData;
      // Make sure the default agents always exist (in case the roster changed).
      if (!parsed.agents || parsed.agents.length === 0) {
        parsed.agents = defaultAgents();
      }
      data = parsed;
      return data;
    }
  } catch {
    // fall through to a fresh store on any corruption
  }
  data = emptyData();
  persist();
  return data;
}

function persist() {
  if (!data) return;
  if (saveTimer) clearTimeout(saveTimer);
  // Debounce writes — the engine mutates state frequently while runs progress.
  saveTimer = setTimeout(() => {
    try {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(data), "utf8");
    } catch {
      // best-effort; in-memory state remains authoritative
    }
  }, 150);
}

export const store = {
  get(): StoreData {
    return load();
  },
  /** Mutate the store and persist. */
  update<T>(fn: (d: StoreData) => T): T {
    const d = load();
    const result = fn(d);
    persist();
    return result;
  },
  save() {
    persist();
  },
  reset() {
    data = emptyData();
    persist();
  },
};

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
