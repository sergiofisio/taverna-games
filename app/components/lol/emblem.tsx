export default function LolEmblem({ className = 'size-9' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
            <path d="M12 2 21 7v10l-9 5-9-5V7Z" fill="#091428" stroke="#c8aa6e" strokeWidth="1.5" />
            <path d="M8 7v10h8" fill="none" stroke="#c8aa6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
