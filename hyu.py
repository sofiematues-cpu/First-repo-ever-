const LoadPinnedCards = async () => {
  try {
    setPinnedCardsLoading(true);
    const response = await getPinnedCards();
    
    if (response.success && response.data) {
      const cards: InsightCard[] = response.data.map((pinnedCard: any) => {
        return {
          id: pinnedCard.card_id,
          customized_name: pinnedCard.customized_name || '',
          url_id: pinnedCard.url_id || '',
          view_name: pinnedCard.view_name || '',
          view_repository_url: pinnedCard.view_repository_url || '',
          view_index: pinnedCard.view_index || 0,
          workbook_name: pinnedCard.workbook_name || '',
          workbook_repo_url: pinnedCard.workbook_repo_url || '',
          site_name: pinnedCard.site_name || '',
          last_accessed: pinnedCard.last_accessed || '',
          is_public: pinnedCard.is_public || false,
          url_attempt_1_url_id: pinnedCard.url_attempt_1_url_id || '',
          url_attempt_2_repo: pinnedCard.url_attempt_2_repo || '',
          url_attempt_2_simple: pinnedCard.url_attempt_2_repo || '', // Use url_attempt_2_repo as fallback
          view_count: 0,  // Default value
          owner: '',      // Default value
        };
      });
      setPinnedCards(cards);
    }
  } catch (error) {
    console.error('Error loading pinned cards:', error);
  } finally {
    setPinnedCardsLoading(false);
  }
};




{pinnedCards.length > 0 && (
  <section className="pinned-section">
    <ScrollSection
      title="Pinned by Me"
      cards={pinnedCards.slice(0, showMorePinned ? pinnedCards.length : 3)}
      onExpand={handleExpand}
      onShowMore={() => handleShowMore('pinned')}
      onPinClick={handlePinClick}
    />
  </section>
)}

{expandedSection === 'pinned' && (
  <>{pinnedCardsLoading ? (
    <div className="insight-loading-state">
      <div className="insight-loading-spinner"></div>
      <p>Loading pinned cards...</p>
    </div>
  ) : (
    <ScrollSection 
      title="Pinned by Me" 
      cards={pinnedCards} 
      onExpand={handleExpand} 
      onShowMore={() => handleShowMore('pinned')}
      onPinClick={handlePinClick}
    />
  )}
  </>
)}



