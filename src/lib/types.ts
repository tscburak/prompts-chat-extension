export interface Prompt {
  act: string;
  prompt: string;
  contributor?: string;
}

export interface AIModel {
  id: string;
  name: string;
  icon: string;
  baseUrl: string;
  promptUrl: string;
  inputSelector: string;
}
