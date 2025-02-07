import { AIModel } from "./types";

export const AI_MODELS = [
  {
    id: 'github-copilot',
    name: 'GitHub Copilot Chat',
    icon: '/github-copilot-icon.svg',
    baseUrl: 'https://github.com/copilot',
    promptUrl: 'https://github.com/copilot?prompt={prompt}',
    inputSelector: '#copilot-chat-textarea'
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: '/openai-icon.svg',
    baseUrl: 'https://chatgpt.com',
    promptUrl: 'https://chatgpt.com/?prompt={prompt}',
    inputSelector: '#prompt-textarea'
  },
  {
    id: 'claude',
    name: 'Claude',
    icon: '/claude-ai-icon.svg',
    baseUrl: 'https://claude.ai',
    promptUrl: 'https://claude.ai/new?q={prompt}',
    inputSelector: '[contenteditable] p'
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    icon: '/perplexity-ai-icon.svg',
    baseUrl: 'https://www.perplexity.ai',
    promptUrl: 'https://www.perplexity.ai/search?q={prompt}',
    inputSelector: 'textarea[placeholder]'
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: '/google-gemini-icon.svg',
    baseUrl: 'https://gemini.google.com',
    promptUrl: '',
    inputSelector: 'rich-textarea p'
  },
  // {
  // Not available in Türkiye, PR's welcome for the correct URL
  //   id: 'llama',
  //   name: 'Llama',
  //   icon: '/meta-icon.svg',
  //   baseUrl: 'https://www.llama2.ai',
  //   promptUrl: 'https://www.llama2.ai?prompt={prompt}',
  //   inputSelector: 'textarea'
  // },
  {
    id: 'mistral',
    name: 'Mistral',
    icon: '/mistral-ai-icon.svg',
    baseUrl: 'https://chat.mistral.ai',
    promptUrl: 'https://chat.mistral.ai/chat?q={prompt}',
    inputSelector: 'textarea'
  }
] as AIModel[];

export type AIModelId = typeof AI_MODELS[number]['id'];
