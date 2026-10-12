'use client'

import { useEffect } from "react";
import { ADSENSE_CLIENT } from "../../lib/ads";

const SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`

function inject() {
    if (document.querySelector(`script[src="${SRC}"]`)) return
    const script = document.createElement('script')
    script.async = true
    script.crossOrigin = 'anonymous'
    script.src = SRC
    document.head.appendChild(script)
}

export default function AdScript() {
    useEffect(() => {
        if (!ADSENSE_CLIENT) return
        const schedule = () => {
            if ('requestIdleCallback' in window) window.requestIdleCallback(inject, { timeout: 3000 })
            else setTimeout(inject, 1500)
        }
        if (document.readyState === 'complete') schedule()
        else window.addEventListener('load', schedule, { once: true })
        return () => window.removeEventListener('load', schedule)
    }, [])

    return null
}
