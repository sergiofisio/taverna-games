import type { Language } from "../i18n/translations";

export type GuideSection = { title: string; paragraphs: string[] }
export type GuideContent = { title: string; description: string; intro: string; sections: GuideSection[] }
export type GuideWorld = 'pokemon' | 'hearthstone' | 'lol' | 'anime' | 'tcg'

export interface Guide {
    slug: string
    world: GuideWorld
    updated: string
    content: Record<Language, GuideContent>
}

export const GUIDES: Guide[] = [
    {
        slug: 'tabela-de-tipos',
        world: 'pokemon',
        updated: '2026-10-09',
        content: {
            pt: {
                title: 'Tabela de tipos Pokémon: fraquezas, resistências e imunidades',
                description: 'Tabela completa dos 18 tipos Pokémon com fraquezas, resistências e imunidades, explicação dos multiplicadores de dano e um resumo de cada tipo.',
                intro: 'Saber qual tipo vence qual é a habilidade mais útil em qualquer jogo de Pokémon. Esta página reúne a tabela completa dos 18 tipos, explica como os multiplicadores se combinam nos Pokémon de dois tipos e resume, tipo por tipo, contra quem cada um é forte e de quem ele precisa fugir.',
                sections: [
                    {
                        title: 'Como ler a tabela',
                        paragraphs: [
                            'Cada linha é o tipo do golpe que ataca, e cada coluna é o tipo do Pokémon que recebe o golpe. O número na interseção é o multiplicador de dano: 2× significa "super efetivo", ½× significa "pouco efetivo" e 0× significa que o alvo é imune. Casas vazias valem 1×, o dano normal.',
                            'Um detalhe que confunde muita gente: o que importa é o tipo do golpe, não o tipo do Pokémon que ataca. Um Charizard usando Terremoto causa dano do tipo Terra, e a tabela deve ser lida na linha de Terra.',
                        ],
                    },
                    {
                        title: 'Pokémon de dois tipos',
                        paragraphs: [
                            'Quando o alvo tem dois tipos, os multiplicadores são multiplicados entre si. Uma fraqueza dupla vira 4× (Gelo contra Garchomp, que é Dragão e Terra), uma resistência dupla vira ¼× e uma fraqueza somada a uma resistência se anula em 1×.',
                            'Basta uma imunidade para zerar tudo: Terremoto não acerta um Pokémon Voador mesmo que o outro tipo dele seja fraco a Terra. Por isso combinações como Água e Terra (Swampert) são tão valorizadas: o tipo Terra apaga a fraqueza a Elétrico que o tipo Água teria, e sobra só uma fraqueza, 4× a Planta.',
                        ],
                    },
                    {
                        title: 'Bônus de mesmo tipo (STAB)',
                        paragraphs: [
                            'Além da tabela, golpes do mesmo tipo do Pokémon que ataca recebem 1,5× de dano, o chamado STAB. Um Pikachu usando Choque do Trovão bate mais forte do que um Pokémon Normal usando o mesmo golpe. Na prática, a melhor jogada costuma ser o golpe que junta STAB e vantagem de tipo: 1,5 × 2 = 3× o dano base.',
                        ],
                    },
                    {
                        title: 'Exceções que vale lembrar',
                        paragraphs: [
                            'Algumas habilidades mudam a tabela. Levitar deixa o Pokémon imune a golpes de Terra, Absorver Água transforma golpes de Água em cura e Pele Seca deixa o Pokémon fraco a Fogo. Objetos como o Balão também dão imunidade temporária a Terra.',
                            'A tabela também mudou com o tempo. O tipo Fada só surgiu na sexta geração, e na primeira geração os golpes Fantasma não afetavam Pokémon Psíquicos por causa de um erro de programação. Esta página segue a tabela atual, válida da sexta geração em diante.',
                        ],
                    },
                    {
                        title: 'Dicas rápidas para batalhas',
                        paragraphs: [
                            'Tenha na equipe tipos que se cobrem: Fogo, Água e Planta formam um triângulo em que cada um resiste ao que vence o outro. Aço é o tipo com mais resistências, e Fada é a melhor resposta a Dragão. Antes de trocar de Pokémon, olhe o que o adversário pode usar contra ele, e não só o que ele pode usar contra o adversário.',
                        ],
                    },
                ],
            },
            en: {
                title: 'Pokémon type chart: weaknesses, resistances and immunities',
                description: 'The full chart of all 18 Pokémon types with weaknesses, resistances and immunities, how damage multipliers work and a summary of each type.',
                intro: 'Knowing which type beats which is the most useful skill in any Pokémon game. This page has the full chart of the 18 types, explains how multipliers stack on dual-type Pokémon and sums up, type by type, what each one beats and what it should avoid.',
                sections: [
                    {
                        title: 'How to read the chart',
                        paragraphs: [
                            'Each row is the type of the attacking move, and each column is the type of the Pokémon taking the hit. The number where they meet is the damage multiplier: 2× is "super effective", ½× is "not very effective" and 0× means the target is immune. Empty cells are 1×, normal damage.',
                            'A common mix-up: what matters is the move’s type, not the attacker’s type. A Charizard using Earthquake deals Ground-type damage, so read the Ground row.',
                        ],
                    },
                    {
                        title: 'Dual-type Pokémon',
                        paragraphs: [
                            'When the target has two types, the multipliers are multiplied together. A double weakness becomes 4× (Ice against Garchomp, a Dragon and Ground type), a double resistance becomes ¼× and a weakness plus a resistance cancel out to 1×.',
                            'A single immunity zeroes everything: Earthquake won’t hit a Flying Pokémon even if its other type is weak to Ground. That is why combos like Water and Ground (Swampert) are so valued: Ground erases the Electric weakness that Water would have, leaving just one weakness, 4× to Grass.',
                        ],
                    },
                    {
                        title: 'Same-type attack bonus (STAB)',
                        paragraphs: [
                            'On top of the chart, moves that share a type with the attacker deal 1.5× damage, known as STAB. A Pikachu using Thunderbolt hits harder than a Normal Pokémon using the same move. In practice, the best play is usually the move that combines STAB and type advantage: 1.5 × 2 = 3× base damage.',
                        ],
                    },
                    {
                        title: 'Exceptions worth remembering',
                        paragraphs: [
                            'Some abilities change the chart. Levitate makes a Pokémon immune to Ground moves, Water Absorb turns Water moves into healing and Dry Skin makes a Pokémon weak to Fire. Items like the Air Balloon also grant temporary Ground immunity.',
                            'The chart has changed over time too. The Fairy type only arrived in the sixth generation, and in the first generation Ghost moves didn’t affect Psychic Pokémon because of a programming bug. This page follows the current chart, valid from the sixth generation onward.',
                        ],
                    },
                    {
                        title: 'Quick battle tips',
                        paragraphs: [
                            'Build a team whose types cover each other: Fire, Water and Grass form a triangle where each resists what beats another. Steel has the most resistances, and Fairy is the best answer to Dragon. Before switching, check what the opponent can throw at your Pokémon, not only what it can throw at the opponent.',
                        ],
                    },
                ],
            },
        },
    },
    {
        slug: 'como-reconhecer-pokemon',
        world: 'pokemon',
        updated: '2026-10-09',
        content: {
            pt: {
                title: 'Como reconhecer Pokémon pela silhueta, pelo grito e pela descrição',
                description: 'Dicas para acertar mais nos desafios de Pokémon: como ler silhuetas, descrições da Pokédex, gritos, zoom, fusões e o modo Ginásio.',
                intro: 'Os desafios diários da Taverna dos Jogos testam quantos dos 1025 Pokémon você consegue reconhecer com pouca informação. Ninguém decora todos, mas algumas estratégias ajudam muito a reduzir as opções e acertar com menos tentativas.',
                sections: [
                    {
                        title: 'Silhueta: comece pela forma geral',
                        paragraphs: [
                            'Antes de procurar detalhes, olhe a postura. Quadrúpedes, bípedes, serpentes, peixes e aves formam grupos bem diferentes, e só isso já descarta centenas de nomes. Depois procure as partes que mais saltam da sombra: orelhas longas, caudas com formato próprio, chifres, asas ou apêndices.',
                            'Lembre que a silhueta não mostra cor nem tamanho real. Um Pokémon minúsculo e um enorme podem ocupar a tela inteira. Desconfie também das evoluções: muitas linhas evolutivas mantêm a mesma silhueta básica e mudam só em detalhes como o tamanho da cauda ou o número de pontas.',
                        ],
                    },
                    {
                        title: 'Descrição: procure as palavras-chave',
                        paragraphs: [
                            'As descrições da Pokédex costumam citar o habitat, a dieta ou o comportamento. Palavras como "vulcão", "mar profundo", "floresta" ou "cavernas" apontam para o tipo. Menções a eletricidade, veneno, psíquico ou fantasmas são pistas ainda mais diretas.',
                            'Fique atento a números e comparações. Textos que falam de "pesar como uma montanha" ou "voar mais rápido que um jato" quase sempre são de Pokémon grandes ou lendários. E se a descrição falar de evolução ("quando evolui...", "na forma anterior..."), o alvo provavelmente faz parte de uma linha de três estágios.',
                        ],
                    },
                    {
                        title: 'Zoom: identifique a textura',
                        paragraphs: [
                            'No modo Zoom, a imagem começa bem ampliada e vai se revelando a cada erro. Nas primeiras tentativas você vê só cores e texturas, então pense em combinações: amarelo com marrom, azul com branco, verde com vermelho. Escamas, pelos, pedra e metal também ajudam a chutar o tipo.',
                            'Use os erros a seu favor. Cada tentativa errada mostra mais da imagem, então um chute que pelo menos tenha a cor certa já ajuda a confirmar ou descartar uma família inteira.',
                        ],
                    },
                    {
                        title: 'Grito: ouça o ritmo, não só o som',
                        paragraphs: [
                            'Os gritos das primeiras gerações são sons sintetizados curtos e às vezes parecidos entre si, enquanto os das gerações recentes são mais longos e detalhados. Só pela qualidade do áudio já dá para ter uma ideia da geração do Pokémon.',
                            'Muitos Pokémon da série animada falam o próprio nome, mas os gritos dos jogos são outra coisa. Repare no ritmo, no número de sílabas e se o som sobe ou desce no final. Pokémon grandes costumam ter gritos graves; os pequenos, agudos.',
                        ],
                    },
                    {
                        title: 'Fusão e Ginásio',
                        paragraphs: [
                            'Na Fusão, a imagem mistura dois Pokémon: um costuma dar a forma do corpo e o outro, as cores e o rosto. Tente separar essas duas camadas e acertar primeiro a mais óbvia. O formato da cabeça e o padrão das cores raramente vêm do mesmo Pokémon.',
                            'No Ginásio, você precisa achar o Pokémon que não pertence ao grupo. Comece pelo tipo do líder e procure quem não combina; se todos parecerem do mesmo tipo, compare a geração, a região ou o estágio evolutivo.',
                        ],
                    },
                    {
                        title: 'Treine com a Pokédex',
                        paragraphs: [
                            'A melhor forma de melhorar é explorar a Pokédex por geração. Abra a página de cada Pokémon, veja a arte oficial, os tipos e a linha evolutiva, e ouça o grito. Depois de passar por uma região inteira, os desafios daquela geração ficam bem mais fáceis.',
                        ],
                    },
                ],
            },
            en: {
                title: 'How to recognize Pokémon by silhouette, cry and description',
                description: 'Tips to win more Pokémon challenges: reading silhouettes, Pokédex entries, cries, zoomed images, fusions and the Gym mode.',
                intro: 'The daily challenges at Taverna dos Jogos test how many of the 1025 Pokémon you can recognize from very little information. Nobody memorizes them all, but a few strategies help a lot to narrow the options and get it right in fewer tries.',
                sections: [
                    {
                        title: 'Silhouette: start with the overall shape',
                        paragraphs: [
                            'Before hunting for details, look at the posture. Quadrupeds, bipeds, serpents, fish and birds are very different groups, and that alone rules out hundreds of names. Then look for the parts that stand out most: long ears, distinctive tails, horns, wings or appendages.',
                            'Remember that a silhouette shows neither color nor real size. A tiny Pokémon and a huge one can both fill the screen. Watch out for evolutions too: many lines keep the same basic silhouette and only change details like tail size or the number of spikes.',
                        ],
                    },
                    {
                        title: 'Description: look for keywords',
                        paragraphs: [
                            'Pokédex entries usually mention habitat, diet or behavior. Words like "volcano", "deep sea", "forest" or "caves" point to a type. Mentions of electricity, poison, psychic powers or ghosts are even more direct clues.',
                            'Pay attention to numbers and comparisons. Entries about "weighing as much as a mountain" or "flying faster than a jet" are almost always about large or legendary Pokémon. And if the entry talks about evolution ("when it evolves...", "in its previous form..."), the target is probably part of a three-stage line.',
                        ],
                    },
                    {
                        title: 'Zoom: identify the texture',
                        paragraphs: [
                            'In Zoom mode, the image starts heavily zoomed in and is revealed with each miss. On the first tries you only see colors and textures, so think in combinations: yellow and brown, blue and white, green and red. Scales, fur, stone and metal also hint at the type.',
                            'Use your misses. Each wrong guess reveals more of the image, so a guess with at least the right colors helps confirm or rule out a whole family.',
                        ],
                    },
                    {
                        title: 'Cry: listen to the rhythm, not just the sound',
                        paragraphs: [
                            'Cries from the early generations are short synthesized sounds that can be alike, while recent ones are longer and more detailed. The audio quality alone hints at the generation.',
                            'Many Pokémon in the anime say their own name, but game cries are something else. Notice the rhythm, the number of syllables and whether the sound rises or falls at the end. Big Pokémon tend to have deep cries; small ones, high-pitched cries.',
                        ],
                    },
                    {
                        title: 'Fusion and Gym',
                        paragraphs: [
                            'In Fusion, the image blends two Pokémon: one usually provides the body shape and the other the colors and face. Try to separate those two layers and guess the more obvious one first. The head shape and the color pattern rarely come from the same Pokémon.',
                            'In Gym, you need to find the Pokémon that doesn’t belong. Start with the leader’s type and look for the odd one out; if they all seem to share a type, compare generation, region or evolution stage.',
                        ],
                    },
                    {
                        title: 'Practice with the Pokédex',
                        paragraphs: [
                            'The best way to improve is to browse the Pokédex by generation. Open each Pokémon’s page, look at the official art, types and evolution line, and listen to the cry. After going through a whole region, that generation’s challenges get much easier.',
                        ],
                    },
                ],
            },
        },
    },
    {
        slug: 'po-arcano-e-deck-barato',
        world: 'hearthstone',
        updated: '2026-10-09',
        content: {
            pt: {
                title: 'Pó Arcano no Hearthstone: como gastar bem e montar um deck barato',
                description: 'Quanto custa criar cada carta, quando desencantar, como aproveitar pacotes e como montar um deck competitivo gastando pouco Pó Arcano.',
                intro: 'O Pó Arcano é o recurso que transforma cartas que você não usa em cartas que você quer. Como ele é lento de juntar, cada criação conta. Este guia explica os custos, quando vale desencantar e como montar um deck forte sem gastar uma fortuna.',
                sections: [
                    {
                        title: 'Quanto custa cada carta',
                        paragraphs: [
                            'Criar uma carta comum custa 40 de pó, uma rara custa 100, uma épica 400 e uma lendária 1.600. Ao desencantar, você recebe bem menos: 5, 20, 100 e 400, respectivamente. Ou seja, desencantar devolve só um quarto (ou menos) do valor de criação.',
                            'As versões douradas custam mais: 400, 800, 1.600 e 3.200 para criar, e devolvem 50, 100, 400 e 1.600 ao desencantar. Uma carta dourada repetida é uma das melhores fontes de pó, porque vale o mesmo que criar a versão comum em muitos casos.',
                        ],
                    },
                    {
                        title: 'Quando desencantar',
                        paragraphs: [
                            'Desencante sem medo as cópias extras: o jogo só deixa usar duas de cada carta e uma de cada lendária, e há um botão para desencantar todas as cópias excedentes de uma vez. Depois disso, pense duas vezes antes de desfazer cartas que você pode querer no futuro.',
                            'Fique de olho nas mudanças de balanceamento. Quando a Blizzard enfraquece uma carta, por um tempo ela pode ser desencantada pelo valor total de criação. É a melhor hora para trocar cartas que perderam força por pó cheio.',
                            'No fim de cada ano, as coleções mais antigas saem do formato Padrão. Se você só joga Padrão, cartas que vão rotacionar são boas candidatas a desencantar, mas lembre que elas continuam válidas no Livre.',
                        ],
                    },
                    {
                        title: 'Pacotes antes de pó',
                        paragraphs: [
                            'Em geral, abrir pacotes da coleção mais recente rende mais do que criar carta por carta. O jogo tem proteção contra repetidas: você não recebe uma lendária que já tem antes de completar todas as daquela coleção, e o mesmo vale para as demais raridades. Há também uma garantia de lendária nos primeiros pacotes de cada coleção nova e, depois, pelo menos uma a cada 40 pacotes.',
                            'O caminho mais eficiente costuma ser: abrir os pacotes que você ganhou, desencantar o excedente e só então criar as cartas que faltam para o deck que você quer.',
                        ],
                    },
                    {
                        title: 'Como montar um deck barato',
                        paragraphs: [
                            'Decks agressivos são os mais baratos e costumam ser muito eficientes na escalada de ranque. Eles usam lacaios de custo baixo, que geralmente são comuns e raros, e vencem antes que as lendárias caras do oponente façam diferença.',
                            'Comece pela coleção Básica, que é gratuita para todos e está sempre no Padrão. Ela tem cartas sólidas de todas as classes. Depois, gaste o pó nas cartas que aparecem em vários decks da mesma classe: elas continuam úteis mesmo se você mudar de estratégia.',
                            'Evite criar uma lendária só porque ela é forte em um único deck. Prefira lendárias neutras ou que aparecem em várias listas do meta. A biblioteca de cartas e a página de cada carta mostram em quais decks ela aparece, o que ajuda a decidir.',
                        ],
                    },
                    {
                        title: 'Use a ferramenta de coleção',
                        paragraphs: [
                            'Na Taverna dos Jogos você pode marcar as cartas que tem e ver quanto pó falta para montar cada deck do meta. Assim dá para escolher o deck mais próximo da sua coleção atual, em vez de começar do zero.',
                        ],
                    },
                ],
            },
            en: {
                title: 'Arcane Dust in Hearthstone: spending it well and building a cheap deck',
                description: 'How much each card costs to craft, when to disenchant, how to make the most of packs and how to build a competitive deck on a budget.',
                intro: 'Arcane Dust turns cards you don’t use into cards you want. Since it is slow to collect, every craft matters. This guide covers the costs, when it is worth disenchanting and how to build a strong deck without spending a fortune.',
                sections: [
                    {
                        title: 'How much each card costs',
                        paragraphs: [
                            'Crafting a common costs 40 dust, a rare 100, an epic 400 and a legendary 1,600. Disenchanting gives back far less: 5, 20, 100 and 400 respectively. In other words, disenchanting returns a quarter (or less) of the crafting cost.',
                            'Golden versions cost more: 400, 800, 1,600 and 3,200 to craft, and they return 50, 100, 400 and 1,600 when disenchanted. A duplicate golden card is one of the best sources of dust.',
                        ],
                    },
                    {
                        title: 'When to disenchant',
                        paragraphs: [
                            'Disenchant extra copies freely: you can only use two of each card and one of each legendary, and there is a button to disenchant every surplus copy at once. After that, think twice before dusting cards you may want later.',
                            'Watch for balance changes. When Blizzard nerfs a card, it can be disenchanted for its full crafting cost for a while. That is the best time to turn weakened cards into full dust.',
                            'Each year the oldest sets rotate out of Standard. If you only play Standard, rotating cards are good candidates for disenchanting, but remember they stay legal in Wild.',
                        ],
                    },
                    {
                        title: 'Packs before dust',
                        paragraphs: [
                            'In general, opening packs of the latest set gives more value than crafting card by card. The game has duplicate protection: you won’t get a legendary you already own before completing all of that set’s legendaries, and the same applies to the other rarities. There is also a guaranteed legendary within the first packs of each new set and, after that, at least one every 40 packs.',
                            'The most efficient path is usually: open the packs you earned, disenchant the surplus and only then craft the cards missing from the deck you want.',
                        ],
                    },
                    {
                        title: 'How to build a cheap deck',
                        paragraphs: [
                            'Aggressive decks are the cheapest and are often very effective for climbing the ladder. They use low-cost minions, usually commons and rares, and win before the opponent’s expensive legendaries make a difference.',
                            'Start with the Core set, which is free for everyone and always in Standard. It has solid cards for every class. Then spend dust on cards that show up in several decks of the same class: they stay useful even if you change strategy.',
                            'Avoid crafting a legendary just because it is strong in a single deck. Favor neutral legendaries or ones that appear in several meta lists. The card library and each card page show which decks it appears in, which helps you decide.',
                        ],
                    },
                    {
                        title: 'Use the collection tool',
                        paragraphs: [
                            'At Taverna dos Jogos you can mark the cards you own and see how much dust you need for each meta deck. That way you can pick the deck closest to your current collection instead of starting from scratch.',
                        ],
                    },
                ],
            },
        },
    },
    {
        slug: 'como-montar-deck-hearthstone',
        world: 'hearthstone',
        updated: '2026-10-09',
        content: {
            pt: {
                title: 'Como montar um deck de Hearthstone do zero',
                description: 'Regras básicas, curva de mana, compra de cartas, condição de vitória e mulligan: o passo a passo para montar e ajustar o seu próprio deck de Hearthstone.',
                intro: 'Copiar um deck pronto é o jeito mais rápido de começar, mas entender por que cada carta está ali é o que faz você ganhar mais partidas. Este guia mostra os princípios que guiam a montagem de qualquer deck.',
                sections: [
                    {
                        title: 'As regras do deck',
                        paragraphs: [
                            'Um deck tem exatamente 30 cartas, de uma única classe mais as cartas neutras. Você pode usar até duas cópias de cada carta, e só uma de cada lendária. Algumas cartas mudam essas regras, como as que exigem um deck sem repetidas, mas elas são exceção.',
                            'Escolha também o formato: o Padrão usa só as coleções dos últimos anos, e o Livre permite todas as cartas já lançadas. Comece pelo Padrão, que tem menos cartas para conhecer.',
                        ],
                    },
                    {
                        title: 'Curva de mana',
                        paragraphs: [
                            'Você ganha um cristal de mana por turno, então o deck precisa ter algo para fazer em cada um deles. A curva de mana é a distribuição dos custos: quantas cartas de 1, 2, 3 de mana e assim por diante.',
                            'Um deck equilibrado costuma ter muitas cartas de 2 e 3 de mana, algumas de 1 e 4, e poucas acima de 6. Decks agressivos concentram tudo no começo; decks de controle aceitam um início mais lento em troca de cartas poderosas no fim da partida.',
                        ],
                    },
                    {
                        title: 'Compra de cartas e condição de vitória',
                        paragraphs: [
                            'Ficar sem cartas na mão é uma das formas mais comuns de perder. Inclua algumas cartas que compram outras ou geram cartas extras, principalmente se o deck for mais lento.',
                            'Todo deck precisa de uma resposta clara para a pergunta "como eu venço?". Pode ser bater rápido no herói inimigo, dominar o tabuleiro com lacaios ou sobreviver até jogar uma combinação poderosa. Cartas que não ajudam esse plano são as primeiras a sair.',
                        ],
                    },
                    {
                        title: 'Mulligan: a mão inicial',
                        paragraphs: [
                            'No começo da partida você pode trocar as cartas da mão inicial. A regra geral é manter cartas baratas que você consegue jogar nos primeiros turnos e devolver as caras. Quem joga em segundo recebe A Moeda, que dá um cristal de mana extra uma vez e permite jogar uma carta de 2 de mana no primeiro turno.',
                        ],
                    },
                    {
                        title: 'Teste e ajuste',
                        paragraphs: [
                            'Nenhum deck nasce pronto. Jogue algumas partidas, anote quais cartas ficaram presas na mão e quais você sempre quis ter, e troque aos poucos. O montador de decks da Taverna dos Jogos mostra a curva de mana e o custo em pó enquanto você edita, e gera o código para importar no jogo.',
                        ],
                    },
                ],
            },
            en: {
                title: 'How to build a Hearthstone deck from scratch',
                description: 'Deck rules, mana curve, card draw, win conditions and mulligan: a step-by-step guide to building and tuning your own Hearthstone deck.',
                intro: 'Copying a ready-made deck is the fastest way to start, but understanding why each card is there is what wins more games. This guide covers the principles behind building any deck.',
                sections: [
                    {
                        title: 'Deck rules',
                        paragraphs: [
                            'A deck has exactly 30 cards from a single class plus neutral cards. You can run up to two copies of each card and only one of each legendary. Some cards bend these rules, such as those that require a deck with no duplicates, but they are the exception.',
                            'Pick a format too: Standard uses only the last few years of sets, and Wild allows every card ever released. Start with Standard, which has fewer cards to learn.',
                        ],
                    },
                    {
                        title: 'Mana curve',
                        paragraphs: [
                            'You gain one mana crystal per turn, so the deck needs something to do on each of them. The mana curve is the spread of costs: how many 1-, 2-, 3-mana cards and so on.',
                            'A balanced deck usually has many 2- and 3-mana cards, some 1- and 4-mana cards and few above 6. Aggressive decks pack everything early; control decks accept a slower start in exchange for powerful late-game cards.',
                        ],
                    },
                    {
                        title: 'Card draw and win condition',
                        paragraphs: [
                            'Running out of cards is one of the most common ways to lose. Include some cards that draw or generate extra cards, especially in slower decks.',
                            'Every deck needs a clear answer to "how do I win?". It can be hitting the enemy hero fast, controlling the board with minions or surviving until a powerful combo. Cards that don’t help that plan are the first to go.',
                        ],
                    },
                    {
                        title: 'Mulligan: your opening hand',
                        paragraphs: [
                            'At the start of the game you can replace cards from your opening hand. The general rule is to keep cheap cards you can play in the first turns and send back the expensive ones. The player going second gets The Coin, which grants one extra mana crystal once and lets you play a 2-mana card on turn one.',
                        ],
                    },
                    {
                        title: 'Test and tune',
                        paragraphs: [
                            'No deck is perfect on day one. Play a few games, note which cards got stuck in your hand and which ones you always wanted, and swap gradually. The Taverna dos Jogos deck builder shows the mana curve and dust cost as you edit, and generates the code to import into the game.',
                        ],
                    },
                ],
            },
        },
    },
    {
        slug: 'atributos-base-pokemon',
        world: 'pokemon',
        updated: '2026-10-20',
        content: {
            pt: {
                title: 'Atributos base dos Pokémon: o que cada número significa',
                description: 'Entenda PS, Ataque, Defesa, Ataque Especial, Defesa Especial e Velocidade, como ler o total de atributos e como IVs, EVs e naturezas mudam os valores finais.',
                intro: 'Toda página de Pokémon mostra seis números chamados atributos base. Eles definem o potencial da espécie: dois Pikachu podem ter valores finais diferentes, mas ambos partem da mesma base. Saber ler esses números ajuda a escolher o papel de cada Pokémon na equipe.',
                sections: [
                    {
                        title: 'Os seis atributos',
                        paragraphs: [
                            'PS (pontos de saúde) é quanto dano o Pokémon aguenta antes de desmaiar. Ataque aumenta o dano dos golpes físicos, como Terremoto ou Soco de Fogo, e Defesa reduz o dano físico recebido. Ataque Especial e Defesa Especial fazem o mesmo para golpes especiais, como Lança-chamas ou Raio de Gelo.',
                            'Velocidade decide quem age primeiro no turno. Em batalhas equilibradas, agir antes pode significar derrubar o adversário antes que ele ataque, por isso a Velocidade costuma ser tão disputada quanto o dano.',
                        ],
                    },
                    {
                        title: 'Como ler o total',
                        paragraphs: [
                            'Somar os seis valores dá uma ideia do poder geral. Formas iniciais costumam ficar abaixo de 300, Pokémon totalmente evoluídos ficam entre 450 e 550, e lendários passam de 580. Arceus, por exemplo, tem 720.',
                            'O total não conta a história inteira. Um Pokémon com 500 pontos bem distribuídos para o papel dele pode ser melhor do que outro com 530 espalhados em atributos que ele não usa. Um atacante físico com Ataque Especial alto está desperdiçando pontos.',
                        ],
                    },
                    {
                        title: 'Especialistas e extremos',
                        paragraphs: [
                            'Alguns Pokémon levam um atributo ao limite. Blissey tem 255 de PS, o máximo possível, e Shuckle tem 230 de Defesa e de Defesa Especial, mas é extremamente fraco no ataque. Esses extremos mostram que cada espécie foi pensada para uma função.',
                            'Na prática, procure o maior valor do Pokémon e monte a estratégia em volta dele: Velocidade e Ataque altos pedem um atacante rápido; PS e defesas altas pedem um Pokémon que segura golpes e desgasta o adversário.',
                        ],
                    },
                    {
                        title: 'IVs, EVs e naturezas',
                        paragraphs: [
                            'O valor final de cada atributo também depende de três fatores individuais. Os IVs são valores de 0 a 31 sorteados para cada Pokémon e funcionam como a "genética" dele. Os EVs são pontos ganhos em batalha ou com itens: no total, cada Pokémon pode acumular 510, com no máximo 252 em um único atributo.',
                            'A natureza aumenta um atributo em 10% e reduz outro em 10%, com exceção das naturezas neutras. Uma natureza Adamant (Firme), por exemplo, aumenta o Ataque e reduz o Ataque Especial, o que é perfeito para um atacante físico.',
                        ],
                    },
                    {
                        title: 'Use os atributos a seu favor',
                        paragraphs: [
                            'Na página de cada Pokémon da Taverna dos Jogos, as barras de atributos mostram onde ele se destaca, e o texto explica se ele tende a ser físico, especial, rápido ou resistente. Compare Pokémon do mesmo tipo antes de decidir quem leva na equipe.',
                        ],
                    },
                ],
            },
            en: {
                title: 'Pokémon base stats: what each number means',
                description: 'Understand HP, Attack, Defense, Special Attack, Special Defense and Speed, how to read the stat total and how IVs, EVs and natures change the final values.',
                intro: 'Every Pokémon page shows six numbers called base stats. They define the species’ potential: two Pikachu can have different final values, but both start from the same base. Reading these numbers helps you choose each Pokémon’s role on your team.',
                sections: [
                    {
                        title: 'The six stats',
                        paragraphs: [
                            'HP is how much damage the Pokémon can take before fainting. Attack boosts the damage of physical moves like Earthquake or Fire Punch, and Defense reduces physical damage taken. Special Attack and Special Defense do the same for special moves like Flamethrower or Ice Beam.',
                            'Speed decides who moves first each turn. In close battles, moving first can mean knocking out the opponent before it attacks, which is why Speed is as contested as damage.',
                        ],
                    },
                    {
                        title: 'Reading the total',
                        paragraphs: [
                            'Adding the six values gives a sense of overall power. First stages are usually below 300, fully evolved Pokémon sit between 450 and 550, and legendaries go above 580. Arceus, for example, has 720.',
                            'The total isn’t the whole story. A Pokémon with 500 points spread well for its role can beat one with 530 points in stats it doesn’t use. A physical attacker with high Special Attack is wasting points.',
                        ],
                    },
                    {
                        title: 'Specialists and extremes',
                        paragraphs: [
                            'Some Pokémon push a single stat to the limit. Blissey has 255 HP, the maximum possible, and Shuckle has 230 Defense and Special Defense but is extremely weak on offense. These extremes show that each species was designed for a job.',
                            'In practice, find the Pokémon’s highest stat and build around it: high Speed and Attack call for a fast attacker; high HP and defenses call for a Pokémon that tanks hits and wears the opponent down.',
                        ],
                    },
                    {
                        title: 'IVs, EVs and natures',
                        paragraphs: [
                            'Each stat’s final value also depends on three individual factors. IVs are values from 0 to 31 rolled for each Pokémon and act as its "genes". EVs are points earned in battle or with items: in total, a Pokémon can hold 510, with at most 252 in a single stat.',
                            'A nature raises one stat by 10% and lowers another by 10%, except for neutral natures. Adamant, for example, raises Attack and lowers Special Attack, which is perfect for a physical attacker.',
                        ],
                    },
                    {
                        title: 'Make the stats work for you',
                        paragraphs: [
                            'On each Pokémon page at Taverna dos Jogos, the stat bars show where it shines, and the text explains whether it leans physical, special, fast or bulky. Compare Pokémon of the same type before deciding who joins your team.',
                        ],
                    },
                ],
            },
        },
    },
    {
        slug: 'metodos-de-evolucao-pokemon',
        world: 'pokemon',
        updated: '2026-10-20',
        content: {
            pt: {
                title: 'Como os Pokémon evoluem: todos os métodos de evolução',
                description: 'Nível, pedras, troca, amizade, horário, local, golpes e casos especiais: um guia com todos os jeitos de evoluir um Pokémon e exemplos de cada um.',
                intro: 'A maioria dos Pokémon evolui só subindo de nível, mas muitos precisam de condições especiais. Conhecer os métodos evita ficar preso esperando uma evolução que nunca vai acontecer do jeito que você está tentando.',
                sections: [
                    {
                        title: 'Por nível',
                        paragraphs: [
                            'É o método mais comum: ao atingir um nível específico, o Pokémon evolui no fim da batalha. Charmander evolui no nível 16 e Charmeleon no 36. Se quiser adiar a evolução, por exemplo para aprender um golpe mais cedo, basta apertar o botão de cancelar durante a animação.',
                        ],
                    },
                    {
                        title: 'Pedras e itens',
                        paragraphs: [
                            'Pedras evolutivas, como a Pedra do Fogo, da Água, do Trovão, da Folha e da Lua, fazem a evolução acontecer na hora, em qualquer nível. Pikachu vira Raichu com a Pedra do Trovão, e Eevee pode virar Flareon, Vaporeon ou Jolteon dependendo da pedra.',
                            'Gerações mais novas adicionaram outras pedras, como a Pedra do Amanhecer, a do Crepúsculo, a Brilhante e a de Gelo. Alguns Pokémon também evoluem segurando um item ao subir de nível em certo horário, como Happiny com a Pedra Oval durante o dia.',
                        ],
                    },
                    {
                        title: 'Troca',
                        paragraphs: [
                            'Kadabra, Machoke, Graveler e Haunter evoluem quando são trocados com outro jogador. Outros precisam ser trocados segurando um item: Onix vira Steelix e Scyther vira Scizor com o Revestimento Metálico. Alguns jogos recentes oferecem alternativas para quem joga sozinho, então vale conferir a regra do jogo que você está jogando.',
                        ],
                    },
                    {
                        title: 'Amizade, horário e local',
                        paragraphs: [
                            'Pokémon como Pichu, Golbat e Eevee evoluem quando a amizade com o treinador está alta. Andar junto, vencer batalhas e usar itens de cuidado aumentam a amizade. No caso de Eevee, o horário importa: com amizade alta, ele vira Espeon de dia e Umbreon à noite.',
                            'Alguns evoluem só em lugares específicos, como perto de uma rocha musgosa ou gelada (Leafeon e Glaceon nas gerações em que esse é o método) ou em áreas com campo magnético (Magneton e Nosepass). Nos jogos mais recentes, várias dessas regras foram trocadas por pedras.',
                        ],
                    },
                    {
                        title: 'Golpes, gênero e casos curiosos',
                        paragraphs: [
                            'Saber um golpe pode ser a condição: Piloswine vira Mamoswine ao subir de nível sabendo Poder Ancestral. O gênero também conta: só Kirlia macho vira Gallade com a Pedra do Amanhecer.',
                            'Há métodos bem curiosos. Inkay evolui se o console estiver de cabeça para baixo na hora de subir de nível, e o Farfetch’d de Galar precisa acertar três golpes críticos na mesma batalha para virar Sirfetch’d. A página de cada Pokémon na Taverna mostra o método de cada etapa da linha evolutiva.',
                        ],
                    },
                ],
            },
            en: {
                title: 'How Pokémon evolve: every evolution method',
                description: 'Level, stones, trade, friendship, time of day, location, moves and special cases: a guide to every way to evolve a Pokémon, with examples.',
                intro: 'Most Pokémon evolve just by leveling up, but many need special conditions. Knowing the methods saves you from waiting for an evolution that will never happen the way you are trying.',
                sections: [
                    {
                        title: 'By level',
                        paragraphs: [
                            'This is the most common method: on reaching a set level, the Pokémon evolves after the battle. Charmander evolves at level 16 and Charmeleon at 36. To delay evolution, for example to learn a move earlier, just press cancel during the animation.',
                        ],
                    },
                    {
                        title: 'Stones and items',
                        paragraphs: [
                            'Evolution stones such as the Fire, Water, Thunder, Leaf and Moon Stone trigger evolution instantly at any level. Pikachu becomes Raichu with a Thunder Stone, and Eevee can become Flareon, Vaporeon or Jolteon depending on the stone.',
                            'Newer generations added more stones, like the Dawn, Dusk, Shiny and Ice Stone. Some Pokémon also evolve while holding an item when leveling up at a certain time, such as Happiny holding an Oval Stone during the day.',
                        ],
                    },
                    {
                        title: 'Trade',
                        paragraphs: [
                            'Kadabra, Machoke, Graveler and Haunter evolve when traded to another player. Others must be traded while holding an item: Onix becomes Steelix and Scyther becomes Scizor with a Metal Coat. Some recent games offer alternatives for solo players, so check the rules of the game you are playing.',
                        ],
                    },
                    {
                        title: 'Friendship, time and location',
                        paragraphs: [
                            'Pokémon like Pichu, Golbat and Eevee evolve when their friendship with the trainer is high. Walking together, winning battles and using care items raise friendship. For Eevee, time matters: with high friendship it becomes Espeon by day and Umbreon at night.',
                            'Some only evolve in specific places, like near a Moss or Ice Rock (Leafeon and Glaceon in the generations that use that method) or in areas with a magnetic field (Magneton and Nosepass). In recent games, several of these rules were replaced by stones.',
                        ],
                    },
                    {
                        title: 'Moves, gender and odd cases',
                        paragraphs: [
                            'Knowing a move can be the condition: Piloswine becomes Mamoswine when leveling up while knowing Ancient Power. Gender counts too: only male Kirlia becomes Gallade with a Dawn Stone.',
                            'There are some odd methods. Inkay evolves if the console is held upside down as it levels up, and Galarian Farfetch’d must land three critical hits in one battle to become Sirfetch’d. Each Pokémon page at the Tavern shows the method for every stage of its evolution line.',
                        ],
                    },
                ],
            },
        },
    },
    {
        slug: 'regioes-e-geracoes-pokemon',
        world: 'pokemon',
        updated: '2026-10-20',
        content: {
            pt: {
                title: 'As 9 gerações de Pokémon: regiões, jogos e novidades',
                description: 'De Kanto a Paldea: quais jogos lançaram cada geração, quantos Pokémon cada uma trouxe e as mecânicas que mudaram a série.',
                intro: 'A Pokédex Nacional tem 1025 Pokémon divididos em 9 gerações. Cada geração apresenta uma região nova, inspirada em um lugar real, e quase sempre traz uma mecânica que muda o jeito de jogar.',
                sections: [
                    {
                        title: 'Kanto, Johto e Hoenn',
                        paragraphs: [
                            'A primeira geração, com Red e Green (1996), apresentou Kanto e os 151 Pokémon originais, do Bulbasaur ao Mew. A segunda, com Gold e Silver (1999), levou os jogadores a Johto, somou 100 Pokémon e trouxe os tipos Aço e Sombrio, os itens segurados, a criação de ovos e o ciclo de dia e noite.',
                            'A terceira geração, com Ruby e Sapphire (2002), apresentou Hoenn e mais 135 Pokémon. Foi ela que criou as habilidades e as naturezas, duas mecânicas que até hoje definem como cada Pokémon funciona em batalha.',
                        ],
                    },
                    {
                        title: 'Sinnoh, Unova e Kalos',
                        paragraphs: [
                            'Em Diamond e Pearl (2006), a região de Sinnoh trouxe 107 Pokémon e uma mudança enorme: cada golpe passou a ser físico ou especial por conta própria, e não mais pelo tipo. Black e White (2010) apresentaram Unova com 156 Pokémon novos, o maior número de uma só geração.',
                            'X e Y (2013) levaram a série para Kalos, em gráficos 3D, com 72 Pokémon, o tipo Fada e as Mega Evoluções, que transformam alguns Pokémon temporariamente durante a batalha.',
                        ],
                    },
                    {
                        title: 'Alola, Galar e Paldea',
                        paragraphs: [
                            'Sun e Moon (2016) apresentaram Alola, as formas regionais, como o Vulpix de gelo, e os golpes Z. Sword e Shield (2019) foram para Galar com o Dinamax, que deixa os Pokémon gigantes por três turnos.',
                            'Scarlet e Violet (2022) apresentaram Paldea, o primeiro mundo totalmente aberto da série principal, e a Terastalização, que muda o tipo do Pokémon durante a batalha. Com as expansões, a Pokédex chegou a 1025.',
                        ],
                    },
                    {
                        title: 'Por que conhecer as gerações ajuda',
                        paragraphs: [
                            'Nos desafios da Taverna dos Jogos, saber de que geração um Pokémon é ajuda a diminuir as opções: o estilo da arte, o tipo de grito e até os nomes seguem padrões de cada época. A Pokédex do site permite filtrar por geração e ouvir os gritos de cada região.',
                        ],
                    },
                ],
            },
            en: {
                title: 'The 9 Pokémon generations: regions, games and new features',
                description: 'From Kanto to Paldea: which games launched each generation, how many Pokémon each one added and the mechanics that changed the series.',
                intro: 'The National Pokédex has 1025 Pokémon split into 9 generations. Each generation introduces a new region inspired by a real place, and almost always brings a mechanic that changes how the game is played.',
                sections: [
                    {
                        title: 'Kanto, Johto and Hoenn',
                        paragraphs: [
                            'The first generation, with Red and Green (1996), introduced Kanto and the original 151 Pokémon, from Bulbasaur to Mew. The second, with Gold and Silver (1999), took players to Johto, added 100 Pokémon and brought the Steel and Dark types, held items, breeding and the day-night cycle.',
                            'The third generation, with Ruby and Sapphire (2002), introduced Hoenn and 135 more Pokémon. It created abilities and natures, two mechanics that still define how each Pokémon works in battle.',
                        ],
                    },
                    {
                        title: 'Sinnoh, Unova and Kalos',
                        paragraphs: [
                            'In Diamond and Pearl (2006), the Sinnoh region brought 107 Pokémon and a huge change: each move became physical or special on its own instead of by type. Black and White (2010) introduced Unova with 156 new Pokémon, the most in a single generation.',
                            'X and Y (2013) took the series to Kalos in 3D graphics, with 72 Pokémon, the Fairy type and Mega Evolution, which temporarily transforms some Pokémon during battle.',
                        ],
                    },
                    {
                        title: 'Alola, Galar and Paldea',
                        paragraphs: [
                            'Sun and Moon (2016) introduced Alola, regional forms such as Ice-type Vulpix, and Z-Moves. Sword and Shield (2019) went to Galar with Dynamax, which makes Pokémon giant for three turns.',
                            'Scarlet and Violet (2022) introduced Paldea, the first fully open world in the main series, and Terastallization, which changes a Pokémon’s type mid-battle. With the expansions, the Pokédex reached 1025.',
                        ],
                    },
                    {
                        title: 'Why knowing the generations helps',
                        paragraphs: [
                            'In the Taverna dos Jogos challenges, knowing which generation a Pokémon is from narrows the options: the art style, the kind of cry and even the names follow each era’s patterns. The site’s Pokédex lets you filter by generation and hear the cries of each region.',
                        ],
                    },
                ],
            },
        },
    },
    {
        slug: 'padrao-e-livre-hearthstone',
        world: 'hearthstone',
        updated: '2026-10-20',
        content: {
            pt: {
                title: 'Padrão ou Livre no Hearthstone: diferenças e rotação anual',
                description: 'O que muda entre os formatos Padrão e Livre, como funciona a rotação anual das coleções e qual formato escolher para começar.',
                intro: 'O Hearthstone tem dois formatos principais de partidas ranqueadas. Entender a diferença entre eles ajuda a decidir em que cartas investir e evita gastar pó em algo que vai sair do formato em poucos meses.',
                sections: [
                    {
                        title: 'Formato Padrão',
                        paragraphs: [
                            'O Padrão usa só as coleções mais recentes, lançadas nos últimos dois anos, além da coleção Básica, que é gratuita para todos. Com menos cartas disponíveis, o meta muda a cada expansão e os decks ficam mais fáceis de entender.',
                            'É o formato recomendado para quem está começando: há menos cartas para conhecer, as listas de decks são mais estáveis e as coleções novas que você abrir vão ser úteis por mais tempo.',
                        ],
                    },
                    {
                        title: 'Formato Livre',
                        paragraphs: [
                            'No Livre vale qualquer carta já lançada desde 2014. Isso permite combinações muito fortes e decks que não existem mais no Padrão, mas também exige conhecer muito mais cartas e jogar contra estratégias rápidas e explosivas.',
                            'Cartas que saem do Padrão continuam valendo no Livre para sempre. Por isso, nada que você tem é perdido: só muda o formato em que pode ser usado.',
                        ],
                    },
                    {
                        title: 'Como funciona a rotação',
                        paragraphs: [
                            'Uma vez por ano, com a primeira expansão do novo ano, as coleções mais antigas do Padrão vão para o Livre. A coleção Básica também é renovada nessa época, com cartas que entram e saem.',
                            'Se você joga Padrão, pense na rotação antes de criar cartas caras: uma lendária de uma coleção que vai rotacionar em poucos meses rende menos do que uma de uma coleção recente. A página de cada carta e de cada coleção na Taverna mostra se ela está no Padrão ou só no Livre.',
                        ],
                    },
                    {
                        title: 'Qual escolher',
                        paragraphs: [
                            'Comece pelo Padrão se a sua coleção é pequena ou recente. Se você joga há anos e tem muitas cartas antigas, o Livre pode ser mais barato, já que você já tem a base. O montador de decks do site permite escolher o formato e avisa se alguma carta não é válida nele.',
                        ],
                    },
                ],
            },
            en: {
                title: 'Standard or Wild in Hearthstone: differences and yearly rotation',
                description: 'What changes between the Standard and Wild formats, how the yearly set rotation works and which format to pick when starting out.',
                intro: 'Hearthstone has two main ranked formats. Understanding the difference helps you decide which cards to invest in and avoids spending dust on something that will leave the format in a few months.',
                sections: [
                    {
                        title: 'Standard format',
                        paragraphs: [
                            'Standard uses only the most recent sets, released in the last two years, plus the Core set, which is free for everyone. With fewer cards available, the meta shifts with each expansion and decks are easier to understand.',
                            'It is the recommended format for newcomers: there are fewer cards to learn, deck lists are more stable and the new sets you open stay useful for longer.',
                        ],
                    },
                    {
                        title: 'Wild format',
                        paragraphs: [
                            'In Wild, any card released since 2014 is allowed. That enables very strong combos and decks that no longer exist in Standard, but it also requires knowing many more cards and facing fast, explosive strategies.',
                            'Cards that leave Standard stay legal in Wild forever. So nothing you own is lost: only the format where it can be used changes.',
                        ],
                    },
                    {
                        title: 'How rotation works',
                        paragraphs: [
                            'Once a year, with the first expansion of the new year, the oldest Standard sets move to Wild. The Core set is also refreshed at that time, with cards coming in and out.',
                            'If you play Standard, think about rotation before crafting expensive cards: a legendary from a set rotating in a few months is worth less than one from a recent set. Each card and set page at the Tavern shows whether it is in Standard or Wild only.',
                        ],
                    },
                    {
                        title: 'Which to choose',
                        paragraphs: [
                            'Start with Standard if your collection is small or recent. If you have played for years and own many older cards, Wild can be cheaper since you already have the foundation. The site’s deck builder lets you pick the format and warns you if a card isn’t legal in it.',
                        ],
                    },
                ],
            },
        },
    },
    {
        slug: 'classes-hearthstone',
        world: 'hearthstone',
        updated: '2026-10-20',
        content: {
            pt: {
                title: 'As 11 classes do Hearthstone: estilo de jogo de cada uma',
                description: 'Um resumo de cada classe do Hearthstone, do Cavaleiro da Morte ao Guerreiro: Poder Heroico, pontos fortes e o tipo de deck que cada uma costuma montar.',
                intro: 'Cada classe do Hearthstone tem um Poder Heroico próprio e cartas exclusivas que definem o estilo de jogo. Conhecer as classes ajuda tanto a escolher a sua quanto a prever o que o adversário pode fazer.',
                sections: [
                    {
                        title: 'Classes agressivas',
                        paragraphs: [
                            'O Caçador de Demônios joga rápido, com ataques baratos do próprio herói e cartas de Pária, que ficam mais fortes nas pontas da mão. O Caçador é a classe agressiva clássica: o Poder Heroico causa 2 de dano direto no herói inimigo, e as feras e segredos ajudam a pressionar.',
                            'O Paladino costuma encher o tabuleiro com lacaios pequenos, usando Escudo Divino e bônus de atributos. O Poder Heroico invoca um Recruta da Mão de Prata 1/1, útil para negociar e somar com efeitos que contam lacaios.',
                        ],
                    },
                    {
                        title: 'Classes de feitiços e combos',
                        paragraphs: [
                            'O Mago é a classe dos feitiços: dano direto, congelamento e geração de cartas. O Poder Heroico causa 1 de dano em qualquer alvo. O Ladino usa Combo, armas e cartas baratas para fazer várias jogadas no mesmo turno, e o Poder Heroico equipa uma adaga.',
                            'O Xamã mistura totens, elementais e Sobrecarga, que dá cartas fortes para o custo em troca de travar mana no turno seguinte. O Bruxo troca vida por cartas com o Poder Heroico, o que permite tanto decks agressivos quanto decks lentos cheios de demônios.',
                        ],
                    },
                    {
                        title: 'Classes de controle',
                        paragraphs: [
                            'O Guerreiro acumula Armadura com o Poder Heroico e usa armas e remoções para sobreviver até o fim da partida. O Sacerdote cura, copia cartas do adversário e controla o tabuleiro, com o Poder Heroico de cura.',
                            'O Druida é a classe do crescimento de mana: ganha cristais extras para jogar cartas caras antes do tempo, e muitas das suas cartas oferecem Escolha Um. O Cavaleiro da Morte, a classe mais recente, monta o deck com runas de Sangue, Gelo e Profano, que definem quais cartas pode usar, e gasta Cadáveres gerados quando lacaios morrem.',
                        ],
                    },
                    {
                        title: 'Como escolher a sua classe',
                        paragraphs: [
                            'Se você gosta de partidas rápidas, comece com Caçador, Caçador de Demônios ou Paladino. Se prefere pensar a longo prazo, experimente Guerreiro, Sacerdote ou Druida. Na biblioteca de cartas da Taverna dá para filtrar por classe e ver o que cada uma tem de exclusivo antes de montar um deck.',
                        ],
                    },
                ],
            },
            en: {
                title: 'The 11 Hearthstone classes: how each one plays',
                description: 'A summary of every Hearthstone class, from Death Knight to Warrior: Hero Power, strengths and the kind of deck each one tends to build.',
                intro: 'Each Hearthstone class has its own Hero Power and exclusive cards that shape its play style. Knowing the classes helps you pick yours and predict what your opponent might do.',
                sections: [
                    {
                        title: 'Aggressive classes',
                        paragraphs: [
                            'Demon Hunter plays fast, with cheap hero attacks and Outcast cards that get stronger at the edges of your hand. Hunter is the classic aggressive class: its Hero Power deals 2 damage straight to the enemy hero, and beasts and secrets keep the pressure on.',
                            'Paladin usually fills the board with small minions, using Divine Shield and stat buffs. Its Hero Power summons a 1/1 Silver Hand Recruit, useful for trading and for effects that count minions.',
                        ],
                    },
                    {
                        title: 'Spell and combo classes',
                        paragraphs: [
                            'Mage is the spell class: direct damage, freezing and card generation. Its Hero Power deals 1 damage to any target. Rogue uses Combo, weapons and cheap cards to make several plays in one turn, and its Hero Power equips a dagger.',
                            'Shaman mixes totems, elementals and Overload, which gives strong cards for their cost in exchange for locking mana next turn. Warlock trades health for cards with its Hero Power, enabling both aggressive decks and slow demon-filled decks.',
                        ],
                    },
                    {
                        title: 'Control classes',
                        paragraphs: [
                            'Warrior stacks Armor with its Hero Power and uses weapons and removal to survive into the late game. Priest heals, copies the opponent’s cards and controls the board, with a healing Hero Power.',
                            'Druid is the mana-ramp class: it gains extra crystals to play expensive cards early, and many of its cards offer Choose One. Death Knight, the newest class, builds decks with Blood, Frost and Unholy runes that decide which cards it can use, and spends Corpses created when minions die.',
                        ],
                    },
                    {
                        title: 'Choosing your class',
                        paragraphs: [
                            'If you like fast games, start with Hunter, Demon Hunter or Paladin. If you prefer long-term planning, try Warrior, Priest or Druid. The Tavern’s card library lets you filter by class and see what each one has exclusively before building a deck.',
                        ],
                    },
                ],
            },
        },
    },
    {
        slug: 'glossario-hearthstone',
        world: 'hearthstone',
        updated: '2026-10-20',
        content: {
            pt: {
                title: 'Glossário do Hearthstone: todas as palavras-chave explicadas',
                description: 'O que significam Grito de Guerra, Último Suspiro, Provocar, Investida, Descobrir e as outras palavras-chave do Hearthstone, com dicas de uso.',
                intro: 'As cartas do Hearthstone usam palavras-chave em negrito para resumir efeitos que se repetem. Este glossário explica cada uma delas em poucas palavras, para você entender qualquer carta de primeira.',
                sections: [
                    {
                        title: 'Como as palavras-chave funcionam',
                        paragraphs: [
                            'Uma palavra-chave é um atalho: em vez de descrever o efeito inteiro, a carta mostra só o nome em negrito, e o jogo explica ao passar o mouse por cima. Algumas descrevem quando algo acontece (Grito de Guerra, Último Suspiro), outras descrevem uma característica permanente (Provocar, Furtividade).',
                            'Os efeitos de Silenciar removem todas as palavras-chave e bônus de um lacaio. Por isso, cartas que dependem de Último Suspiro ou de auras são as mais prejudicadas por ele.',
                        ],
                    },
                ],
            },
            en: {
                title: 'Hearthstone glossary: every keyword explained',
                description: 'What Battlecry, Deathrattle, Taunt, Rush, Discover and the other Hearthstone keywords mean, with tips on how to use them.',
                intro: 'Hearthstone cards use bold keywords to sum up recurring effects. This glossary explains each one in a few words so you can understand any card at first sight.',
                sections: [
                    {
                        title: 'How keywords work',
                        paragraphs: [
                            'A keyword is a shortcut: instead of describing the whole effect, the card shows the name in bold, and the game explains it when you hover over it. Some describe when something happens (Battlecry, Deathrattle), others describe a permanent trait (Taunt, Stealth).',
                            'Silence effects remove every keyword and buff from a minion. That is why cards relying on Deathrattle or auras are hit hardest by it.',
                        ],
                    },
                ],
            },
        },
    },
    {
        slug: 'dicas-hearthdle',
        world: 'hearthstone',
        updated: '2026-10-20',
        content: {
            pt: {
                title: 'Dicas para o Hearthdle: como acertar a carta com menos tentativas',
                description: 'Estratégias para os desafios de Hearthstone da Taverna: como usar as pistas de classe, custo, atributos, raridade e coleção, e como reconhecer cartas pela arte e pelo texto.',
                intro: 'No Hearthdle, cada palpite revela se a classe, o custo, o ataque, a vida, a raridade e a coleção da carta secreta batem com a sua. Com a estratégia certa, dá para chegar à resposta em poucas tentativas mesmo entre milhares de cartas.',
                sections: [
                    {
                        title: 'Comece pelo meio',
                        paragraphs: [
                            'O primeiro palpite deve dividir as opções ao máximo. Um lacaio neutro de custo 3 ou 4, de uma coleção do meio da lista, informa muito: se a classe está errada, você descarta quase todas as neutras; se o custo está acima ou abaixo, sabe para que lado ir.',
                            'Evite começar com cartas extremas, como um feitiço de 0 de mana ou uma lendária de 10. Elas só acertam em casos raros e informam pouco quando erram.',
                        ],
                    },
                    {
                        title: 'Use as setas de custo e atributos',
                        paragraphs: [
                            'As pistas de custo, ataque e vida dizem se o valor certo é maior ou menor. Trate isso como uma busca: se a carta tem custo maior que 4 e menor que 7, o próximo palpite deve ser de custo 5 ou 6. Ataque e vida funcionam igual e ajudam a separar lacaios do mesmo custo.',
                            'Se você chutou um lacaio e o ataque aparece como errado sem nenhuma seta, a carta secreta não tem ataque: provavelmente é um feitiço ou um local. A coluna de tipo confirma essa suspeita no mesmo palpite.',
                        ],
                    },
                    {
                        title: 'Coleção e raridade fecham o cerco',
                        paragraphs: [
                            'Depois de acertar a classe e o custo, a coleção costuma ser a pista decisiva: a seta indica se a carta secreta é de uma coleção lançada antes ou depois da sua. Saber a ordem das expansões ajuda a escolher o próximo palpite. A página de coleções da Taverna lista todas em ordem, com as cartas de cada uma.',
                        ],
                    },
                    {
                        title: 'Arte e texto da carta',
                        paragraphs: [
                            'No modo Arte, a ilustração começa ampliada e desfocada. Preste atenção nas cores dominantes e no cenário: tons verdes e roxos lembram cartas de Bruxo e Caçador de Demônios, azul-gelo lembra Mago e Cavaleiro da Morte.',
                            'No modo Texto, procure palavras-chave e números. Efeitos como Sobrecarga, Combo e Pária revelam a classe na hora, e o valor de dano ou de cura costuma indicar o custo aproximado da carta.',
                        ],
                    },
                ],
            },
            en: {
                title: 'Hearthdle tips: how to find the card in fewer guesses',
                description: 'Strategies for the Tavern’s Hearthstone challenges: how to use the class, cost, stats, rarity and set clues, and how to recognize cards by art and text.',
                intro: 'In Hearthdle, each guess reveals whether the secret card’s class, cost, attack, health, rarity and set match yours. With the right strategy, you can reach the answer in a few tries even among thousands of cards.',
                sections: [
                    {
                        title: 'Start in the middle',
                        paragraphs: [
                            'Your first guess should split the options as much as possible. A neutral 3- or 4-cost minion from a mid-list set tells you a lot: if the class is wrong, you rule out almost every neutral card; if the cost is higher or lower, you know which way to go.',
                            'Avoid opening with extreme cards like a 0-mana spell or a 10-mana legendary. They only hit in rare cases and reveal little when they miss.',
                        ],
                    },
                    {
                        title: 'Use the cost and stat arrows',
                        paragraphs: [
                            'The cost, attack and health clues tell you whether the right value is higher or lower. Treat it like a search: if the card costs more than 4 and less than 7, the next guess should cost 5 or 6. Attack and health work the same way and help separate minions of the same cost.',
                            'If you guessed a minion and attack shows as wrong with no arrow, the secret card has no attack: it is probably a spell or a location. The type column confirms that on the same guess.',
                        ],
                    },
                    {
                        title: 'Set and rarity close the net',
                        paragraphs: [
                            'Once class and cost are right, the set is often the decisive clue: the arrow tells you whether the secret card comes from a set released before or after yours. Knowing the expansion order helps you pick the next guess. The Tavern’s sets page lists them all in order, with every card in each.',
                        ],
                    },
                    {
                        title: 'Card art and text',
                        paragraphs: [
                            'In Art mode, the illustration starts zoomed in and blurred. Watch the dominant colors and the setting: green and purple tones hint at Warlock and Demon Hunter, icy blue at Mage and Death Knight.',
                            'In Text mode, look for keywords and numbers. Effects like Overload, Combo and Outcast reveal the class instantly, and the damage or healing amount usually hints at the card’s approximate cost.',
                        ],
                    },
                ],
            },
        },
    },
    {
        slug: 'posicoes-league-of-legends',
        world: 'lol',
        updated: '2026-10-20',
        content: {
            pt: {
                title: 'Posições do League of Legends: topo, selva, meio, atirador e suporte',
                description: 'O que faz cada posição de Summoner\'s Rift, que tipo de campeão costuma ocupar cada rota e como escolher a sua.',
                intro: 'Toda partida de League of Legends em Summoner\'s Rift divide os cinco jogadores do time em posições. Entender o papel de cada uma ajuda a escolher campeões, a se posicionar nas lutas e a jogar em equipe.',
                sections: [
                    {
                        title: 'Topo (top)',
                        paragraphs: [
                            'A rota de cima é a mais isolada do mapa. Quem joga no topo costuma passar boa parte da partida em duelos de um contra um, por isso a posição recebe lutadores e tanques resistentes, capazes de aguentar pressão e de virar a linha de frente nas lutas de time.',
                            'Um bom topo sabe quando empurrar a rota e quando usar o Teleporte para ajudar o time em outro lugar do mapa.',
                        ],
                    },
                    {
                        title: 'Selva (jungle)',
                        paragraphs: [
                            'O caçador não tem rota fixa: ele derrota os monstros neutros da selva, ajuda as outras rotas com emboscadas e disputa objetivos como Dragões, o Arauto e o Barão. É a posição que mais exige leitura do mapa e controle do tempo.',
                            'Campeões com boa mobilidade, controle de grupo ou dano rápido costumam se dar bem na selva.',
                        ],
                    },
                    {
                        title: 'Meio (mid)',
                        paragraphs: [
                            'A rota do meio é a mais curta, o que permite chegar rápido às rotas vizinhas. Por isso recebe magos e assassinos, que causam muito dano em pouco tempo e podem ajudar o caçador em jogadas pelo mapa.',
                        ],
                    },
                    {
                        title: 'Atirador e suporte (rota inferior)',
                        paragraphs: [
                            'Na rota de baixo jogam dois campeões. O atirador causa dano contínuo com ataques básicos e fica muito forte com itens, mas é frágil no começo; o suporte protege o atirador, controla a visão do mapa com sentinelas e inicia ou impede lutas.',
                            'Suportes podem ser encantadores, que curam e dão escudos, ou tanques e iniciadores, que prendem os inimigos para o time atacar.',
                        ],
                    },
                    {
                        title: 'Como escolher a sua posição',
                        paragraphs: [
                            'Se você gosta de duelos, experimente o topo. Se prefere decidir o rumo da partida, tente a selva. Para quem gosta de dano e jogadas rápidas, o meio é o lugar. E se você gosta de jogar em dupla ou de ajudar o time, o atirador e o suporte são ótimos começos. A página de cada campeão na Taverna mostra a classe e a dificuldade para ajudar na escolha.',
                        ],
                    },
                ],
            },
            en: {
                title: 'League of Legends positions: top, jungle, mid, bot and support',
                description: 'What each Summoner\'s Rift position does, which kind of champion usually plays each lane and how to pick yours.',
                intro: 'Every League of Legends match on Summoner\'s Rift splits a team\'s five players into positions. Understanding each role helps you pick champions, position yourself in fights and play as a team.',
                sections: [
                    {
                        title: 'Top',
                        paragraphs: [
                            'The top lane is the most isolated on the map. Top laners spend much of the game in one-on-one duels, so the position suits durable fighters and tanks that can handle pressure and become the frontline in team fights.',
                            'A good top laner knows when to push the lane and when to use Teleport to help the team elsewhere on the map.',
                        ],
                    },
                    {
                        title: 'Jungle',
                        paragraphs: [
                            'The jungler has no fixed lane: they defeat neutral jungle monsters, help other lanes with ganks and contest objectives like Dragons, the Herald and Baron. It is the position that demands the most map awareness and timing.',
                            'Champions with good mobility, crowd control or burst damage usually do well in the jungle.',
                        ],
                    },
                    {
                        title: 'Mid',
                        paragraphs: [
                            'The mid lane is the shortest, letting you reach neighboring lanes quickly. That is why it suits mages and assassins, who deal a lot of damage in a short time and can help the jungler with plays around the map.',
                        ],
                    },
                    {
                        title: 'Bot lane: marksman and support',
                        paragraphs: [
                            'Two champions play the bottom lane. The marksman deals steady damage with basic attacks and scales hard with items but is fragile early; the support protects the marksman, controls vision with wards and starts or stops fights.',
                            'Supports can be enchanters, who heal and shield, or tanks and engagers, who lock down enemies for the team.',
                        ],
                    },
                    {
                        title: 'How to pick your position',
                        paragraphs: [
                            'If you like duels, try top. If you prefer steering the match, try jungle. For damage and fast plays, mid is the place. And if you enjoy playing as a pair or helping the team, marksman and support are great starts. Each champion page at the Tavern shows class and difficulty to help you choose.',
                        ],
                    },
                ],
            },
        },
    },
    {
        slug: 'primeiro-campeao-league-of-legends',
        world: 'lol',
        updated: '2026-10-20',
        content: {
            pt: {
                title: 'Como escolher o seu primeiro campeão no League of Legends',
                description: 'Dicas para quem está começando: como usar a dificuldade, a classe e o tipo de ataque para escolher campeões fáceis de aprender.',
                intro: 'Com mais de 170 campeões, escolher o primeiro pode assustar. A boa notícia é que dá para reduzir as opções olhando três coisas: a dificuldade, a classe e se o campeão ataca de perto ou de longe.',
                sections: [
                    {
                        title: 'Comece pela dificuldade',
                        paragraphs: [
                            'A Riot dá uma nota de 1 a 10 para a dificuldade de cada campeão. Para começar, prefira campeões com nota até 4: os kits são mais diretos, os combos são simples e erros pesam menos. Você encontra essa nota na página de cada campeão na Taverna.',
                        ],
                    },
                    {
                        title: 'Escolha um estilo que combine com você',
                        paragraphs: [
                            'Tanques e lutadores perdoam erros de posicionamento, porque aguentam mais dano. Atiradores e magos causam muito dano, mas precisam ficar a uma distância segura. Assassinos são empolgantes, mas exigem saber a hora certa de entrar e sair da luta.',
                            'Campeões que atacam à distância ajudam a aprender a manter distância dos inimigos; os de corpo a corpo ensinam a escolher bem a hora de entrar na briga.',
                        ],
                    },
                    {
                        title: 'Aprenda um ou dois campeões a fundo',
                        paragraphs: [
                            'Em vez de testar um campeão diferente a cada partida, jogue várias vezes com o mesmo. Você aprende o alcance das habilidades, o tempo de recarga e o que fazer contra cada adversário, e isso vale mais do que conhecer muitos campeões por cima.',
                            'Leia as dicas para jogar com e contra o campeão na página dele. E, para treinar o reconhecimento, jogue os desafios diários do LoLdle na Taverna.',
                        ],
                    },
                ],
            },
            en: {
                title: 'How to pick your first League of Legends champion',
                description: 'Beginner tips: how to use difficulty, class and attack type to pick champions that are easy to learn.',
                intro: 'With more than 170 champions, picking the first one can be daunting. The good news is you can narrow it down by looking at three things: difficulty, class and whether the champion attacks up close or from range.',
                sections: [
                    {
                        title: 'Start with difficulty',
                        paragraphs: [
                            'Riot rates each champion\'s difficulty from 1 to 10. To start, prefer champions rated 4 or lower: their kits are more direct, combos are simple and mistakes cost less. You can find this rating on each champion page at the Tavern.',
                        ],
                    },
                    {
                        title: 'Pick a style that suits you',
                        paragraphs: [
                            'Tanks and fighters forgive positioning mistakes because they take more damage. Marksmen and mages deal a lot of damage but must stay at a safe distance. Assassins are exciting but require knowing exactly when to dive in and get out.',
                            'Ranged champions help you learn to keep your distance; melee champions teach you to pick the right moment to join the fight.',
                        ],
                    },
                    {
                        title: 'Learn one or two champions deeply',
                        paragraphs: [
                            'Instead of trying a different champion every game, play the same one several times. You learn ability ranges, cooldowns and what to do against each opponent, which is worth more than knowing many champions superficially.',
                            'Read the tips for playing as and against the champion on their page. And to practice recognition, play the daily LoLdle challenges at the Tavern.',
                        ],
                    },
                ],
            },
        },
    },
]

