// ============================================
// 🆕 PINNED CARDS API FUNCTIONS
// ============================================

export interface PinnedCardData {
  id?: number;
  card_id: string;
  card_type: string;
  card_data: any;
  order?: number;
  pinned_at?: string;
  updated_at?: string;
}

export interface PinCardRequest {
  card_id: string;
  card_type: string;
  card_data: any;
  order?: number;
}

export interface PinnedCardsResponse {
  success: boolean;
  count: number;
  data: PinnedCardData[];
}

export interface PinCardResponse {
  success: boolean;
  message: string;
  data: PinnedCardData;
}

export interface UnpinCardResponse {
  success: boolean;
  message: string;
}

export const getPinnedCards = async (): Promise<PinnedCardsResponse> => {
  try {
    const response = await api.get('/api/pinned-cards/');
    return response.data;
  } catch (error) {
    console.error('Error fetching pinned cards:', error);
    throw error;
  }
};

export const pinCard = async (request: PinCardRequest): Promise<PinCardResponse> => {
  try {
    const response = await api.post('/api/pinned-cards/pin/', request);
    return response.data;
  } catch (error: any) {
    console.error('Error pinning card:', error);
    if (error.response?.status === 409) {
      throw new Error('Card is already pinned');
    }
    if (error.response?.status === 400) {
      throw new Error('Invalid card data');
    }
    throw error;
  }
};

export const unpinCard = async (cardId: string): Promise<UnpinCardResponse> => {
  try {
    const response = await api.post('/api/pinned-cards/unpin/', {
      card_id: cardId
    });
    return response.data;
  } catch (error: any) {
    console.error('Error unpinning card:', error);
    if (error.response?.status === 404) {
      throw new Error('Card is not pinned');
    }
    throw error;
  }
};
----------------------
import { useEffect, useState } from 'react';
import './insights.css';
import { useAuth } from '../../../contexts/AuthProvider';
import Header from '../../layout/Header';
import Sidebar from '../../layout/Sidebar';
import { 
  getPinnedCards, 
  pinCard, 
  unpinCard,
  PinnedCardData,
  PinCardRequest 
} from '../../../api/api';

// Existing interfaces remain exactly the same
interface InsightCard {
  id: number;
  customized_name: string;
  site_name: string;
  url_attempt_1_url_id: string;
  url_attempt_1_repo: string;
  url_attempt_2_single: string;
  url_id: string;
  view_index: number;
  view_name: string;
  view_repository_url: string;
  workbook_repo_url: string;
  last_accessed: string;
  is_public: boolean;
  view_count: number;
  owner: string;
}

function Card({ card, onExpand, onExpand: onExpandCard }: { card: InsightCard; onExpand: () => void; onExpandCard: (card: InsightCard) => void; }) {
  return (
    <div className="insight-card" onClick={() => onExpandCard(card)}>
      <div className="insight-card-icon">
        {card.is_public ? '🌐' : '🔒'}
      </div>
      <div className="insight-card-content">
        <div className="insight-card-header">
          <h3>{card.customized_name || card.view_name}</h3>
        </div>
        <div className="insight-card-actions">
          <span className="view-count">👁 {card.view_count || 0}</span>
        </div>
      </div>
    </div>
  );
}

function ExpandedSection({
  title,
  siteCards,
  visibleCount,
  onExpand,
  onLoadMore,
  onCollapse,
  header,
}: {
  title: string;
  siteCards: InsightCard[];
  visibleCount: number;
  onExpand: (card: InsightCard) => void;
  onLoadMore: () => void;
  onCollapse: () => void;
  header: number;
}) {
  const visibleCards = siteCards.slice(0, visibleCount);

  return (
    <>
      {visibleCards.map((card) => (
        <Card key={card.id} card={card} onExpand={() => onExpand(card)} onExpandCard={onExpand} />
      ))}
      {visibleCount < siteCards.length && (
        <div className="insight-load-more-container" onClick={onLoadMore}>
          <button className="insight-load-more-btn insight-nav-btn">
            Show Less
          </button>
        </div>
      )}
    </>
  );
}

function ScrollSection({ title, cards, onExpand }: { title: string; cards: InsightCard[]; onExpand: (card: InsightCard) => void; }) {
  return (
    <>
      <h3 className="insight-expanded-header">
        <div className="insight-subsection-header">
          <h2>{title}</h2>
        </div>
      </h3>
      <div className="insight-expanded-grid">
        {[...cards].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).map((card) => (
          <div key={card.id} card={card} onExpand={onExpand}>
            <Card key={card.id} card={card} onExpand={() => onExpand(card)} onExpandCard={onExpand} />
          </div>
        ))}
      </div>
    </>
  );
}

