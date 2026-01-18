const handleShowMore = (section: 'recommended' | 'pinned' | 'permissioned') => {
  setExpandedSection(section);  // Expand the section
  setVisibleCounts(prev => ({
    ...prev,
    [section]: 15  // Reset to show 15 cards
  }));
};




const handleLoadMore = (section: 'recommended' | 'pinned' | 'permissioned') => {
  setVisibleCounts(prev => ({
    ...prev,
    [section]: prev[section] + 15  // Add 15 more cards
  }));
};



{pinnedCards.length > 0 && pinnedCards.length <= 5 && (
  <section className="pinned-section">
    <ScrollSection
      title="Pinned by Me"
      cards={pinnedCards}
      onExpand={handleExpand}
      onShowMore={() => handleShowMore('pinned')}
      onPinClick={handlePinClick}
    />
  </section>
)}

{pinnedCards.length > 5 && (
  <section className="pinned-section">
    <ScrollSection
      title="Pinned by Me"
      cards={pinnedCards.slice(0, Math.min(visibleCounts.pinned, pinnedCards.length))}
      onExpand={handleExpand}
      onShowMore={() => handleShowMore('pinned')}
      onPinClick={handlePinClick}
    />
  </section>
)}




{hasMore && (
  <div className="insight-load-more-container">
    <button className="insight-load-more-btn" onClick={onLoadMore}>
      Load More
    </button>
  </div>
)}
