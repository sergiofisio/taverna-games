import { prettify, type Language } from "../i18n/translations";
import type { AbilityProfile, MoveProfile } from "./movesServer";
import { joinList, statLabel, typeLabel } from "./pokemonText";
import { getOffensiveTargets } from "./typeChart";

const AILMENTS: Record<string, [string, string]> = {
    paralysis: ['paralisar o alvo', 'paralyze the target'],
    sleep: ['fazer o alvo dormir', 'put the target to sleep'],
    freeze: ['congelar o alvo', 'freeze the target'],
    burn: ['queimar o alvo', 'burn the target'],
    poison: ['envenenar o alvo', 'poison the target'],
    confusion: ['confundir o alvo', 'confuse the target'],
    infatuation: ['deixar o alvo apaixonado', 'infatuate the target'],
    trap: ['prender o alvo por alguns turnos', 'trap the target for a few turns'],
    nightmare: ['causar pesadelos no alvo adormecido', 'give a sleeping target nightmares'],
    torment: ['impedir que o alvo repita o mesmo golpe', 'stop the target from using the same move twice in a row'],
    disable: ['desativar o último golpe do alvo', 'disable the target’s last move'],
    yawn: ['deixar o alvo sonolento, para dormir no turno seguinte', 'make the target drowsy so it falls asleep next turn'],
    'heal-block': ['impedir que o alvo se cure', 'stop the target from healing'],
    'leech-seed': ['plantar uma semente que drena o PS do alvo a cada turno', 'plant a seed that drains the target’s HP each turn'],
    embargo: ['impedir que o alvo use itens', 'stop the target from using items'],
    'perish-song': ['fazer todos em campo desmaiarem em três turnos se não trocarem', 'make everyone on the field faint in three turns unless they switch'],
    ingrain: ['fincar raízes que curam o usuário a cada turno', 'plant roots that heal the user each turn'],
    'no-type-immunity': ['anular a imunidade de tipo do alvo', 'remove the target’s type immunity'],
    silence: ['impedir golpes de som', 'block sound moves'],
    'tar-shot': ['deixar o alvo mais fraco contra golpes de Fogo', 'make the target weaker to Fire moves'],
}

const EXTRA_STATS: Record<string, [string, string]> = { accuracy: ['Precisão', 'Accuracy'], evasion: ['Evasão', 'Evasion'] }
const statName = (stat: string, language: Language) =>
    EXTRA_STATS[stat] ? EXTRA_STATS[stat][language === 'pt' ? 0 : 1] : statLabel(stat, language)

const CLASS_LABEL: Record<MoveProfile['damageClass'], [string, string]> = {
    physical: ['físico', 'physical'],
    special: ['especial', 'special'],
    status: ['de status', 'status'],
}

const SELF_TARGETS = ['user', 'users-field', 'user-and-allies', 'user-or-ally', 'ally', 'entire-field']

