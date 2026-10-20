import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Language } from "../i18n/translations";
import {
    isBoosterSet, isExtraDeck, parseYgoData, parseYgoPool, parseYgoSets, parseYgoCardSlug, pickPair, slugifyYgo, ygoAttributeLabel, ygoBanLabel,
    ygoFrameLabel, ygoKindLabel, ygoLevelLabel, ygoName, ygoRaceLabel, ygoRarityLabel, ygoRarityRank,
    type YgoCard, type YgoData, type YgoPoolData, type YgoSet, type YgoSetsData,
} from "./ygo";
import { YGO_API, YGO_CACHE_DIR, limited } from "./ygoRemote";

function fileLoader<T>(file: string, parse: (raw: never) => T) {
    let promise: Promise<T> | null = null
    return () => {
        promise ??= readFile(path.join(process.cwd(), 'public', 'data', file), 'utf8')
            .then((content) => parse(JSON.parse(content) as never))
            .catch((error) => {
                promise = null
                throw error
            })
        return promise
    }
}

export const getYgoData: () => Promise<YgoData> = fileLoader('ygo.json', parseYgoData)
export const getYgoSets: () => Promise<YgoSetsData> = fileLoader('ygo-sets.json', parseYgoSets)
export const getYgoPool: () => Promise<YgoPoolData> = fileLoader('ygo-pool.json', parseYgoPool)

let imageIds: Promise<Set<number>> | null = null

export function isKnownYgoImage(id: number) {
    imageIds ??= getYgoData().then((data) => new Set(data.cards.flatMap((card) => [card.id, ...(card.alt ?? [])])))
    return imageIds.then((ids) => ids.has(id))
}

export type YgoText = [string | null, string]

const inflight = new Map<number, Promise<YgoText | null>>()

async function fetchDesc(id: number, language: 'pt' | 'en') {
    const response = await limited(() => fetch(`${YGO_API}/cardinfo.php?id=${id}${language === 'pt' ? '&language=pt' : ''}`, { cache: 'no-store' }))
    if (response.status === 400) return null
    if (!response.ok) throw new Error(`YGOPRODeck ${response.status}`)
    const body = await response.json() as { data?: { desc?: string }[] }
    return body.data?.[0]?.desc?.replace(/\r/g, '').trim() ?? null
}

export async function getYgoText(id: number): Promise<YgoText | null> {
    const pooled = (await getYgoPool()).byId.get(id)
    if (pooled) return pooled.tx
    const file = path.join(YGO_CACHE_DIR, 'text', `${id}.json`)
    try {
        return JSON.parse(await readFile(file, 'utf8')) as YgoText
    } catch {}
    const pending = inflight.get(id)
    if (pending) return pending
    const task = Promise.all([fetchDesc(id, 'pt'), fetchDesc(id, 'en')])
        .then(async ([pt, en]) => {
            if (!en) return null
            const text: YgoText = [pt, en]
            await mkdir(path.dirname(file), { recursive: true })
            await writeFile(file, JSON.stringify(text))
            return text
        })
        .catch((error) => {
            console.error(error)
            return null
        })
        .finally(() => inflight.delete(id))
    inflight.set(id, task)
    return task
}

export interface YgoPrinting {
    set: Pick<YgoSet, 'c' | 's' | 'n' | 'd'>
    rarities: string[]
}

export async function getYgoPrintings(id: number): Promise<YgoPrinting[]> {
    const { sets } = await getYgoSets()
    return sets
        .filter((set) => set.cards.some(([cardId]) => cardId === id))
        .map((set) => ({ set: { c: set.c, s: set.s, n: set.n, d: set.d }, rarities: set.cards.filter(([cardId]) => cardId === id).map(([, rarity]) => rarity).sort((a, b) => ygoRarityRank(a) - ygoRarityRank(b)) }))
}

