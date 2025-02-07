import { AIModel } from "../types";

export async function usePromptInAI(prompt: string, model: AIModel) {
  if (!model) return;

  await chrome.runtime.sendMessage({
    action: 'usePrompt',
    data: {
      modelId: model.id,
      prompt
    }
  });
}
