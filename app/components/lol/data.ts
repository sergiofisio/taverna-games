'use client'

import { useAsyncData } from "../../hooks/useAsyncData";
import { loadLolData } from "../../lib/lol";

export const useLolData = () => useAsyncData('lol-champions', loadLolData)
