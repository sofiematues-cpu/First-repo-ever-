const API_BASE_URL = '/api';

export interface PinnedCard {
  card_id: number;
  card_url: string;
  pinned_at: string;
}

export interface PinCardRequest {
  card_id: number;
  card_url: string;
}

export interface PinCardResponse {
  success: boolean;
  message?: string;
  data?: PinnedCard[];
  error?: string;
}

export const getPinnedCards = async (): Promise<PinCardResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/pinned-cards/`, {
      method: 'GET',
      credentials: 'include',
    });
    return await response.json();
  } catch (error: any) {
    console.error('Error fetching pinned cards:', error);
    throw error;
  }
};

export const pinCard = async (request: PinCardRequest): Promise<PinCardResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/pinned-cards/pin/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(request),
    });
    return await response.json();
  } catch (error: any) {
    console.error('Error pinning card:', error);
    if (error.response?.status === 400) {
      throw new Error('Card is already pinned');
    }
    if (error.response?.status === 400) {
      throw new Error('Invalid card data');
    }
    throw error;
  }
};

export const unpinCard = async (cardId: number): Promise<PinCardResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/pinned-cards/unpin/${cardId}/`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return await response.json();
  } catch (error: any) {
    console.error('Error unpinning card:', error);
    if (error.response?.status === 404) {
      throw new Error('Card is not pinned');
    }
    throw error;
  }
};
