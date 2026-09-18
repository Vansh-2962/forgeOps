import { LLMCompletionOptions, LLMCompletionResult } from "./llm.types.js";

export interface LLMProvider {
  generate(options: LLMCompletionOptions): Promise<LLMCompletionResult>;
}
