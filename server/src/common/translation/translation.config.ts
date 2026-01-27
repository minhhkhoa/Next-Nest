//- định nghĩa những field cần dịch cho từng module
export const translationConfig = {
  industry: ['name'],
  skill: ['name'],
  cateNews: ['name', 'summary'],
  news: ['title', 'summary'],
  company: ['description'],
  permission: ['name'],
  role: ['name', 'description'],
  Notification: ['title', 'content'],
  job: ['title', 'description'],
};

export type allModules = keyof typeof translationConfig;

export type TranslatedField = {
  vi: string;
  en: string;
};
