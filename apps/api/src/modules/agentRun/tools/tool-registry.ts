import { AgentTool } from "./agent-tool.interface.js";

export class ToolRegistry {
  private readonly tools = new Map<string, AgentTool>();

  register(tool: AgentTool): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool alread registered ${tool.name}`);
    }
    this.tools.set(tool.name, tool);
  }

  get(name: string): AgentTool | undefined {
    return this.tools.get(name);
  }

  getAll(): readonly AgentTool[] {
    return [...this.tools.values()];
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }
}
