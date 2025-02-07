import { marked } from "marked";

export interface Prompt {
  act: string;
  prompt: string;
  for_devs: boolean;
  contributor?: string;
}

/**
 * Parses a CSV string into an array of Prompt objects.
 * Handles multi-line content and special characters.
 *
 * @param csv - The CSV string to parse
 * @returns Array of parsed Prompt objects
 */
export const parseCSV = (csv: string): Prompt[] => {
  const lines = csv.replace(/\r\n/g, '\n').split('\n');
  if (!lines.length) return [];

  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

  return lines
    .slice(1)
    .map(line => {
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      const entry: Partial<Prompt> = {};

      headers.forEach((header, index) => {
        let value = values[index] || '';
        value = value.replace(/^"/, '').replace(/"$/, '').trim();

        switch (header) {
          case 'act':
            entry.act = value.replace(/`/g, '');
            break;
          case 'for_devs':
            entry.for_devs = value.toUpperCase() === 'TRUE';
            break;
          case 'prompt':
            entry.prompt = value;
            break;
        }
      });

      return entry;
    })
    .filter((entry): entry is Prompt =>
      Boolean(entry.act) &&
      Boolean(entry.prompt) &&
      typeof entry.for_devs === 'boolean'
    );
};

/**
 * Parses contributor information from the README markdown.
 * Extracts contributor names associated with each prompt title.
 *
 * @param text - The README markdown text
 * @returns Map of prompt titles to contributor names
 */
export const parseContributorsFromReadme = (text: string): Map<string, string> => {
  const contributorMap = new Map<string, string>();
  const tokens = marked.lexer(text);

  let currentTitle = '';
  let currentContributor = 'f';

  const normalizeText = (text: string) => text.replace(/\s+/g, " ").replace(/[\n\r]/g, "").trim();
  const contributorFormats = [
    /Contributed by: \[([^\]]+)\]/i,
    /Contributed by \[([^\]]+)\]/i,
    /Contributed by: @([^\s]+)/i,
    /Contributed by @([^\s]+)/i,
    /Contributed by: \[@([^\]]+)\]/i,
    /Contributed by \[@([^\]]+)\]/i,
  ];

  tokens.forEach((token) => {
    if (token.type === 'heading' && token.depth === 2 && token.text.startsWith('Act as')) {
      if (currentTitle && currentContributor) {
        contributorMap.set(normalizeText(currentTitle), currentContributor);
      }
      currentTitle = token.text;
      currentContributor = 'f';
    }

    if (currentTitle && token.type === 'paragraph') {
      for (const format of contributorFormats) {
        const match = token.text.match(format);
        if (match) {
          currentContributor = match[1].replace(/^@/, '');
          break;
        }
      }
    }
  });

  if (currentTitle && currentContributor) {
    contributorMap.set(normalizeText(currentTitle), currentContributor);
  }

  return contributorMap;
};

/**
 * Fetches and parses prompts from the awesome-chatgpt-prompts repository.
 * Combines CSV data with contributor information from the README.
 *
 * @returns Promise resolving to an array of Prompt objects with contributor information
 */
export const fetchPrompts = async (): Promise<Prompt[]> => {
  const [csvResponse, contributorMap] = await Promise.all([
    fetch('https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/prompts.csv'),
    fetch('https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/README.md')
      .then(res => res.text())
      .then(parseContributorsFromReadme)
  ]);

  const data = await csvResponse.text();
  const parsedPrompts = parseCSV(data);
  parsedPrompts.sort((a, b) => a.act.localeCompare(b.act));

  return parsedPrompts.map(prompt => {
    const normalizedPromptTitle = prompt.act.replace(/\s+/g, " ").replace(/[\n\r]/g, "").trim();
    const matchingTitle = Array.from(contributorMap.keys()).find(title => {
      const normalizedTitle = title.replace(/\s+/g, " ").replace(/[\n\r]/g, "").trim();
      return normalizedTitle.toLowerCase() === normalizedPromptTitle.toLowerCase() ||
        normalizedTitle.toLowerCase().includes(normalizedPromptTitle.toLowerCase()) ||
        normalizedPromptTitle.toLowerCase().includes(normalizedTitle.toLowerCase());
    });

    return {
      ...prompt,
      contributor: matchingTitle ? contributorMap.get(matchingTitle) : 'f'
    };
  });
};
