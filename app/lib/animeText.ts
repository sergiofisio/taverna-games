import type { Language } from "../i18n/translations";
import { animeTitle, formatLabel, genreLabel, seasonLabel, sourceLabel, statusLabel, type AnimeSummary } from "./anime";
import type { AnimeFull } from "./animeServer";

const listOf = (items: string[], language: Language) =>
    items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} ${language === 'pt' ? 'e' : 'and'} ${items.at(-1)}`

const scoreWord = (score: number, pt: boolean) =>
    score >= 85 ? (pt ? 'uma das notas mais altas do site' : 'one of the highest scores on the site')
        : score >= 75 ? (pt ? 'uma nota muito boa' : 'a very good score')
            : score >= 65 ? (pt ? 'uma nota boa' : 'a good score')
                : (pt ? 'uma nota mediana' : 'an average score')

export function describeAnime(anime: AnimeFull, language: Language) {
    const pt = language === 'pt'
    const title = animeTitle(anime, language)
    const genres = anime.genres.map((genre) => genreLabel(genre, language).toLowerCase())
    const formatName = formatLabel(anime.format, language)
    const format = formatName.charAt(0).toLowerCase() + formatName.slice(1)
    const when = anime.season && anime.year ? `${seasonLabel(anime.season, language).toLowerCase()} ${pt ? 'de' : ''} ${anime.year}`.replace('  ', ' ') : anime.year ? String(anime.year) : null
    const paragraphs: string[] = []

    paragraphs.push(pt
        ? `${title}${anime.english && anime.english !== anime.romaji ? ` (${anime.english})` : ''} é ${anime.format === 'MOVIE' ? 'um filme' : 'um anime'} ${anime.format === 'MOVIE' ? '' : `no formato ${format} `}${when ? `que estreou em ${when}` : ''}${anime.studio ? `, produzido pelo estúdio ${anime.studio}` : ''}.`.replace(/\s+/g, ' ').replace(' .', '.')
        : `${title} is ${anime.format === 'MOVIE' ? 'an anime film' : `a ${format} anime`}${when ? ` that premiered in ${when}` : ''}${anime.studio ? `, produced by ${anime.studio}` : ''}.`)

    const facts: string[] = []
    if (anime.source) facts.push(pt ? `a história vem de ${sourceLabel(anime.source, language).toLowerCase() === 'original' ? 'um roteiro original' : `um ${sourceLabel(anime.source, language).toLowerCase()}`}` : `the story comes from ${anime.source === 'ORIGINAL' ? 'an original script' : `a ${sourceLabel(anime.source, language).toLowerCase()}`}`)
    if (anime.episodes && anime.format !== 'MOVIE') facts.push(pt ? `são ${anime.episodes} ${anime.episodes === 1 ? 'episódio' : 'episódios'}${anime.duration ? ` de cerca de ${anime.duration} minutos` : ''}` : `there ${anime.episodes === 1 ? 'is 1 episode' : `are ${anime.episodes} episodes`}${anime.duration ? ` of about ${anime.duration} minutes` : ''}`)
    if (anime.format === 'MOVIE' && anime.duration) facts.push(pt ? `o filme tem cerca de ${anime.duration} minutos` : `the film runs about ${anime.duration} minutes`)
    if (anime.status) facts.push(pt ? `o status atual é "${statusLabel(anime.status, language).toLowerCase()}"` : `its current status is "${statusLabel(anime.status, language).toLowerCase()}"`)
    if (facts.length) paragraphs.push(`${pt ? 'Sobre a produção' : 'About the production'}: ${listOf(facts, language)}.`)

    if (genres.length) {
        paragraphs.push(pt
            ? `Os gêneros principais são ${listOf(genres, 'pt')}${anime.tags.length ? `, com temas como ${listOf(anime.tags.slice(0, 4), 'pt')}` : ''}.`
            : `Its main genres are ${listOf(genres, 'en')}${anime.tags.length ? `, with themes such as ${listOf(anime.tags.slice(0, 4), 'en')}` : ''}.`)
    }

    if (anime.score) {
        paragraphs.push(pt
            ? `No AniList, ${title} tem nota média de ${anime.score}%, ${scoreWord(anime.score, true)}, e está na lista de ${anime.popularity.toLocaleString('pt-BR')} usuários.`
            : `On AniList, ${title} has an average score of ${anime.score}%, ${scoreWord(anime.score, false)}, and appears on ${anime.popularity.toLocaleString('en-US')} users' lists.`)
    }

    const sequels = anime.relations.filter(({ relation }) => relation === 'SEQUEL' || relation === 'PREQUEL')
    if (sequels.length) {
        paragraphs.push(pt
            ? `A franquia tem continuação ou história anterior: ${listOf(sequels.slice(0, 3).map(({ romaji }) => romaji), 'pt')}.`
            : `The franchise continues in or follows from: ${listOf(sequels.slice(0, 3).map(({ romaji }) => romaji), 'en')}.`)
    }
    return paragraphs
}

export function animeMetaDescription(anime: AnimeSummary, language: Language) {
    const genres = anime.genres.map((genre) => genreLabel(genre, language).toLowerCase())
    return language === 'en'
        ? `${animeTitle(anime, 'en')}: ${formatLabel(anime.format, 'en').toLowerCase()} anime${anime.year ? ` from ${anime.year}` : ''}${anime.studio ? ` by ${anime.studio}` : ''}. Genres, episodes, score, main characters and recommendations.`
        : `${anime.romaji}: anime ${anime.format === 'MOVIE' ? 'filme' : formatLabel(anime.format, 'pt').toLowerCase()}${anime.year ? ` de ${anime.year}` : ''}${anime.studio ? ` do estúdio ${anime.studio}` : ''}. ${genres.length ? `Gêneros: ${listOf(genres, 'pt')}. ` : ''}Episódios, nota, personagens e recomendações.`
}

