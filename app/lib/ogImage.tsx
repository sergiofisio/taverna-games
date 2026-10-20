import { ImageResponse } from "next/og";
import { SITE_NAME } from "./site";

export const OG_SIZE = { width: 1200, height: 630 }

export const TYPE_HEX: Record<string, string> = {
    normal: '#a8a77a', fire: '#ee8130', water: '#6390f0', electric: '#f7d02c', grass: '#7ac74c', ice: '#96d9d6',
    fighting: '#c22e28', poison: '#a33ea1', ground: '#e2bf65', flying: '#a98ff3', psychic: '#f95587', bug: '#a6b91a',
    rock: '#b6a136', ghost: '#735797', dragon: '#6f35fc', dark: '#705746', steel: '#b7b7ce', fairy: '#d685ad',
}

interface OgCardProps {
    eyebrow?: string
    title: string
    subtitle?: string
    badges?: { label: string; color: string }[]
    images?: string[]
    accent?: string
}

export function ogCard({ eyebrow, title, subtitle, badges = [], images = [], accent = '#dc2626' }: OgCardProps) {
    return new ImageResponse(
        (
            <div style={{ width: '100%', height: '100%', display: 'flex', background: `linear-gradient(135deg, ${accent} 0%, #18181b 75%)`, color: 'white', padding: 56 }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, paddingRight: images.length ? 32 : 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {eyebrow && <div style={{ fontSize: 30, opacity: 0.85, textTransform: 'uppercase', letterSpacing: 2 }}>{eyebrow}</div>}
                        <div style={{ fontSize: title.length > 40 ? 58 : 76, fontWeight: 800, lineHeight: 1.05 }}>{title}</div>
                        {badges.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                                {badges.map((badge) => (
                                    <div key={badge.label} style={{ display: 'flex', background: badge.color, borderRadius: 999, padding: '8px 26px', fontSize: 30, fontWeight: 800, textTransform: 'uppercase', color: '#18181b' }}>
                                        {badge.label}
                                    </div>
                                ))}
                            </div>
                        )}
                        {subtitle && <div style={{ fontSize: 30, opacity: 0.9, lineHeight: 1.3, maxWidth: images.length ? 640 : 1080 }}>{subtitle}</div>}
                    </div>
                    <div style={{ display: 'flex', fontSize: 30, fontWeight: 800, opacity: 0.9 }}>{SITE_NAME} · tavernadosjogos.com.br</div>
                </div>
                {images.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        {images.map((src) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={src} src={src} alt="" width={images.length > 1 ? 230 : 420} height={images.length > 1 ? 230 : 420} style={{ objectFit: 'contain' }} />
                        ))}
                    </div>
                )}
            </div>
        ),
        OG_SIZE,
    )
}
