import type { ReactNode } from "react";

export default function Sakura({ children, className = 'text-zinc-100' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`relative isolate flex min-w-0 flex-1 flex-col bg-[#140b24] ${className}`}>
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(236,72,153,0.35),transparent_40%),radial-gradient(circle_at_85%_70%,rgba(139,92,246,0.35),transparent_45%)]"
            />
            {children}
        </div>
    )
}
