import { ogCard } from "../../../../lib/ogImage";
import { championIcon, roleLabel } from "../../../../lib/lol";
import { getChampionPage } from "../../../../lib/lolServer";

export const alt = 'Campeão de League of Legends';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ campeao: string }> }) {
  const page = await getChampionPage((await params).campeao);
  if (!page) return ogCard({ title: 'League of Legends' });
  const { champion, version } = page;
  return ogCard({
    eyebrow: 'League of Legends',
    title: champion.n[0],
    subtitle: champion.t[0],
    badges: champion.g.map((role) => ({ label: roleLabel(role, 'pt'), color: '#c8aa6e' })),
    images: [championIcon(version, champion)],
    accent: '#0a3a4a',
  });
}
