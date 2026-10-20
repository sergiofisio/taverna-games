'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import {
    ITEM_NAMES_PT,
    MESSAGES,
    STAT_NAMES,
    TYPE_NAMES,
    prettify,
    type Language,
    type MessageKey,
} from "../i18n/translations";
import { localePath } from "../lib/localePath";

const COOKIE = 'lang'
const YEAR = 60 * 60 * 24 * 365
const writeCookie = (language: Language) => {
    document.cookie = `${COOKIE}=${language}; path=/; max-age=${YEAR}; samesite=lax`
}

interface LanguageContextValue {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: MessageKey, params?: Record<string, string | number>) => string;
    typeName: (type: string) => string;
    statName: (stat: string) => string;
    itemName: (item: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ language, children }: { language: Language; children: ReactNode }) {
    useEffect(() => {
        if (language === 'en') writeCookie('en')
    }, [language])

    const setLanguage = useCallback((next: Language) => {
        writeCookie(next)
        const { origin, pathname, search, hash } = window.location
        window.location.assign(new URL(`${localePath(pathname, next)}${search}${hash}`, origin).toString())
    }, [])

    const value = useMemo<LanguageContextValue>(() => ({
        language,
        setLanguage,
        t: (key, params = {}) =>
            MESSAGES[language][key].replace(/\{(\w+)\}/g, (match, name) => String(params[name] ?? match)),
        typeName: (type) => TYPE_NAMES[language][type] ?? prettify(type),
        statName: (stat) => STAT_NAMES[language][stat] ?? prettify(stat),
        itemName: (item) => (language === 'pt' ? ITEM_NAMES_PT[item] : undefined) ?? prettify(item),
    }), [language, setLanguage])

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (!context) throw new Error('useLanguage precisa estar dentro de <LanguageProvider>')
    return context
}
