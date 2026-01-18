const handleShowMore = (section: 'recommended' | 'permissioned' | 'pinned') => {
  if (section === 'recommended') {
    setShowMoreRecommended(true);
  } else if (section === 'permissioned') {
    setShowMorePermissioned(true);
  } else if (section === 'pinned') {
    setShowMorePinned(true);
  }
};
---------------------
const LoadPinnedCards = async () => {
  try {
    setPinnedCardsLoading(true);
    const response = await getPinnedCards();
    if (response.success && response.data) {
      const cards: InsightCard[] = response.data.map((pinnedCard) => ({
        id: pinnedCard.card_id,
        customized_name: pinnedCard.customized_name || '',
        url_id: pinnedCard.url_id || '',
        view_name: pinnedCard.view_name || '',
        view_repository_url: pinnedCard.view_repository_url || '',
        view_index: pinnedCard.view_index || 0,
        workbook_name: pinnedCard.workbook_name || '',
        workbook_repo_url: pinnedCard.workbook_repo_url || '',
        site_name: pinnedCard.site_name || '',
        site_url_namespace: pinnedCard.site_url_namespace || '',
        last_accessed: pinnedCard.last_accessed || '',
        is_public: pinnedCard.is_public || false,
        url_attempt_1_url_id: pinnedCard.url_attempt_1_url_id || '',
        url_attempt_2_repo: pinnedCard.url_attempt_2_repo || '',
        url_attempt_3_simple: pinnedCard.url_attempt_3_simple || '',
      }));
      setPinnedCards(cards);
    }
  } catch (error) {
    console.error('Error loading pinned cards:', error);
  } finally {
    setPinnedCardsLoading(false);
  }
};
-------------------
class PinnedCardSerializer(serializers.ModelSerializer):
    """Serializer for returning pinned cards - returns all fields with correct names"""
    
    # Map database field names to API response names
    card_id = serializers.IntegerField(source='card_id')
    
    class Meta:
        model = PinnedCard
        fields = [
            'card_id',
            'customized_name',
            'url_id',
            'view_name',
            'view_repository_url',
            'view_index',
            'workbook_name',
            'workbook_repo_url',
            'site_name',
            'site_url_namespace',
            'last_accessed',
            'is_public',
            'url_attempt_1_url_id',
            'url_attempt_2_repo',
            'url_attempt_3_simple',
            'pinned_at',
        ]
---------------------