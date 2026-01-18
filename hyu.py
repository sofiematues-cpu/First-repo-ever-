const handleShowMore = (section: 'recommended' | 'permissioned' | 'pinned') => {
  if (section === 'recommended') {
    setShowMoreRecommended((prev) => !prev);
  } else if (section === 'permissioned') {
    setShowMorePermissioned((prev) => !prev);
  } else if (section === 'pinned') {
    setShowMorePinned((prev) => !prev);
  }
};
-------------
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
