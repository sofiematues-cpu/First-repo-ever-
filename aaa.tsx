// 🆕 ADD these imports after your existing imports
import { 
  getPinnedCards, 
  pinCard, 
  unpinCard,
  PinnedCardData,
  PinCardRequest 
} from '../../../api/api';
------------------------------
export default function Insights() {
  // All your useState declarations...
  const [pinnedCards, setPinnedCards] = useState<InsightCard[]>([]);
  const [pinnedCardsLoading, setPinnedCardsLoading] = useState(true);
  // ... etc

  // 🆕 MOVE Card component HERE (inside Insights function)
  function Card({ card, onExpand, onExpand: onExpandCard }: { card: InsightCard; onExpand: () => void; onExpandCard: (card: InsightCard) => void; }) {
    const isPinned = pinnedCards.some(c => c.id === card.id);
    
    return (
      <div className="insight-card" onClick={() => onExpandCard(card)}>
        <button
          className={`insight-pin-button ${isPinned ? 'pinned' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            handlePinClick(card);
          }}
          title={isPinned ? 'Unpin this card' : 'Pin this card'}
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill={isPinned ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2L14.5 9.5L22 9.5L16 14L18 21L12 16.5L6 21L8 14L2 9.5L9.5 9.5Z" />
          </svg>
        </button>
        
        <div className="insight-card-icon">
          {card.is_public ? '🌐' : '🔒'}
        </div>
        <div className="insight-card-content">
          <div className="insight-card-header">
            <h3>{card.customized_name || card.view_name}</h3>
          </div>
          <div className="insight-card-actions">
            <span className="view-count">👁 {card.view_count || 0}</span>
          </div>
        </div>
      </div>
    );
  }

  // loadPinnedCards function...
  // handlePinClick function...
  // useEffect...
  
  return (
    // your JSX...
  );
}
-------------------
