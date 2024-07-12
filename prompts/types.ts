export interface PromptItem {
  message: string;
  invalidMessage?: string;
  dirForPrompts?: {
    current: string;
    target: string;
  };
  toggleOptions?: {
    active: string;
    inactive: string;
  };
}

export interface Prompts {
  projectName: PromptItem;
  shouldOverwrite: PromptItem;
  packageName: PromptItem;
  needsAxios: PromptItem;
  needsUtils: PromptItem;
  needsDevTools: PromptItem;
  errors: {
    operationCancelled: string;
  };
  defaultToggleOptions: {
    active: string;
    inactive: string;
  };
  infos: {
    scaffolding: string;
    done: string;
  };
}
