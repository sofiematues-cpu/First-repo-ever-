export interface PinnedCard {
  card_id: number;
  customized_name: string;
  url_id: string;
  view_name: string;
  view_repository_url: string;
  view_index: number;
  workbook_name: string;
  workbook_repo_url: string;
  site_name: string;
  site_url_namespace: string;
  last_accessed: string;
  is_public: boolean;
  url_attempt_1_url_id: string;
  url_attempt_2_repo: string;
  url_attempt_3_simple: string;
  pinned_at: string;
}

export interface PinCardResponse {
  success: boolean;
  message?: string;
  data?: PinnedCard[];
  error?: string;
}
----------------------
const LoadPinnedCards = async () => {
  try {
    setPinnedCardsLoading(true);
    const response = await getPinnedCards();
    if (response.success && response.data) {
      const cards: InsightCard[] = response.data.map((pinnedCard: any) => ({
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
