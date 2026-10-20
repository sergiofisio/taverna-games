export default function AnimeEmblem({ className = 'size-9' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
            {[0, 72, 144, 216, 288].map((angle) => (
                <ellipse key={angle} cx="12" cy="6.5" rx="3.2" ry="5" fill="#f9a8d4" stroke="#be185d" strokeWidth="0.8" transform={`rotate(${angle} 12 12)`} />
            ))}
            <circle cx="12" cy="12" r="2.2" fill="#fde047" />
        </svg>
    )
}
