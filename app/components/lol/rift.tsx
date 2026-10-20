import type { ReactNode } from "react";

export default function Rift({ children, className = 'text-slate-100' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`relative isolate flex min-w-0 flex-1 flex-col bg-[#010a13] ${className}`}>
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,#0a3a4a_0%,#091428_45%,#010a13_100%)]"
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-linear-to-r from-transparent via-[#c8aa6e] to-transparent" />
            {children}
        </div>
    )
}