export async function getYgoCardPage(slug: string) {
    const id = parseYgoCardSlug(slug)
    if (!id) return null
    const data = await getYgoData()
    const card = data.byId.get(id) ?? data.cards.find((entry) => entry.alt?.includes(id))
    if (!card) return null
    const [text, printings] = await Promise.all([getYgoText(card.id), getYgoPrintings(card.id)])
    const related = card.ar ? data.cards.filter((other) => other.ar === card.ar && other.id !== card.id).slice(0, 12) : []
    return { card, text, printings, related, rarities: (await getYgoSets()).rarities }
}

export interface YgoArchetype {
    name: string
    slug: string
    cards: YgoCard[]
}

let archetypes: Promise<YgoArchetype[]> | null = null

export function getYgoArchetypes() {
    archetypes ??= getYgoData().then((data) => {
        const map = new Map<string, YgoArchetype>()
        for (const card of data.cards) {
            if (!card.ar) continue
            const slug = slugifyYgo(card.ar)
            const entry = map.get(slug) ?? { name: card.ar, slug, cards: [] }
            entry.cards.push(card)
            map.set(slug, entry)
        }
        return [...map.values()].sort((a, b) => b.cards.length - a.cards.length || a.name.localeCompare(b.name))
    }).catch((error) => {
        archetypes = null
        throw error
    })
    return archetypes
}

export const INDEXED_ARCHETYPE_SIZE = 15

export async function getYgoArchetypePage(slug: string) {
    return (await getYgoArchetypes()).find((entry) => entry.slug === slug) ?? null
}

export async function getYgoBoosterSets() {
    return (await getYgoSets()).sets.filter(isBoosterSet)
}

export async function getYgoSetPage(slug: string) {
    const [sets, data] = await Promise.all([getYgoSets(), getYgoData()])
    const set = sets.bySlug.get(slug)
    if (!set) return null
    const rarityById = new Map<number, string[]>()
    for (const [id, rarity] of set.cards) rarityById.set(id, [...(rarityById.get(id) ?? []), rarity])
    const cards = [...rarityById.entries()].flatMap(([id, rarities]) => {
        const card = data.byId.get(id)
        return card ? [{ card, rarities: rarities.sort((a, b) => ygoRarityRank(a) - ygoRarityRank(b)) }] : []
    })
    return { set: { c: set.c, s: set.s, n: set.n, d: set.d, t: set.t }, cards, booster: isBoosterSet(set), rarities: sets.rarities }
}

export async function getYgoBanlist() {
    return (await getYgoData()).cards.filter((card) => card.b !== undefined || card.bo !== undefined)
}

