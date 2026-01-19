{pinnedCards.length > 0 && expandedSection !== 'pinned' && (
  <section className="pinned-section">
    <ScrollSection
      title="Pinned by Me"
      cards={pinnedCards.slice(0, Math.min(5, pinnedCards.length))}
      onExpand={handleExpand}
      onShowMore={pinnedCards.length > 5 ? () => handleShowMore('pinned') : undefined}
      onPinClick={handlePinClick}
    />
  </section>
)}

{expandedSection === 'pinned' && (
  {pinnedCardsLoading ? (
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
)}
