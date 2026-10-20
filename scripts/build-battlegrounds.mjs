import { writeFile } from 'node:fs/promises'

const API = 'https://api.hearthstonejson.com/v1/latest'
const OUTPUT = 'public/data/hs-bg.json'

const fetchCards = async (locale) => {
    const response = await fetch(`${API}/${locale}/cards.json`)
    if (!response.ok) throw new Error(`${locale}: HTTP ${response.status}`)
    return response.json()
}

const clean = (text = '') => text.replace(/\[x\]/g, '').replace(/[$#](\d+)/g, '$1').replace(/\s*\n\s*/g, ' ').trim()

const [pt, en] = await Promise.all([fetchCards('ptBR'), fetchCards('enUS')])
const enById = new Map(en.map((card) => [card.dbfId, card]))
const ptById = new Map(pt.map((card) => [card.dbfId, card]))
const pair = (card, field) => [clean(card[field]), clean(enById.get(card.dbfId)?.[field])]

const minions = pt
    .filter((card) => card.isBattlegroundsPoolMinion && card.techLevel)
    .map((card) => ({
        d: card.dbfId,
        i: card.id,
        n: pair(card, 'name'),
        t: pair(card, 'text'),
        l: card.techLevel,
        a: card.attack ?? 0,
        h: card.health ?? 0,
        r: (card.races ?? (card.race ? [card.race] : [])).filter((race) => race !== 'INVALID'),
        m: card.mechanics ?? [],
    }))
    .sort((a, b) => a.l - b.l || a.n[0].localeCompare(b.n[0], 'pt'))

const heroes = pt
    .filter((card) => card.battlegroundsHero && card.type === 'HERO' && ptById.has(card.heroPowerDbfId))
    .map((card) => {
        const power = ptById.get(card.heroPowerDbfId)
        return {
            d: card.dbfId,
            i: card.id,
            n: pair(card, 'name'),
            ar: card.armor ?? 0,
            p: { n: pair(power, 'name'), t: pair(power, 'text'), c: power.cost ?? 0 },
        }
    })
    .sort((a, b) => a.n[0].localeCompare(b.n[0], 'pt'))

const spells = pt
    .filter((card) => card.isBattlegroundsPoolSpell && card.techLevel)
    .map((card) => ({ d: card.dbfId, i: card.id, n: pair(card, 'name'), t: pair(card, 'text'), l: card.techLevel, c: card.cost ?? 0 }))
    .sort((a, b) => a.l - b.l || a.n[0].localeCompare(b.n[0], 'pt'))

await writeFile(OUTPUT, JSON.stringify({ updated: new Date().toISOString().slice(0, 10), minions, heroes, spells }))
console.log(`${minions.length} lacaios, ${heroes.length} heróis, ${spells.length} feitiços em ${OUTPUT}`)
