function Card({ card, onExpand }: { card: InsightCard; onExpand: (url: string, card: InsightCard) => void; }) {
  const isPinned = pinnedCards.some(c => c.id === card.id);
  
  return (
    <div className="insight-card" onClick={() => onExpand(card.url_attempt_2_repo, card)}>
      {/* 🆕 ONLY NEW THING: Pin icon - appears on hover */}
      <button
        className={`insight-pin-button ${isPinned ? 'pinned' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          handlePinClick(card);
        }}
        title={isPinned ? 'Unpin this card' : 'Pin this card'}
      >
        📌
      </button>
      
      {/* YOUR ORIGINAL CARD CONTENT - UNTOUCHED */}
      <div className="insight-card-icon">
        <svg className="icon-overlay-dashboard" viewBox="0 0 32 32" strokeWidth={1.5} />
      </div>
      <div className="insight-card-content">
        <div className="insight-card-header">
          <div className="insight-card-title">
            <h3>{card.customized_name || card.view_name}</h3>
          </div>
          <div className="insight-card-tag">{card.site_name}</div>
        </div>
        <div className="insight-card-subtitle">{card.workbook_name}</div>
      </div>
    </div>
  );
}
------------------
/* Pin button - simple emoji, shows on hover */
.insight-pin-button {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.insight-card:hover .insight-pin-button {
  opacity: 1;
}

.insight-pin-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.insight-pin-button.pinned {
  opacity: 1;
  background: #3498db;
}
-------------------