export function describeMove(move: MoveProfile, language: Language) {
    const pt = language === 'pt'
    const name = prettify(move.slug)
    const type = typeLabel(move.type, language)
    const kind = CLASS_LABEL[move.damageClass][pt ? 0 : 1]
    const paragraphs: string[] = []

    paragraphs.push(pt
        ? `${name} é um golpe ${kind} do tipo ${type}, introduzido na ${move.generation}ª geração.`
        : `${name} is a ${kind} ${type}-type move introduced in generation ${move.generation}.`)

    const numbers: string[] = []
    if (move.power) numbers.push(pt ? `${move.power} de poder` : `${move.power} power`)
    numbers.push(move.accuracy ? (pt ? `${move.accuracy}% de precisão` : `${move.accuracy}% accuracy`) : (pt ? 'precisão garantida (nunca erra)' : 'guaranteed accuracy (it never misses)'))
    if (move.pp) numbers.push(pt ? `${move.pp} PP` : `${move.pp} PP`)
    paragraphs.push(pt
        ? `${move.power ? 'Tem' : 'Não causa dano direto e tem'} ${joinList(numbers, 'pt')}.`
        : `${move.power ? 'It has' : 'It deals no direct damage and has'} ${joinList(numbers, 'en')}.`)

    const effects: string[] = []
    if (move.priority > 0) effects.push(pt ? `tem prioridade +${move.priority}, então costuma agir antes de golpes normais` : `has +${move.priority} priority, so it usually goes before regular moves`)
    if (move.priority < 0) effects.push(pt ? `tem prioridade ${move.priority}, então costuma agir por último` : `has ${move.priority} priority, so it usually goes last`)
    if (move.ailment && AILMENTS[move.ailment]) {
        const [ptText, enText] = AILMENTS[move.ailment]
        const chance = move.ailmentChance
        effects.push(pt
            ? chance ? `tem ${chance}% de chance de ${ptText}` : `serve para ${ptText}`
            : chance ? `has a ${chance}% chance to ${enText}` : `is used to ${enText}`)
    }
    if (move.flinchChance) effects.push(pt ? `tem ${move.flinchChance}% de chance de fazer o alvo recuar e perder a vez` : `has a ${move.flinchChance}% chance to make the target flinch`)
    if (move.drain > 0) effects.push(pt ? `recupera ${move.drain}% do dano causado` : `restores ${move.drain}% of the damage dealt`)
    if (move.drain < 0) effects.push(pt ? `faz o usuário sofrer ${-move.drain}% do dano causado como recuo` : `makes the user take ${-move.drain}% of the damage dealt as recoil`)
    if (move.healing > 0) effects.push(pt ? `cura ${move.healing}% do PS máximo` : `heals ${move.healing}% of max HP`)
    if (move.critRate > 0) effects.push(pt ? 'tem mais chance de acerto crítico' : 'has a higher critical-hit ratio')
    if (move.minHits && move.maxHits && move.maxHits > 1) {
        effects.push(pt
            ? move.minHits === move.maxHits ? `acerta ${move.maxHits} vezes seguidas` : `acerta de ${move.minHits} a ${move.maxHits} vezes seguidas`
            : move.minHits === move.maxHits ? `hits ${move.maxHits} times in a row` : `hits ${move.minHits} to ${move.maxHits} times in a row`)
    }
    if (move.statChanges.length) {
        const self = move.damageClass === 'status'
            ? SELF_TARGETS.includes(move.target)
            : move.category !== 'damage-lower'
        const who = pt ? (self ? 'do usuário' : 'do alvo') : (self ? 'the user’s' : 'the target’s')
        const changes = move.statChanges.map(({ stat, change }) => pt
            ? `${change > 0 ? 'aumenta' : 'diminui'} ${statName(stat, language)} ${who} em ${Math.abs(change)} ${Math.abs(change) === 1 ? 'estágio' : 'estágios'}`
            : `${change > 0 ? 'raises' : 'lowers'} ${who} ${statName(stat, language)} by ${Math.abs(change)} stage${Math.abs(change) === 1 ? '' : 's'}`)
        const chance = move.statChance && move.statChance < 100 ? (pt ? ` (${move.statChance}% de chance)` : ` (${move.statChance}% chance)`) : ''
        effects.push(`${joinList(changes, language)}${chance}`)
    }
    if (effects.length) paragraphs.push(pt ? `Além disso, o golpe ${joinList(effects, 'pt')}.` : `On top of that, the move ${joinList(effects, 'en')}.`)

    if (move.damageClass !== 'status') {
        const { strong, weak, none } = getOffensiveTargets(move.type)
        const list = (types: string[]) => joinList(types.map((value) => typeLabel(value, language)), language)
        const strongText = pt
            ? strong.length ? `é super efetivo contra Pokémon ${strong.length > 1 ? 'dos tipos' : 'do tipo'} ${list(strong)}` : 'não é super efetivo contra nenhum tipo'
            : strong.length ? `it is super effective against ${list(strong)} Pokémon` : 'it is not super effective against any type'
        paragraphs.push(pt
            ? `Por ser do tipo ${type}, ${strongText}${weak.length ? `, é pouco efetivo contra ${list(weak)}` : ''}${none.length ? ` e não tem efeito em ${list(none)}` : ''}. Pokémon do tipo ${type} recebem 50% de bônus de dano (STAB) ao usá-lo.`
            : `As a ${type}-type move, ${strongText}${weak.length ? `, not very effective against ${list(weak)}` : ''}${none.length ? ` and has no effect on ${list(none)}` : ''}. ${type}-type Pokémon get a 50% damage bonus (STAB) when using it.`)
    }

    const examples = move.learners.slice(0, 5).map(({ slug }) => prettify(slug))
    paragraphs.push(move.learners.length
        ? (pt
            ? `${move.learners.length === 1 ? 'Só 1 Pokémon pode aprender' : `${move.learners.length} Pokémon podem aprender`} ${name}, como ${joinList(examples, 'pt')}.`
            : `${move.learners.length === 1 ? 'Only 1 Pokémon can learn' : `${move.learners.length} Pokémon can learn`} ${name}, such as ${joinList(examples, 'en')}.`)
        : (pt ? 'Nenhum Pokémon aprende este golpe nos jogos atuais.' : 'No Pokémon learns this move in the current games.'))

    return paragraphs
}

export function moveMetaDescription(move: MoveProfile) {
    const [first, second] = describeMove(move, 'pt')
    return `${first} ${second}`.slice(0, 300)
}

export function describeAbility(ability: AbilityProfile, language: Language) {
    const pt = language === 'pt'
    const name = prettify(ability.slug)
    const total = ability.regular.length + ability.hidden.length
    const examples = [...ability.regular, ...ability.hidden].slice(0, 5).map(({ slug }) => prettify(slug))
    const paragraphs = [
        pt
            ? `${name} é uma habilidade introduzida na ${ability.generation}ª geração.`
            : `${name} is an ability introduced in generation ${ability.generation}.`,
        total
            ? (pt
                ? `${total === 1 ? 'Só 1 Pokémon pode ter' : `${total} Pokémon podem ter`} essa habilidade${examples.length ? `, como ${joinList(examples, 'pt')}` : ''}.${ability.hidden.length ? ` Para ${ability.hidden.length} deles ela é a habilidade oculta, que costuma vir de eventos, reides ou criação.` : ''}`
                : `${total === 1 ? 'Only 1 Pokémon can have' : `${total} Pokémon can have`} this ability${examples.length ? `, such as ${joinList(examples, 'en')}` : ''}.${ability.hidden.length ? ` For ${ability.hidden.length} of them it is the hidden ability, usually obtained from events, raids or breeding.` : ''}`)
            : (pt ? 'Nenhum Pokémon tem essa habilidade nos jogos atuais.' : 'No Pokémon has this ability in the current games.'),
    ]
    return paragraphs
}