export const GENRE_INTROS: Record<string, [string, string]> = {
    Action: ['Animes de ação apostam em lutas, perseguições e confrontos bem coreografados. Muitos acompanham heróis que treinam para ficar mais fortes e enfrentam inimigos cada vez maiores.', 'Action anime focus on fights, chases and well-choreographed clashes. Many follow heroes who train to grow stronger and face ever bigger enemies.'],
    Adventure: ['Animes de aventura levam os personagens a viagens, explorações e mundos novos. A jornada costuma importar tanto quanto o destino.', 'Adventure anime send characters on journeys, explorations and into new worlds. The journey often matters as much as the destination.'],
    Comedy: ['Animes de comédia vivem de situações absurdas, personagens exagerados e piadas rápidas. Muitos misturam humor com romance, ação ou cotidiano.', 'Comedy anime thrive on absurd situations, over-the-top characters and quick jokes. Many mix humor with romance, action or slice of life.'],
    Drama: ['Animes de drama exploram conflitos emocionais, perdas e relações complicadas. São histórias que costumam marcar pelo peso dos sentimentos.', 'Drama anime explore emotional conflicts, loss and complicated relationships. These stories tend to stick with you for the weight of their emotions.'],
    Ecchi: ['Animes ecchi usam humor e situações com insinuação, sem conteúdo explícito. Costumam ser comédias ou romances leves.', 'Ecchi anime use suggestive humor and situations without explicit content. They are usually comedies or light romances.'],
    Fantasy: ['Animes de fantasia se passam em mundos com magia, criaturas e reinos inventados. É o gênero dos isekai, das guildas e dos grandes reinos medievais.', 'Fantasy anime take place in worlds with magic, creatures and invented kingdoms. It is the home of isekai, guilds and grand medieval realms.'],
    Horror: ['Animes de terror buscam o medo e a tensão, com monstros, maldições e ambientes sombrios. Muitos também trabalham suspense psicológico.', 'Horror anime aim for fear and tension, with monsters, curses and dark settings. Many also play with psychological suspense.'],
    'Mahou Shoujo': ['Animes de garota mágica acompanham meninas que ganham poderes e se transformam para proteger o mundo. O gênero vai do fofo ao surpreendentemente sombrio.', 'Magical girl anime follow girls who gain powers and transform to protect the world. The genre ranges from cute to surprisingly dark.'],
    Mecha: ['Animes de mecha giram em torno de robôs gigantes pilotados, guerras e tecnologia. Muitos usam as batalhas para discutir política e o custo dos conflitos.', 'Mecha anime revolve around giant piloted robots, wars and technology. Many use the battles to discuss politics and the cost of conflict.'],
    Music: ['Animes de música acompanham bandas, cantores e apresentações. O som e as performances são parte central da história.', 'Music anime follow bands, singers and performances. Sound and stage shows are a central part of the story.'],
    Mystery: ['Animes de mistério giram em torno de enigmas, investigações e segredos que vão sendo revelados aos poucos. Prestar atenção aos detalhes faz parte da diversão.', 'Mystery anime center on puzzles, investigations and secrets revealed bit by bit. Paying attention to details is part of the fun.'],
    Psychological: ['Animes psicológicos exploram a mente dos personagens, dilemas morais e jogos de manipulação. Costumam deixar o espectador pensando depois de cada episódio.', 'Psychological anime explore characters\' minds, moral dilemmas and mind games. They often leave viewers thinking after every episode.'],
    Romance: ['Animes de romance contam histórias de amor, primeiros encontros e relacionamentos. Podem ser leves e engraçados ou intensos e dramáticos.', 'Romance anime tell love stories, first encounters and relationships. They can be light and funny or intense and dramatic.'],
    'Sci-Fi': ['Animes de ficção científica imaginam futuros, viagens espaciais, inteligência artificial e tecnologias que mudam a sociedade.', 'Sci-fi anime imagine futures, space travel, artificial intelligence and technologies that reshape society.'],
    'Slice of Life': ['Animes de cotidiano mostram o dia a dia dos personagens: escola, trabalho, amizades e pequenas descobertas. O ritmo é tranquilo e acolhedor.', 'Slice of life anime show characters\' everyday lives: school, work, friendships and small discoveries. The pace is calm and cozy.'],
    Sports: ['Animes de esporte acompanham times e atletas em treinos, campeonatos e rivalidades. A emoção das partidas vem junto com a superação pessoal.', 'Sports anime follow teams and athletes through training, tournaments and rivalries. Match excitement comes with personal growth.'],
    Supernatural: ['Animes sobrenaturais trazem espíritos, demônios, poderes ocultos e fenômenos inexplicáveis para o mundo real.', 'Supernatural anime bring spirits, demons, hidden powers and unexplained phenomena into the real world.'],
    Thriller: ['Animes de suspense mantêm a tensão do começo ao fim, com perigos constantes, reviravoltas e corridas contra o tempo.', 'Thriller anime keep the tension from start to finish, with constant danger, twists and races against time.'],
}