const listOf = (items: string[], language: Language) =>
    items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} ${language === 'pt' ? 'e' : 'and'} ${items.at(-1)}`

const SUMMON: Record<string, [string, string]> = {
    fusion: ['Invocação-Fusão', 'Fusion Summon'], synchro: ['Invocação-Sincro', 'Synchro Summon'],
    xyz: ['Invocação-Xyz', 'Xyz Summon'], link: ['Invocação-Link', 'Link Summon'],
}

export function describeYgoCard(card: YgoCard, printings: YgoPrinting[], language: Language) {
    const pt = language === 'pt'
    const name = ygoName(card, language)
    const kind = ygoKindLabel(card, language)
    const paragraphs: string[] = []
    if (card.k === 'm') {
        const level = `${ygoLevelLabel(card, language)} ${card.l}`
        const stats = card.f === 'link'
            ? (pt ? `${card.atk} de ATK e ${card.lm?.length ?? card.l} setas Link (${(card.lm ?? []).join(', ')})` : `${card.atk} ATK and ${card.lm?.length ?? card.l} Link Arrows (${(card.lm ?? []).join(', ')})`)
            : (pt ? `${card.atk} de ATK e ${card.def} de DEF` : `${card.atk} ATK and ${card.def} DEF`)
        paragraphs.push(pt
            ? `${name} é um ${kind} de ${ygoAttributeLabel(card.a, language)} do tipo ${ygoRaceLabel(card.r, language)}, ${level}, com ${stats}.${card.p ? ` Como monstro Pêndulo, tem escala ${card.sc} e também pode ser ativado como Magia na Zona Pêndulo.` : ''}`
            : `${name} is a ${ygoAttributeLabel(card.a, language)} ${ygoRaceLabel(card.r, language)} ${kind}, ${level}, with ${stats}.${card.p ? ` As a Pendulum Monster, it has a scale of ${card.sc} and can also be activated as a Spell in the Pendulum Zone.` : ''}`)
        if (isExtraDeck(card)) {
            const summon = pickPair(SUMMON[card.f], language)
            paragraphs.push(pt ? `Fica no Deck Adicional e entra em campo por ${summon}.` : `It lives in the Extra Deck and enters the field by ${summon}.`)
        }
    } else {
        paragraphs.push(pt
            ? `${name} é um card de ${kind}.${card.r === 'Quick-Play' ? ' Magias Rápidas podem ser ativadas no turno do oponente se forem baixadas antes.' : card.r === 'Counter' ? ' Armadilhas de Resposta têm Velocidade de Magia 3 e só podem ser respondidas por outras Armadilhas de Resposta.' : card.r === 'Field' ? ' Cada jogador só pode ter uma Magia de Campo ativa por vez.' : ''}`
            : `${name} is a ${kind} card.${card.r === 'Quick-Play' ? ' Quick-Play Spells can be activated on the opponent\'s turn if Set beforehand.' : card.r === 'Counter' ? ' Counter Traps are Spell Speed 3 and can only be answered by other Counter Traps.' : card.r === 'Field' ? ' Each player can only have one active Field Spell at a time.' : ''}`)
    }
    if (card.ar) paragraphs.push(pt ? `Faz parte do arquétipo ${card.ar}.` : `It belongs to the ${card.ar} archetype.`)
    paragraphs.push(card.b === undefined
        ? (pt ? 'Não tem restrição na lista de cartas proibidas e limitadas do TCG: o deck pode ter até 3 cópias.' : 'It is unrestricted on the TCG Forbidden & Limited List: a deck can run up to 3 copies.')
        : card.b === 0
            ? (pt ? 'Está proibida na lista do TCG e não pode ser usada em torneios.' : 'It is Forbidden on the TCG list and cannot be used in tournaments.')
            : (pt ? `Está ${ygoBanLabel(card.b, language).toLowerCase()} na lista do TCG: no máximo ${card.b} cópia(s) por deck.` : `It is ${ygoBanLabel(card.b, language)} on the TCG list: at most ${card.b} cop${card.b === 1 ? 'y' : 'ies'} per deck.`))
    if (card.ocg) paragraphs.push(pt ? 'Por enquanto, só foi lançada no OCG (Ásia).' : 'So far it has only been released in the OCG (Asia).')
    else if (printings.length) {
        const sorted = [...printings].sort((a, b) => a.set.d.localeCompare(b.set.d))
        paragraphs.push(pt
            ? `Saiu no TCG em ${card.y} e já foi impressa em ${printings.length} ${printings.length === 1 ? 'coleção' : 'coleções'}${printings.length > 1 ? `, da primeira (${sorted[0].set.n}) à mais recente (${sorted.at(-1)!.set.n})` : ` (${sorted[0].set.n})`}.`
            : `It came out in the TCG in ${card.y} and has been printed in ${printings.length} set${printings.length === 1 ? '' : 's'}${printings.length > 1 ? `, from the first (${sorted[0].set.n}) to the latest (${sorted.at(-1)!.set.n})` : ` (${sorted[0].set.n})`}.`)
    }
    return paragraphs
}

const top = <T,>(items: T[], limit = 2) => {
    const counts = new Map<T, number>()
    for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([item]) => item)
}

export function describeArchetype(archetype: YgoArchetype, language: Language) {
    const pt = language === 'pt'
    const { cards, name } = archetype
    const monsters = cards.filter((card) => card.k === 'm')
    const spells = cards.filter((card) => card.k === 's').length
    const traps = cards.filter((card) => card.k === 't').length
    const extra = monsters.filter(isExtraDeck)
    const years = cards.flatMap((card) => card.y ?? [])
    const restricted = cards.filter((card) => card.b !== undefined)
    const paragraphs = [pt
        ? `${name} é um arquétipo de Yu-Gi-Oh! com ${cards.length} cartas: ${monsters.length} monstros, ${spells} magias e ${traps} armadilhas.${years.length ? ` A primeira carta saiu em ${Math.min(...years)} e a mais recente em ${Math.max(...years)}.` : ''}`
        : `${name} is a Yu-Gi-Oh! archetype with ${cards.length} cards: ${monsters.length} monsters, ${spells} Spells and ${traps} Traps.${years.length ? ` Its first card came out in ${Math.min(...years)} and the latest in ${Math.max(...years)}.` : ''}`]
    if (monsters.length) {
        const attributes = top(monsters.flatMap((card) => card.a ?? [])).map((attribute) => ygoAttributeLabel(attribute, language))
        const races = top(monsters.flatMap((card) => card.r ?? [])).map((race) => ygoRaceLabel(race, language))
        const frames = top(extra.map((card) => card.f), 4).map((frame) => ygoFrameLabel(frame, language))
        paragraphs.push(pt
            ? `Os monstros são principalmente de ${listOf(attributes, 'pt')} e do tipo ${listOf(races, 'pt')}.${extra.length ? ` ${extra.length} deles ficam no Deck Adicional (${listOf(frames, 'pt')}).` : ' Nenhum monstro fica no Deck Adicional.'}`
            : `Its monsters are mostly ${listOf(attributes, 'en')} and ${listOf(races, 'en')}-type.${extra.length ? ` ${extra.length} of them go in the Extra Deck (${listOf(frames, 'en')}).` : ' None of its monsters go in the Extra Deck.'}`)
    }
    paragraphs.push(pt
        ? `A carta mais popular do arquétipo é ${cards[0].n[0]}.${restricted.length ? ` ${restricted.length} ${restricted.length === 1 ? 'carta está' : 'cartas estão'} na lista de proibidas e limitadas.` : ' Nenhuma carta do arquétipo está na lista de proibidas e limitadas.'}`
        : `The archetype's most popular card is ${cards[0].n[1]}.${restricted.length ? ` ${restricted.length} card${restricted.length === 1 ? ' is' : 's are'} on the Forbidden & Limited List.` : ' None of its cards are on the Forbidden & Limited List.'}`)
    return paragraphs
}

