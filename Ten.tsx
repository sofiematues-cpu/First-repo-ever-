function TableauModal({ url, onClose, card }: { url: string; onClose: () => void; card: InsightCard | null }) {
  if (!url || !card) return null;

  const getTimeSinceRefresh = (lastAccessed: string): string => {
    if (!lastAccessed) return 'Unknown';
    const cleaned = lastAccessed.replace(/[\\\/\[\]$']+/g, '');
    const updated = new Date(cleaned);
    if (isNaN(updated.getTime())) return 'Unknown';
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    
    return updated.toLocaleString('en-US', options).replace(',', ' |');
  };

  const getDataQuality = (): string => {
    const random = Math.floor(Math.random() * 3);
    return ['Bronze', 'Silver', 'Gold'][random];
  };

  const dataQuality = getDataQuality();

  return (
    <div className="insight-modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="insight-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="insight-modal-header">
          <div className="insight-modal-header-left">
            <h2>{card.customized_name || card.view_name}</h2>
            <button className="insight-info-icon" title="Dashboard Information">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            </button>
          </div>
          
          <div className="insight-modal-header-right">
            <span className="insight-modal-stat">
              Last Refreshed: {getTimeSinceRefresh(card.last_accessed)}
            </span>
            <span className="insight-modal-divider">|</span>
            <span className="insight-modal-stat">
              Load Time: 13s
            </span>
            <span className="insight-modal-divider">|</span>
            <span className="insight-modal-stat">
              Data Quality: <span className={`insight-quality-badge insight-quality-${dataQuality.toLowerCase()}`}>{dataQuality}</span>
            </span>
            <button onClick={onClose} className="insight-modal-close">✕</button>
          </div>
        </div>

        <iframe src={url} className="insight-iframe" />
      </div>
    </div>
  );
}
------------
function ExpandedSection({
  title,
  allCards,
  visibleCount,
  onExpand,
  onLoadMore,
  onCollapse,
  hasMore,
}: {
  title: string;
  allCards: InsightCard[];
  visibleCount: number;
  onExpand: (url: string, card: InsightCard) => void;  // CHANGED
  onLoadMore: () => void;
  onCollapse: () => void;
  hasMore: boolean;
}) {
-----------------
.insight-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #008043 0%, #00a854 100%);
  color: #ffffff;
  min-height: 60px;
}

.insight-modal-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.insight-modal-header-left h2 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: #ffffff;
}

.insight-info-icon {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #ffffff;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.insight-info-icon:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.insight-modal-header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8125rem;
}

.insight-modal-stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffffff;
  white-space: nowrap;
}

.insight-modal-divider {
  color: rgba(255, 255, 255, 0.5);
}

.insight-quality-badge {
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.insight-quality-bronze {
  background: #CD7F32;
  color: #ffffff;
}

.insight-quality-silver {
  background: #C0C0C0;
  color: #1f2937;
}

.insight-quality-gold {
  background: #FFD700;
  color: #1f2937;
}

.insight-modal-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #ffffff;
  font-size: 1.5rem;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
  margin-left: 0.5rem;
}

.insight-modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}
