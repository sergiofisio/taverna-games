'use client'

import PokedexModal from "../pokedexModal";
import HsCardModal from "../hearthstone/cardModal";
import { useHsData } from "../hearthstone/data";
import ChampionModal from "../lol/championModal";
import { useLolData } from "../lol/data";
import AnimeModal from "../anime/animeModal";
import { useAnimePool } from "../anime/data";
import { TcgpCardModal, useTcgpData } from "../tcgp/shared";
import { TCGP_POOL } from "../../lib/tcgp";
import { YgoCardModal, useYgoPool } from "../ygo/shared";
import { YGO_POOL } from "../../lib/ygo";
import type { GameWorld } from "../../lib/challenge";

const NO_NAVIGATION: number[] = []

interface DetailModalProps {
    world: GameWorld
    id: number | null
    onClose: () => void
    onNavigate: (id: number) => void
}

export default function DetailModal({ world, id, onClose, onNavigate }: DetailModalProps) {
    if (world === 'hearthstone') return <CardDetailModal id={id} onClose={onClose} />
    if (world === 'lol') return <ChampionDetailModal id={id} onClose={onClose} />
    if (world === 'anime') return <AnimeDetailModal id={id} onClose={onClose} />
    if (world === 'tcg') return <TcgpDetailModal id={id} onClose={onClose} />
    if (world === 'ygo') return <YgoDetailModal id={id} onClose={onClose} />
    return <PokedexModal speciesId={id} navigationIds={NO_NAVIGATION} onClose={onClose} onNavigate={onNavigate} />
}

function YgoDetailModal({ id, onClose }: { id: number | null; onClose: () => void }) {
    const state = useYgoPool()
    const card = id === null || state?.status !== 'success' ? null : state.data.byId.get(YGO_POOL[id]) ?? null
    return <YgoCardModal card={card} onClose={onClose} />
}

function TcgpDetailModal({ id, onClose }: { id: number | null; onClose: () => void }) {
    const state = useTcgpData()
    return <TcgpCardModal data={state?.status === 'success' ? state.data : null} cardId={id === null ? null : TCGP_POOL[id] ?? null} onClose={onClose} />
}

function AnimeDetailModal({ id, onClose }: { id: number | null; onClose: () => void }) {
    const state = useAnimePool()
    return <AnimeModal pool={state?.status === 'success' ? state.data : null} animeId={id} onClose={onClose} />
}

function ChampionDetailModal({ id, onClose }: { id: number | null; onClose: () => void }) {
    const state = useLolData()
    return <ChampionModal data={state?.status === 'success' ? state.data : null} championKey={id} onClose={onClose} />
}

function CardDetailModal({ id, onClose }: { id: number | null; onClose: () => void }) {
    const state = useHsData()
    return <HsCardModal data={state?.status === 'success' ? state.data : null} dbfId={id} onClose={onClose} />
}
