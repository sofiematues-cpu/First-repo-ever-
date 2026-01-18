
{pinnedCards.length > 0 && pinnedCards.length <= 5 && (
  <section className="pinned-section">
    <ScrollSection
      title="Pinned by Me"
      cards={pinnedCards}
      onExpand={handleExpand}
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
