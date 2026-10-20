'use client'

import { useAsyncData } from "../../hooks/useAsyncData";
import { loadAnimePool } from "../../lib/anime";

export const useAnimePool = () => useAsyncData('anime-pool', loadAnimePool)
