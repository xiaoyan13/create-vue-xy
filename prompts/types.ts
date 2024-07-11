export interface LanguageItem {
  hint?: string;
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
  selectOptions?: {
    [key: string]: { title: string; desc?: string };
  };
}

export interface Language {
  projectName: LanguageItem;
  shouldOverwrite: LanguageItem;
  packageName: LanguageItem;
  needsTypeScript: LanguageItem;
  needsJsx: LanguageItem;
  needsRouter: LanguageItem;
  needsPinia: LanguageItem;
  needsVitest: LanguageItem;
  needsE2eTesting: LanguageItem;
  needsEslint: LanguageItem;
  needsPrettier: LanguageItem;
  needsDevTools: LanguageItem;
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
