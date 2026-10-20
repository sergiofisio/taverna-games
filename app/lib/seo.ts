import type { Metadata } from "next";
import type { Language } from "../i18n/translations";
import { localePath } from "./localePath";
import { getRequestLanguage } from "./requestLanguage";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./site";

export const SITE_KEYWORDS = [
  'Pokédex', 'Pokémon', 'Pokedle', 'quem é esse Pokémon', 'desafio diário Pokémon',
  'Hearthstone', 'Hearthdle', 'cartas de Hearthstone', 'deckbuilder Hearthstone', 'deck codes Hearthstone',
  'jogo de adivinhação', 'desafio diário', 'Taverna dos Jogos',
]

const OG_IMAGE = { url: '/opengraph-image.png', width: 1200, height: 630, alt: SITE_NAME }

type Localized = string | [pt: string, en: string]

interface PageSeo {
  title?: Localized;
  description: Localized;
  path: string;
  noIndex?: boolean;
  ownImage?: boolean;
}

const pick = (value: Localized, language: Language) => (typeof value === 'string' ? value : value[language === 'en' ? 1 : 0])

export const languageAlternates = (path: string) => ({
  'pt-BR': localePath(path, 'pt'),
  en: localePath(path, 'en'),
  'x-default': localePath(path, 'pt'),
})

export async function pageMetadata({ title, description, path, noIndex, ownImage }: PageSeo): Promise<Metadata> {
  const language = await getRequestLanguage()
  const localizedTitle = title && pick(title, language)
  const localizedDescription = pick(description, language)
  const url = localePath(path, language)
  const ogTitle = localizedTitle ? `${localizedTitle} · ${SITE_NAME}` : SITE_NAME
  return {
    ...(localizedTitle && { title: localizedTitle }),
    description: localizedDescription,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      title: ogTitle, description: localizedDescription, url, siteName: SITE_NAME, locale: language === 'en' ? 'en_US' : 'pt_BR', type: 'website',
      ...(!ownImage && { images: [OG_IMAGE] }),
    },
    twitter: { card: 'summary_large_image', title: ogTitle, description: localizedDescription },
    ...(noIndex && { robots: { index: false, follow: true } }),
  }
}

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString()

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: ['pt-BR', 'en'],
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: absoluteUrl('/brand/icon-1024.png'),
    },
  ],
}

export function breadcrumbJsonLd(items: [name: string, path: string][]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: absoluteUrl(path),
    })),
  }
}

export function gameJsonLd({ name, description, path }: { name: string; description: string; path: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url: absoluteUrl(path),
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web',
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
    isPartOf: { '@id': `${SITE_URL}/#website` },
  }
}

export function faqJsonLd(entries: [question: string, answer: string][]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }
}