export function describeYgoSet(set: Pick<YgoSet, 'n' | 'd' | 't'>, cards: { card: YgoCard; rarities: string[] }[], rarities: Record<string, string>, language: Language) {
    const pt = language === 'pt'
    const date = new Date(`${set.d}T12:00:00`).toLocaleDateString(pt ? 'pt-BR' : 'en-US', { dateStyle: 'long' })
    const monsters = cards.filter(({ card }) => card.k === 'm').length
    const spells = cards.filter(({ card }) => card.k === 's').length
    const counts = new Map<string, number>()
    for (const { rarities: list } of cards) for (const rarity of list) counts.set(rarity, (counts.get(rarity) ?? 0) + 1)
    const breakdown = [...counts.entries()].sort((a, b) => ygoRarityRank(a[0]) - ygoRarityRank(b[0])).map(([rarity, n]) => `${ygoRarityLabel(rarity, language, rarities)} ${n}`)
    const archetypes = top(cards.flatMap(({ card }) => card.ar ?? []), 3)
    return [
        pt
            ? `${set.n} foi lançada no TCG em ${date} e tem ${set.t} cartas: ${monsters} monstros, ${spells} magias e ${cards.length - monsters - spells} armadilhas.`
            : `${set.n} was released in the TCG on ${date} and has ${set.t} cards: ${monsters} monsters, ${spells} Spells and ${cards.length - monsters - spells} Traps.`,
        ...(archetypes.length ? [pt ? `Os arquétipos com mais cartas na coleção são ${listOf(archetypes, 'pt')}.` : `The archetypes with the most cards in the set are ${listOf(archetypes, 'en')}.`] : []),
        `${pt ? 'Distribuição por raridade' : 'Rarity breakdown'}: ${breakdown.join(' · ')}.`,
    ]
}
