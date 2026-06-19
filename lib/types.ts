// Core domain model for FleetView.
//
// The system is organized around Agents (workers + a manager), Tasks that get
// dispatched to them, Runs that record each execution, Messages exchanged
// between agents, Files they learn from, and Analytics aggregated over time.

export type AgentRole =
  | "orchestrator" // the manager: supervises, routes, brokers hand-offs, runs some tasks itself
  | "proposal"
  | "estimating"
  | "email"
  | "smartsheet";

export type AgentStatus = "idle" | "working" | "collaborating" | "error" | "offline";

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  /** Short tagline shown on the card. */
  title: string;
  /** Longer human description of what this agent does. */
  description: string;
  /** The system prompt / operating instructions that define the agent's behavior. */
  instructions: string;
  /** Emoji or short glyph used in the UI. */
  avatar: string;
  /** Tailwind-friendly accent color (hex). */
  color: string;
  /** Whether the agent is activated and allowed to pick up work. */
  active: boolean;
  /** Live status, updated by the engine. */
  status: AgentStatus;
  /** Agent ids this agent commonly collaborates with. */
  collaborators: AgentRole[];
  /** Capability tags surfaced in the UI. */
  skills: string[];
  /** Model used for this agent. */
  model: string;
  createdAt: number;
  updatedAt: number;
  /** Free-form note the manager can attach (health, last issue, etc.). */
  managerNote?: string;
}

export type RunStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";

export type StepKind =
  | "plan"
  | "think"
  | "act"
  | "handoff" // delegated to / received from another agent
  | "tool"
  | "learn" // pulled knowledge from a file
  | "result"
  | "error";

export interface RunStep {
  id: string;
  kind: StepKind;
  /** Human label, e.g. "Drafting executive summary". */
  label: string;
  /** Optional detail / output text. */
  detail?: string;
  /** If this step is a hand-off, which agent it involves. */
  withAgent?: AgentRole;
  startedAt: number;
  endedAt?: number;
  /** Tokens attributed to this step, if any. */
  tokens?: number;
}

export interface Run {
  id: string;
  taskId: string;
  /** Primary agent that owns the run. */
  agentId: string;
  agentRole: AgentRole;
  title: string;
  status: RunStatus;
  steps: RunStep[];
  /** Agents that participated besides the owner. */
  collaborators: AgentRole[];
  /** Final output text. */
  output?: string;
  error?: string;
  startedAt: number;
  endedAt?: number;
  tokensUsed: number;
  /** Whether this run used the real model or the simulator. */
  mode: "live" | "simulated";
}

export interface Task {
  id: string;
  title: string;
  /** What the user asked for. */
  prompt: string;
  /** Which agent the user targeted, or "auto" to let the orchestrator decide. */
  requestedRole: AgentRole | "auto";
  createdAt: number;
  /** The run id produced for this task. */
  runId?: string;
  status: RunStatus;
}

export type MessageKind = "handoff" | "request" | "result" | "supervision" | "alert";

export interface AgentMessage {
  id: string;
  from: AgentRole;
  to: AgentRole;
  kind: MessageKind;
  text: string;
  runId?: string;
  createdAt: number;
}

export interface KnowledgeFile {
  id: string;
  name: string;
  /** Mime-ish type label. */
  kind: string;
  /** The text content the agents learn from. */
  content: string;
  /** Which agents can use this file ("*" = all). */
  scope: AgentRole[] | "all";
  size: number;
  createdAt: number;
  /** Number of times an agent referenced this file. */
  usedCount: number;
}

export interface AgentAnalytics {
  role: AgentRole;
  runs: number;
  succeeded: number;
  failed: number;
  tokens: number;
  avgDurationMs: number;
  handoffs: number;
  filesLearned: number;
}

export interface SystemEvent {
  id: string;
  at: number;
  level: "info" | "success" | "warn" | "error";
  source: AgentRole | "system";
  text: string;
}

/** The full snapshot the client polls. */
export interface FleetState {
  agents: Agent[];
  runs: Run[];
  tasks: Task[];
  messages: AgentMessage[];
  files: KnowledgeFile[];
  events: SystemEvent[];
  analytics: {
    perAgent: AgentAnalytics[];
    totals: {
      runs: number;
      succeeded: number;
      failed: number;
      tokens: number;
      activeAgents: number;
      handoffs: number;
      filesLearned: number;
    };
    /** Runs bucketed by hour for the activity sparkline. */
    timeline: { t: number; runs: number; tokens: number }[];
  };
  mode: "live" | "simulated";
  serverTime: number;
}
