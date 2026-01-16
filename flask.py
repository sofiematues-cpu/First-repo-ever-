const handlePinClick = async (card: InsightCard) => {
  const isPinned = pinnedCards.some((c) => c.id === card.id);
  
  try {
    if (isPinned) {
      const response = await unpinCard(card.id);
      if (response.success) {
        setPinnedCards((prev) => prev.filter((c) => c.id !== card.id));
      }
    } else {
      const response = await pinCard({
        card_id: card.id,
        card_url: card.url_attempt_2_repo
      });
      if (response.success) {
        setPinnedCards((prev) => [...prev, card]);
      }
    }
  } catch (error: any) {
    console.error('Error toggling pin:', error);
  }
};
