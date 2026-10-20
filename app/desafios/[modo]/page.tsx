import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ChallengeGame from "../../components/challenge/game";
import PageGuide from "../../components/pageGuide";
import JsonLd from "../../components/jsonLd";
import { MODE_META } from "../../components/challenge/modes";
import { getModeWorld, isChallengeMode, supportsDaily, type ChallengeMode } from "../../lib/challenge";
import { breadcrumbJsonLd, gameJsonLd, pageMetadata } from "../../lib/seo";
import { MESSAGES, type Language, type MessageKey } from "../../i18n/translations";

type Props = { params: Promise<{ modo: string }> };

const HOW_TO: Record<ChallengeMode, MessageKey> = {
  silhueta: 'howtoSilhueta',
  descricao: 'howtoDescricao',
  zoom: 'howtoZoom',
  som: 'howtoSom',
  fusao: 'howtoFusao',
  ginasio: 'howtoGinasio',
  infinito: 'howtoInfinito',
  'hs-atributos': 'howtoHsAtributos',
  'hs-arte': 'howtoHsArte',
  'hs-texto': 'howtoHsTexto',
  'lol-atributos': 'howtoLolAtributos',
  'lol-splash': 'howtoLolSplash',
  'lol-habilidade': 'howtoLolHabilidade',
  'anime-atributos': 'howtoAnimeAtributos',
  'anime-capa': 'howtoAnimeCapa',
  'anime-personagem': 'howtoAnimePersonagem',
  'tcg-atributos': 'howtoTcgAtributos',
  'tcg-arte': 'howtoTcgArte',
  'ygo-atributos': 'howtoYgoAtributos',
  'ygo-arte': 'howtoYgoArte',
  'ygo-efeito': 'howtoYgoEfeito',
};

const modeTitle = (mode: ChallengeMode, language: Language = 'pt') => {
  const title = MESSAGES[language][MODE_META[mode].title]
  if (getModeWorld(mode) === 'pokemon') return `${title} · ${language === 'en' ? 'Pokémon challenge' : 'Desafio Pokémon'}`
  if (getModeWorld(mode) === 'lol') return `${title} · LoLdle`
  if (getModeWorld(mode) === 'anime') return `${title} · Animedle`
  if (getModeWorld(mode) === 'tcg') return `${title} · TCG Pocket`
  if (getModeWorld(mode) === 'ygo') return `${title} · Ygodle`
  return title.includes('Hearthdle') ? title : `${title} · Hearthdle`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { modo } = await params;
  if (!isChallengeMode(modo)) return {};
  return pageMetadata({
    title: [modeTitle(modo, 'pt'), modeTitle(modo, 'en')],
    description: [
      `${MESSAGES.pt[MODE_META[modo].description]} ${MESSAGES.pt[HOW_TO[modo]]}`.slice(0, 300),
      `${MESSAGES.en[MODE_META[modo].description]} ${MESSAGES.en[HOW_TO[modo]]}`.slice(0, 300),
    ],
    path: `/desafios/${modo}`,
  });
}

export default async function ChallengeModePage({ params }: Props) {
  const { modo } = await params;
  if (!isChallengeMode(modo)) notFound();
  const name = MESSAGES.pt[MODE_META[modo].title];
  const paragraphs: MessageKey[] = supportsDaily(modo) ? [HOW_TO[modo], 'howtoDaily'] : [HOW_TO[modo]];
  return (
    <ChallengeGame mode={modo}>
      <PageGuide title="guideHowToPlay" titleVars={{ mode: MODE_META[modo].title }} paragraphs={paragraphs} />
      <JsonLd data={gameJsonLd({ name: modeTitle(modo), description: MESSAGES.pt[HOW_TO[modo]], path: `/desafios/${modo}` })} />
      <JsonLd data={breadcrumbJsonLd([['Desafios', '/desafios'], [name, `/desafios/${modo}`]])} />
    </ChallengeGame>
  );
}
