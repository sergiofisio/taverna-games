export const SITE_NAME = 'Taverna dos Jogos'
export const SITE_URL = 'https://tavernadosjogos.com.br'
export const SITE_DESCRIPTION = 'Pokédex, biblioteca de cartas de Hearthstone, desafios diários, Hearthdle, deckbuilder e duelos entre jogadores.'
export const SITE_DESCRIPTION_EN = 'Pokédex, Hearthstone card library, daily challenges, Hearthdle, deck builder and duels between players.'

export type World = 'pokemon' | 'hearthstone' | 'lol' | 'neutral'

export const HEARTHSTONE_MODE_PREFIX = 'hs-'
export const LOL_MODE_PREFIX = 'lol-'

export function getWorld(fullPath: string): World {
    const pathname = fullPath === '/en' ? '/' : fullPath.startsWith('/en/') ? fullPath.slice(3) : fullPath
    if (pathname.startsWith('/pokemon')) return 'pokemon'
    if (pathname.startsWith('/hearthstone')) return 'hearthstone'
    if (pathname.startsWith('/lol')) return 'lol'
    const mode = pathname.match(/^\/desafios\/([^/]+)/)?.[1]
    if (mode) return mode.startsWith(HEARTHSTONE_MODE_PREFIX) ? 'hearthstone' : mode.startsWith(LOL_MODE_PREFIX) ? 'lol' : 'pokemon'
    return 'neutral'
}
