function ExpandedSection({
    title,
    allCards,
    visibleCount,
    onExpand,
    onLoadMore,
    onShowLess,
    onCollapse,
    hasMore,
}: {
    title: string;
    allCards: InsightCard[];
    visibleCount: number;
    onExpand: (url: string, card: InsightCard) => void;
    onLoadMore?: () => void;
    onShowLess?: () => void;
    onCollapse: () => void;
    hasMore: boolean;
}) {
    const visibleCards = allCards.slice(0, visibleCount);
    const canShowLess = visibleCount > 15;

    return (
        <div className="insight-expanded-section">
            {/* Header */}
            <div className="insight-expanded-header">
                <h2 className="insight-section-title">{title}</h2>
                <button className="insight-collapse-btn" onClick={onCollapse}>
                    ✕
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="insight-expanded-content">
                <div className="insight-expanded-grid">
                    {visibleCards.map((card) => (
                        <Card key={card.id} card={card} onExpand={onExpand} />
                    ))}
                </div>
            </div>

            {/* Load More / Show Less Buttons */}
            <div className="insight-load-more-container">
                {canShowLess && onShowLess && (
                    <button
                        className="insight-show-less-btn"
                        onClick={onShowLess}
                    >
                        Show Less
                    </button>
                )}
                {hasMore && onLoadMore && (
                    <button
                        className="insight-load-more-btn"
                        onClick={onLoadMore}
                    >
                        Load More
                    </button>
                )}
            </div>
        </div>
    );
}
