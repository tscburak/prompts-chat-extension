/// <reference types="chrome"/>
import { AI_MODELS, } from '@/lib/constants';
import { AIModel } from '@/lib/types';

interface Message {
  action: 'usePrompt';
  data?: {
    modelId: string;
    prompt: string;
    inputSelector: AIModel['inputSelector'];
    modelUrl: string;
  };
}

function isOnModelDomain(currentUrl: string, baseUrl: string): boolean {
  try {
    const currentUrlObj = new URL(currentUrl);
    const baseUrlObj = new URL(baseUrl);
    return currentUrlObj.hostname === baseUrlObj.hostname;
  } catch (error) {
    console.error('Error validating URL:', error);
    return false;
  }
}

const getActiveTab = async () => {
  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
    lastFocusedWindow: true
  });
  return activeTab;
}

const constructPromptUrl = (promptUrl: string, prompt: string) => {
  return promptUrl.replace('{prompt}', encodeURIComponent(prompt));
}

const insertPrompt = async ({ prompt, inputSelector }: { prompt: string, inputSelector: string }) => {
  const activeTab = await getActiveTab();
  console.log('activeTab', activeTab);
  return chrome.tabs.sendMessage(activeTab.id!, {
    action: 'insertPrompt',
    data: { prompt, inputSelector }
  })
}

const waitForTabToLoad = async (requestedTabId: number) => {
  return new Promise(resolve => {
    chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
      if (info.status === 'complete' && tabId === requestedTabId) {
        resolve(tab);
      }
    });
  });
}

async function handleUsePrompt(message: Message) {
  if (!message.data) return false;

  const { modelId, prompt } = message.data;
  const model = AI_MODELS.find(m => m.id === modelId);
  if (!model) return false;

  try {
    const activeTab = await getActiveTab();
    if (!activeTab?.id) return false;

    const isOnDomain = activeTab?.url && isOnModelDomain(activeTab.url, model.baseUrl);

    if (isOnDomain) {
      const response = await insertPrompt({ prompt, inputSelector: model.inputSelector });
      if (response?.success) return true;
    }

    if (model.promptUrl) {
      const promptUrl = constructPromptUrl(model.promptUrl, prompt);
      const response = await chrome.tabs.create({ url: promptUrl }).then(tab => !!tab?.id);
      return response;
    }

    const tabCreated = await chrome.tabs.create({ url: model.baseUrl });
    if (!tabCreated?.id) return false;

    await waitForTabToLoad(tabCreated.id);
    const response = await insertPrompt({ prompt, inputSelector: model.inputSelector });
    return response?.success;
  } catch (error) {
    console.error('Error in handleUsePrompt:', error);
    return false;
  }
}

chrome.runtime.onMessage.addListener((message: Message, _, sendResponse) => {
  if (message.action === 'usePrompt') {
    handleUsePrompt(message)
      .then(success => sendResponse({ success }));
    return true;
  }
});

