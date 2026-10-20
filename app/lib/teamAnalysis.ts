import type { Language } from "../i18n/translations";
import { POKEMON_TYPES } from "./pokeapi";
import { joinList, typeLabel } from "./pokemonText";
import { attackMultiplier, defenseMultiplier } from "./typeChart";

export const TEAM_SIZE = 6

export interface TeamMember {
    id: number
    slug: string
    types: string[]
}

export interface TeamAnalysis {
    defense: { attacker: string; multipliers: number[]; weak: number; resist: number }[]
    threats: string[]
    uncovered: string[]
    suggestions: { type: string; covers: string[] }[]
}

export function analyzeTeam(team: TeamMember[]): TeamAnalysis {
    const defense = POKEMON_TYPES.map((attacker) => {
        const multipliers = team.map((member) => defenseMultiplier(attacker, member.types))
        return {
            attacker,
            multipliers,
            weak: multipliers.filter((value) => value > 1).length,
            resist: multipliers.filter((value) => value < 1).length,
        }
    })
    const threats = defense.filter((row) => row.weak >= 2 && row.weak > row.resist).map((row) => row.attacker)
    const stab = new Set(team.flatMap((member) => member.types))
    const uncovered = POKEMON_TYPES.filter((defender) => ![...stab].some((type) => attackMultiplier(type, defender) > 1))
    const suggestions = POKEMON_TYPES
        .filter((type) => !stab.has(type))
        .map((type) => ({ type, covers: threats.filter((threat) => attackMultiplier(threat, type) < 1) }))
        .filter(({ covers }) => covers.length > 0)
        .sort((a, b) => b.covers.length - a.covers.length)
        .slice(0, 4)
    return { defense, threats, uncovered, suggestions }
}

export function describeTeam(analysis: TeamAnalysis, size: number, language: Language) {
    const pt = language === 'pt'
    const list = (types: string[]) => joinList(types.map((type) => typeLabel(type, language)), language)
    if (size === 0) return []
    const paragraphs: string[] = []
    paragraphs.push(analysis.threats.length
        ? (pt
            ? `O ponto fraco do time são golpes ${analysis.threats.length > 1 ? 'dos tipos' : 'do tipo'} ${list(analysis.threats)}: vários membros sofrem dano extra deles e quase ninguém resiste.`
            : `The team’s weak spot is ${list(analysis.threats)} moves: several members take extra damage from them and almost none resist.`)
        : (pt ? 'Nenhum tipo de golpe ameaça vários membros do time ao mesmo tempo. As fraquezas estão bem distribuídas.' : 'No move type threatens several team members at once. The weaknesses are well spread out.'))
    paragraphs.push(analysis.uncovered.length
        ? (pt
            ? `Com golpes do próprio tipo, o time não acerta em cheio Pokémon ${analysis.uncovered.length > 1 ? 'dos tipos' : 'do tipo'} ${list(analysis.uncovered)}. Golpes de cobertura de outros tipos ajudam a fechar essa lacuna.`
            : `With same-type moves, the team can’t hit ${list(analysis.uncovered)} Pokémon super effectively. Coverage moves of other types help close that gap.`)
        : (pt ? 'Com golpes do próprio tipo, o time acerta em cheio todos os 18 tipos.' : 'With same-type moves, the team hits all 18 types super effectively.'))
    if (analysis.suggestions.length && size < TEAM_SIZE) {
        paragraphs.push(pt
            ? `Para a próxima vaga, considere um Pokémon do tipo ${list(analysis.suggestions.slice(0, 2).map(({ type }) => type))}, que resiste às principais ameaças do time.`
            : `For the next slot, consider a ${list(analysis.suggestions.slice(0, 2).map(({ type }) => type))} Pokémon, which resists the team’s main threats.`)
    }
    return paragraphs
}
