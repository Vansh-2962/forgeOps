import { AgentExecutionContext } from "@repo/types/agent";

export class AgentExecutorService {
    async execute(context:AgentExecutionContext){
        
        return {
            success:true,
            message:"Agent execution completed"
        }
    }
}