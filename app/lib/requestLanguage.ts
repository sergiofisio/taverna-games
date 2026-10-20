import { headers } from "next/headers";
import type { Language } from "../i18n/translations";

export async function getRequestLanguage(): Promise<Language> {
    return (await headers()).get('x-site-lang') === 'en' ? 'en' : 'pt'
}
