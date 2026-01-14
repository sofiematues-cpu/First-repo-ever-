import { 
  getPinnedCards, 
  pinCard, 
  unpinCard,
  PinnedCardData,
  PinCardRequest 
} from '../../../api/api';



const [pinnedCards, setPinnedCards] = useState<InsightCard[]>([]);
const [pinnedCardsLoading, setPinnedCardsLoading] = useState(true);
const [pinnedCardsError, setPinnedCardsError] = useState<string | null>(null);





const loadPinnedCards = async () => {
  try {
    setPinnedCardsLoading(true);
    setPinnedCardsError(null);
    
    const response = await getPinnedCards();
    
    if (response.success) {
      const cards: InsightCard[] = response.data.map((pinnedCard: PinnedCardData) => ({
        ...pinnedCard.card_data,
      }));
      
      setPinnedCards(cards);
      console.log(`Loaded ${cards.length} pinned cards`);
    }
  } catch (error: any) {
    console.error('Error loading pinned cards:', error);
    setPinnedCardsError('Failed to load pinned cards');
    setPinnedCards([]);
  } finally {
    setPinnedCardsLoading(false);
  }
};







const handlePinClick = async (card: InsightCard) => {
  try {
    const isPinned = pinnedCards.some(c => c.id === card.id);
    
    if (isPinned) {
      await unpinCard(String(card.id));
      setPinnedCards(prev => prev.filter(c => c.id !== card.id));
      console.log(`Card unpinned: ${card.id}`);
    } else {
      const pinRequest: PinCardRequest = {
        card_id: String(card.id),
        card_type: 'insight',
        card_data: card,
        order: pinnedCards.length,
      };
      
      const response = await pinCard(pinRequest);
      
      if (response.success) {
        setPinnedCards(prev => [...prev, card]);
        console.log(`Card pinned: ${card.id}`);
      }
    }
  } catch (error: any) {
    console.error('Error toggling pin:', error);
    if (error.message === 'Card is already pinned') {
      alert('This card is already pinned!');
    } else if (error.message === 'Card is not pinned') {
      alert('This card is not pinned!');
    } else {
      alert('Failed to update pin status. Please try again.');
    }
  }
};






useEffect(() => {
  loadPinnedCards();
}, []);



function Card({ card, onExpand, onExpand: onExpandCard }: { card: InsightCard; onExpand: () => void; onExpandCard: (card: InsightCard) => void; }) {
  return (
    <div className="insight-card" onClick={() => onExpandCard(card)}>
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









<ScrollSection
  title="Pinned by Me"
  cards={pinnedPreview}
  onExpand={handleExpand}
  onShowMore={() => handleShowMore('pinned')}
/>







<ScrollSection
  title="Pinned by Me"
  cards={pinnedCardsLoading ? [] : pinnedCards}
  onExpand={handleExpand}
  onShowMore={() => handleShowMore('pinned')}
/>

{expandedSection === 'pinned' && (
  <>
    {pinnedCardsLoading ? (
      <div className="insight-loading-state">
        <span className="insight-loading-spinner">⏳</span>
        <p>Loading pinned cards...</p>
      </div>
    ) : pinnedCardsError ? (
      <div className="insight-error-state">
        <p>{pinnedCardsError}</p>
        <button onClick={loadPinnedCards}>Retry</button>
      </div>
    ) : pinnedCards.length === 0 ? (
      <div className="insight-empty-state">
        <div className="insight-empty-icon">📌</div>
        <h3>No Pinned Cards Yet</h3>
        <p>Click the pin icon on any card to add it here for quick access!</p>
      </div>
    ) : null}
  </>
)}