export const getGuide = (slug: string) => GUIDES.find((guide) => guide.slug === slug)

export const ABOUT: Record<Language, GuideContent> = {
    pt: {
        title: 'Sobre a Taverna dos Jogos',
        description: 'Quem mantém a Taverna dos Jogos, para que o site existe, de onde vêm os dados e como entrar em contato.',
        intro: 'A Taverna dos Jogos é um site brasileiro, gratuito e feito por fã, que reúne ferramentas e desafios sobre Pokémon e Hearthstone em português e inglês.',
        sections: [
            {
                title: 'Quem mantém o site',
                paragraphs: [
                    'O site é criado e mantido por Sergio Bastos Jr, desenvolvedor brasileiro e jogador de longa data das duas franquias. Ele começou como uma Pokédex pessoal e cresceu para incluir desafios diários, duelos entre amigos e ferramentas de Hearthstone.',
                ],
            },
            {
                title: 'O que você encontra aqui',
                paragraphs: [
                    'Uma Pokédex com os 1025 Pokémon, com página própria para cada um mostrando tipos, fraquezas, atributos, evoluções e dados de criação. Desafios diários para reconhecer Pokémon pela silhueta, pela descrição, pelo grito e por outras pistas, com ranking e duelos.',
                    'Para Hearthstone, uma biblioteca com todas as cartas colecionáveis, uma página para cada carta e cada coleção, um montador de decks com código de importação, o controle da sua coleção com o custo em pó de cada deck e desafios no estilo Hearthdle.',
                    'Também publicamos guias próprios, como a tabela de tipos Pokémon e dicas para gastar bem o Pó Arcano.',
                ],
            },
            {
                title: 'De onde vêm os dados',
                paragraphs: [
                    'Os dados dos Pokémon vêm da PokéAPI, um projeto aberto mantido pela comunidade. Os dados das cartas de Hearthstone vêm do HearthstoneJSON e da API oficial da Blizzard. Os textos explicativos, as análises e os guias são escritos por nós.',
                ],
            },
            {
                title: 'Projeto de fã',
                paragraphs: [
                    'A Taverna dos Jogos não tem vínculo com a Nintendo, a Game Freak, a The Pokémon Company ou a Blizzard Entertainment. Pokémon e Hearthstone são marcas registradas dos seus respectivos donos. O site é gratuito e se mantém com anúncios e doações voluntárias.',
                ],
            },
            {
                title: 'Contato',
                paragraphs: [
                    'Encontrou um erro, tem uma sugestão ou quer falar sobre o projeto? Escreva para sergiobastosfisio@gmail.com.',
                ],
            },
        ],
    },
    en: {
        title: 'About Taverna dos Jogos',
        description: 'Who runs Taverna dos Jogos, why the site exists, where the data comes from and how to get in touch.',
        intro: 'Taverna dos Jogos is a free, fan-made Brazilian site with tools and challenges about Pokémon and Hearthstone, in Portuguese and English.',
        sections: [
            {
                title: 'Who runs the site',
                paragraphs: [
                    'The site is built and maintained by Sergio Bastos Jr, a Brazilian developer and longtime player of both franchises. It started as a personal Pokédex and grew to include daily challenges, duels with friends and Hearthstone tools.',
                ],
            },
            {
                title: 'What you’ll find here',
                paragraphs: [
                    'A Pokédex with all 1025 Pokémon, with a page for each one showing types, weaknesses, stats, evolutions and breeding data. Daily challenges to recognize Pokémon by silhouette, description, cry and other clues, with rankings and duels.',
                    'For Hearthstone, a library of every collectible card, a page for each card and set, a deck builder with import codes, collection tracking with the dust cost of each deck, and Hearthdle-style challenges.',
                    'We also publish our own guides, such as the Pokémon type chart and tips for spending Arcane Dust wisely.',
                ],
            },
            {
                title: 'Where the data comes from',
                paragraphs: [
                    'Pokémon data comes from PokéAPI, an open community project. Hearthstone card data comes from HearthstoneJSON and Blizzard’s official API. The explanations, analyses and guides are written by us.',
                ],
            },
            {
                title: 'Fan project',
                paragraphs: [
                    'Taverna dos Jogos is not affiliated with Nintendo, Game Freak, The Pokémon Company or Blizzard Entertainment. Pokémon and Hearthstone are trademarks of their respective owners. The site is free and supported by ads and voluntary donations.',
                ],
            },
            {
                title: 'Contact',
                paragraphs: [
                    'Found a mistake, have a suggestion or want to talk about the project? Write to sergiobastosfisio@gmail.com.',
                ],
            },
        ],
    },
}
