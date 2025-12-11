import { Agent, AgentInputItem, Runner, withTrace } from "@openai/agents";

const myAgent = new Agent({
  name: "My agent",
  instructions: "You are a helpful assistant.",
  model: "gpt-4.1",
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  }
});

type WorkflowInput = { input_as_text: string };


// Main code entrypoint
export const runWorkflow = async (workflow: WorkflowInput) => {
  return await withTrace("New agent", async () => {
    const conversationHistory: AgentInputItem[] = [
      { role: "user", content: [{ type: "input_text", text: workflow.input_as_text }] }
    ];
    const runner = new Runner({
      traceMetadata: {
        __trace_source__: "agent-builder",
        workflow_id: "wf_693a71b8bb788190a682e5f2dfc688900a7d57f62f9f7a16"
      }
    });
    const myAgentResultTemp = await runner.run(
      myAgent,
      [
        ...conversationHistory
      ]
    );
    conversationHistory.push(...myAgentResultTemp.newItems.map((item) => item.rawItem));

    if (!myAgentResultTemp.finalOutput) {
        throw new Error("Agent result is undefined");
    }

    const myAgentResult = {
      output_text: myAgentResultTemp.finalOutput
    };

    return myAgentResult;
  });
}
