import type { Language } from "../i18n/translations";

export const EN_PREFIX = '/en'

export const stripLocale = (path: string) =>
    path === EN_PREFIX ? '/' : path.startsWith(`${EN_PREFIX}/`) ? path.slice(EN_PREFIX.length) : path

export const localePath = (path: string, language: Language) => {
    const base = stripLocale(path)
    return language === 'en' ? `${EN_PREFIX}${base === '/' ? '' : base}` : base
}