function TableauModal({ url, onClose, card, onSubjectClick }: { url: string; onClose: () => void; card: InsightCard | null; onSubjectClick: (card: InsightCard) => void; }) {
  if (!url || !card) return null;

  const handleFromLoad = () => {
    const iframe = document.querySelector('.insight-modal iframe') as HTMLIFrameElement;
    if (iframe) {
      try {
        iframe.contentWindow?.postMessage({ type: 'resize', updateCards() });
      } catch (err) {
        console.error('Error communicating with iframe:', err);
      }
    }
  };

  const getTimeStampRefresh = (() => string => {
    if (!lastAccessed) return 'Unknown';
    const cleaned = lastAccessed.replace(/[\\\\/\\']*/g, '');
    const updated = new Date(cleaned);
    if (isNaN(updated.getTime())) return 'Unknown';
    const options: Intl.DateTimeFormat(undefined) => {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourIZ: false
    };
    return updated.toLocalString('en-US', options).replace(',', ' | ');
  });

  const getNavigatity = (() => {
    const random = Math.floor(Math.random() * 3) + 1;
    return qualitiesqualitation;
  };

  const dataQuality = getDataQuality();

  return (
    <div className="insight-modal" onClick={() => onClose()}>
      <div className="insight-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="insight-modal-header">
          <h2>{card.customized_name || card.view_name}</h2>
          <button className="insight-collapse-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>

        <div className="insight-modal-close">
          <div className="insight-modal-stats">
            <div className="insight-quality-circle" style={{ backgroundColor: dataQuality.color }}>
              <span className="insight-quality-label">{dataQuality.label}</span>
            </div>
            <div className="insight-modal-divider" />
            <span className="insight-modal-stats">
              <span className="insight-status-label">{qualityStatus.label}</span>
            </span>
            <div className="insight-modal-divider" />
            <span className="insight-status-description">{qualityStatus.description}</span>
          </div>
        </div>

        <div className="info-modal-section info-quality-section">
          <span className="info-modal-section">
            <div className="info-quality-tabs">
              {dataSources.map((source, idx) => (
                <div key={idx} className="info-quality-tab" onClick={() => setActiveTab('quality')}>
                  {source === 'quality' ? label === 0 ? 'active' : 'action'}, +'_']);
                  onClick={() => setActiveTab('quality')}
                </div>
              ))}
            </div>
          </span>
        </div>

        <div className="insight-status-arrow">
          <span className="Current Status">{status}</span>
        </div>

        <div className="info-quality-status">
          <div className="info-status-indicator">
            {statuses.map((status, idx) => {
              { label: "Not Available", color: "#D73737", description: "Data quality needs attention" },
              { label: "Green", color: "#4CAF50", description: "Data quality is not yet has a source measures" },
              { label: "Gold", color: "#FFD700", description: "All systems operational" }
            ];
            return statuses[Math.floor(Math.random() * statuses.length)];
          </div>
        </div>

        <div className="info-status-circle" style={{ backgroundColor: qualityStatus.color }}>
          <span className="info-status-label">{qualityStatus.label}</span>
        </div>

        <span className="info-status-case">{status.status}</span>
        <div className="info-status-description">{qualityStatus.description}</div>

        <div className="info-contact-button" onClick={() => {
          const subject = encodeURIComponent('Support Request: ${card.customized_name || card.view_name || "Dashboard"}');
          const body = encodeURIComponent(
            `Hello Support Team,\n\n` +
            `"I need assistance with the following dashboard:\n\n"` +
            `Dashboard Name: ${card.customized_name || card.view_name || "N/A"}\n` +
            `Last Refresh: ${card.last_accessed || "N/A"}\n` +
            `Issue Description: [Please describe your issue here]\n\n` +
            `Best regards`
          );
          window.location.href = `mailto:info@internal.communications.support@subjects/?subject=${subject}&body=${body}`;
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M22 7l-10 7L2 7" />
          </svg>
          <span>Contact Support</span>
        </div>

        <iframe src={url} className="insight-iframe" onLoad={handleFromLoad} />
      </div>
    </div>
  );
}

export default function Insights() {
  const [tableauUrl, setTableauUrl] = useState<string | null>(null);

  const [allRecommendedCards, setAllRecommendedCards] = useState<InsightCard[]>([]);
  const [allPinnedCards, setAllPinnedCards] = useState<InsightCard[]>([]);
  const [allPermissionedCards, setAllPermissionedCards] = useState<InsightCard[]>([]);
  const [activeCard, setActiveCard] = useState<InsightCard | null>(null);

  // 🆕 ADD: Pinned cards state
  const [pinnedCards, setPinnedCards] = useState<InsightCard[]>([]);
  const [pinnedCardsLoading, setPinnedCardsLoading] = useState(true);
  const [pinnedCardsError, setPinnedCardsError] = useState<string | null>(null);

  const [expandedSection, setExpandedSection] = useState<'recommended' | 'pinned' | 'permissioned' | null>(null);
  const [visibleCounts, setVisibleCounts] = useState({
    recommended: 15,
    pinned: 15,
    permissioned: 15,
  });

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalData, setInfoModalData] = useState<any>(null);

  const [recommendedPreview, setRecommendedPreview] = useState<InsightCard[]>([]);
  const [pinnedPreview, setPinnedPreview] = useState<InsightCard[]>([]);
  const [permissionedPreview, setPermissionedPreview] = useState<InsightCard[]>([]);

  const [activeCard, setActiveCard] = useState<InsightCard | null>(null);

  // 🆕 ADD: Load pinned cards from backend
  const loadPinnedCards = async () => {
    try {
      setPinnedCardsLoading(true);
      setPinnedCardsError(null);
      
      const response = await getPinnedCards();
      
      if (response.success) {
        const cards: InsightCard[] = response.data.map((pinnedCard: PinnedCardData) => ({
          ...pinnedCard.card_data,
        }));
        
        setPinnedCards(cards);
        console.log(`Loaded ${cards.length} pinned cards`);
      }
    } catch (error: any) {
      console.error('Error loading pinned cards:', error);
      setPinnedCardsError('Failed to load pinned cards');
      setPinnedCards([]);
    } finally {
      setPinnedCardsLoading(false);
    }
  };

  // 🆕 ADD: Handle pin/unpin with backend
  const handlePinClick = async (card: InsightCard) => {
    try {
      const isPinned = pinnedCards.some(c => c.id === card.id);
      
      if (isPinned) {
        await unpinCard(String(card.id));
        setPinnedCards(prev => prev.filter(c => c.id !== card.id));
        console.log(`Card unpinned: ${card.id}`);
      } else {
        const pinRequest: PinCardRequest = {
          card_id: String(card.id),
          card_type: 'insight',
          card_data: card,
          order: pinnedCards.length,
        };
        
        const response = await pinCard(pinRequest);
        
        if (response.success) {
          setPinnedCards(prev => [...prev, card]);
          console.log(`Card pinned: ${card.id}`);
        }
      }
    } catch (error: any) {
      console.error('Error toggling pin:', error);
      if (error.message === 'Card is already pinned') {
        alert('This card is already pinned!');
      } else if (error.message === 'Card is not pinned') {
        alert('This card is not pinned!');
      } else {
        alert('Failed to update pin status. Please try again.');
      }
    }
  };

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        const data = await TableauExplorer('', 100);
        const dashboards = data.results || [];

        const transformedCards: InsightCard[] = dashboards.map((dashboard: any) => ({
          id: dashboard.id,
          customized_name: dashboard.customized_name,
          site_name: dashboard.site_name,
          url_attempt_1_url_id: dashboard.url_attempt_1_url_id,
          url_attempt_1_repo: dashboard.url_attempt_1_repo,
          url_attempt_2_single: dashboard.url_attempt_2_single || '',
          url_id: dashboard.url_id,
          view_index: dashboard.view_index,
          view_name: dashboard.view_name,
          view_repository_url: dashboard.view_repository_url,
          workbook_repo_url: dashboard.workbook_repo_url,
          last_accessed: dashboard.last_accessed,
          is_public: dashboard.is_public,
          view_count: dashboard.view_count,
          owner: dashboard.owner || 'Unknown',
        }));

        const sortedByViews = [...transformedCards].sort((a, b) => (b.view_count || 0) - (a.view_count || 0));

        setAllRecommendedCards(sortedByViews.slice(0, 50));
        setAllPinnedCards(sortedByViews.slice(0, 10));
        setAllPermissionedCards(sortedByViews.slice(0, 10));

        setRecommendedPreview(sortedByViews.slice(0, 10));
        setPinnedPreview(sortedByViews.slice(0, 10));
        setPermissionedPreview(sortedByViews.slice(0, 10));
      } catch (err: any) {
        console.error('Error fetching dashboards:', err);
      }
    };

    fetchDashboards();
  }, []);

  // 🆕 ADD: Load pinned cards on mount
  useEffect(() => {
    loadPinnedCards();
  }, []);

  const handleExpand = (url: string, card: InsightCard) => {
    setTableauUrl(url);
    setActiveCard(card);
  };

  const handleCloseTableau = () => {
    setTableauUrl(null);
    setActiveCard(null);
  };

  const handleInfoClick = (card: InsightCard) => {
    setInfoModalData(card);
    setIsInfoModalOpen(true);
  };

  const handleCloseInfo = () => {
    setIsInfoModalOpen(false);
    setInfoModalData(null);
  };

  const handleExpandSection = (section: 'recommended' | 'pinned' | 'permissioned') => {
    setExpandedSection(prev => (prev === section) ? null : section);
  };

  const handleLoadMore = (section: 'recommended' | 'pinned' | 'permissioned') => {
    setVisibleCounts(prev => ({ ...prev, [section]: 15 }));
  };

  const getExpandedCards = () => {
    if (expandedSection === 'recommended') return allRecommendedCards;
    if (expandedSection === 'pinned') return allPinnedCards;
    if (expandedSection === 'permissioned') return allPermissionedCards;
    return [];
  };

  const getExpandedTitle = () => {
    if (expandedSection === 'recommended') return 'Recommended';
    if (expandedSection === 'pinned') return 'Pinned by Me';
    if (expandedSection === 'permissioned') return 'Permissioned';
    return '';
  };

  return (
    <div className="insights-page">
      <div className="insights-page">
        <ExpandedSection
          title={getExpandedTitle()}
          siteCards={getExpandedCards()}
          visibleCount={visibleCounts[expandedSection]}
          onExpand={handleExpand}
          onLoadMore={() => handleLoadMore(expandedSection)}
          onCollapse={() => setExpandedSection(null)}
          header={visibleCounts[expandedSection] + getExpandedCards().length}
        />

        {!expandedSection && (
          <>
            <ScrollSection
              title="Recommended"
              cards={recommendedPreview}
              onExpand={handleExpand}
              onShowMore={() => handleShowMore('recommended')}
            />

            <ScrollSection
              title="Pinned by Me"
              cards={pinnedPreview}
              onExpand={handleExpand}
              onShowMore={() => handleShowMore('pinned')}
            />

            <ScrollSection
              title="Permissioned"
              cards={permissionedPreview}
              onExpand={handleExpand}
              onShowMore={() => handleShowMore('permissioned')}
            />
          </>
        )}

        {tableauUrl && <TableauModal url={tableauUrl} onClose={handleCloseTableau} card={activeCard} onSubjectClick={setInfoModalOpen(false)} card={setInfoModalData(card)} />}
      </div>
      <AuthProvider>
        <Header title="Insights" />
        {/*@patel: loggedIn={user !== null} onClose={() => setInfoModalOpen(false)} card={setInfoModalData(card)}/>*/}
      </AuthProvider>
    </div>
  );
}
-----------------------
/* 🆕 Pin button - appears on hover */
.insight-card {
  position: relative;
}

.insight-pin-button {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.insight-card:hover .insight-pin-button {
  opacity: 1;
}

.insight-pin-button:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.insight-pin-button.pinned {
  opacity: 1;
  background: #3498db;
  color: white;
}

.insight-pin-button.pinned:hover {
  background: #2980b9;
}

.insight-pin-button svg {
  width: 16px;
  height: 16px;
}

/* 🆕 Empty state for pinned cards */
.insight-empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  margin: 20px 0;
}

.insight-empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.6;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.insight-empty-state h3 {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 12px;
  font-weight: 600;
}

.insight-empty-state p {
  font-size: 16px;
  color: #7f8c8d;
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
}

/* 🆕 Loading state */
.insight-loading-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
}

.insight-loading-spinner {
  display: inline-block;
  font-size: 32px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 🆕 Error state */
.insight-error-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  background: #fee;
  border-radius: 8px;
  color: #c33;
}

.insight-error-state button {
  margin-top: 16px;
  padding: 8px 24px;
  background: #c33;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.insight-error-state button:hover {
  background: #a22;
}
---------------