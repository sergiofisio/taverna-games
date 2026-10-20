'use client'

import PokedexModal from "../pokedexModal";
import HsCardModal from "../hearthstone/cardModal";
import { useHsData } from "../hearthstone/data";
import ChampionModal from "../lol/championModal";
import { useLolData } from "../lol/data";
import AnimeModal from "../anime/animeModal";
import { useAnimePool } from "../anime/data";
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
    return <PokedexModal speciesId={id} navigationIds={NO_NAVIGATION} onClose={onClose} onNavigate={onNavigate} />
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
