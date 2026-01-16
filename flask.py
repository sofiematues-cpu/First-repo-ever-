const LoadPinnedCards = async () => {
  try {
    setPinnedCardsLoading(true);
    const response = await getPinnedCards();
    
    if (response.success && response.data) {
      const cards: InsightCard[] = response.data.map((pinnedCard) => ({
        id: pinnedCard.card_id,
        url_attempt_2_repo: pinnedCard.card_url,
        customized_name: '',
        site_name: '',
        url_attempt_1_url_id: '',
        url_attempt_2_simple: '',
        url_id: '',
        view_index: 0,
        view_name: '',
        view_repository_url: '',
        workbook_name: '',
        workbook_repo_url: '',
        last_accessed: '',
        is_public: true,
        view_count: 0,
        owner: ''
      }));
      setPinnedCards(cards);
    }
  } catch (error: any) {
    console.error('Error loading pinned cards:', error);
  } finally {
    setPinnedCardsLoading(false);
  }
};
------------------
const handlePinClick = async (card: InsightCard) => {
  const isPinned = pinnedCards.some((c) => c.id === card.id);
  
  try {
    if (isPinned) {
      const response = await unpinCard(card.id);
      if (response.success) {
        setPinnedCards((prev) => prev.filter((c) => c.id !== card.id));
        console.log('Card unpinned:', card.id);
      }
    } else {
      const pinRequest: PinnedCardRequest = {
        card_id: card.id,
        card_url: card.url_attempt_2_repo
      };
      const response = await pinCard(pinRequest);
      if (response.success) {
        setPinnedCards((prev) => [...prev, card]);
        console.log('Card pinned:', card.id);
      }
    }
  } catch (error: any) {
    console.error('Error toggling pin:', error);
  }
};
---------------- 
useEffect(() => {
  fetchDashboards();
  LoadPinnedCards();
}, []);
---------------
{pinnedCardsLoading ? (
  <div className="insight-loading-state">
    <div className="insight-loading-spinner"></div>
    <p>Loading pinned cards...</p>
  </div>
) : pinnedCardsError ? (
  <div className="insight-error-state">
    <p>{pinnedCardsError}</p>
  </div>
) : pinnedCards.length === 0 ? (
  <div className="insight-empty-state">
    <div className="insight-empty-icon"></div>
    <p>No Pinned Cards Yet</p>
    <p>Click the pin icon on any card to add it here for quick access!</p>
  </div>
) : null}
----------------
.insight-loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;
}

.insight-loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.insight-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
  text-align: center;
}

.insight-empty-icon {
  width: 64px;
  height: 64px;
  background: #f5f5f5;
  border-radius: 50%;
  margin-bottom: 16px;
}

.insight-error-state {
  padding: 40px;
  text-align: center;
  color: #e74c3c;
}

