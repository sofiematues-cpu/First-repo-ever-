'use client';

import { useEffect, useState, useRef } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Header } from '@/components/layout/header';
import { TableauAPI } from '@/lib/api';
import { AuthProvider } from '@/app/AuthProvider';

interface InsightCard {
  id: number;
  customized_name: string;
  site_name: string;
  url_attempt_1_url_id: string;
  url_attempt_2_repo: string;
  url_attempt_2_simple: string;
  url_id: string;
  view_index: number;
  view_name: string;
  view_repository_url: string;
  workbook_name: string;
  workbook_repo_url: string;
  last_accessed: string;
  is_public: boolean;
  view_count: number;
  owner: string;
}

function Card({ card, onExpand }: { card: InsightCard; onExpand: (url: string) => void }) {
  return (
    <div className="insight-card" onClick={() => onExpand(card.url_attempt_2_repo)}>
      <div className="insight-card-icon">
        <LayoutDashboard size={32} strokeWidth={1.5} />
      </div>
      <div className="insight-card-content">
        <div className="insight-card-header">
          <div className="insight-card-title">{card.customized_name || card.view_name}</div>
          <div className="insight-card-tag">{card.site_name}</div>
        </div>
        <div className="insight-card-subtitle">{card.workbook_name}</div>
      </div>
    </div>
  );
}

function ExpandedSection({
  title,
  allCards,
  visibleCount,
  onExpand,
  onLoadMore,
  onCollapse,
  hasMore,
}: {
  title: string;
  allCards: InsightCard[];
  visibleCount: number;
  onExpand: (url: string) => void;
  onLoadMore: () => void;
  onCollapse: () => void;
  hasMore: boolean;
}) {
  const visibleCards = allCards.slice(0, visibleCount);

  return (
    <div className="insight-expanded-section">
      <div className="insight-expanded-header">
        <h2 className="insight-section-title">{title}</h2>
        <button className="insight-collapse-btn" onClick={onCollapse}>
          Show Less
        </button>
      </div>

      <div className="insight-expanded-grid">
        {visibleCards.map((card) => (
          <Card key={card.id} card={card} onExpand={onExpand} />
        ))}
      </div>

      {hasMore && (
        <div className="insight-load-more-container">
          <button className="insight-load-more-btn" onClick={onLoadMore}>
            Load More
          </button>
        </div>
      )}
    </div>
  );
}

function ScrollSection({
  title,
  cards,
  onExpand,
  onShowMore,
}: {
  title: string;
  cards: InsightCard[];
  onExpand: (url: string) => void;
  onShowMore: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: WheelEvent) => {
    if (scrollRef.current && scrollRef.current.contains(e.target as Node)) {
      e.preventDefault();
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  useEffect(() => {
    const section = scrollRef.current;
    if (section) {
      section.addEventListener('wheel', handleWheel, { passive: false });
      return () => section.removeEventListener('wheel', handleWheel);
    }
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (cards.length === 0) return null;

  return (
    <section className="insight-section">
      <div className="insight-section-header">
        <h2 className="insight-section-title">{title}</h2>
        <button className="insight-show-more" onClick={onShowMore}>
          Show More
        </button>
      </div>
      <div style={{ position: 'relative' }}>
        <div className="insight-scroll" ref={scrollRef}>
          {cards.map((card) => (
            <Card key={card.id} card={card} onExpand={onExpand} />
          ))}
        </div>
        <button onClick={scrollLeft} className="insight-nav-btn insight-nav-left">
          <FiChevronLeft />
        </button>
        <button onClick={scrollRight} className="insight-nav-btn insight-nav-right">
          <FiChevronRight />
        </button>
      </div>
    </section>
  );
}

function TableauModal({ url, onClose }: { url: string; onClose: () => void }) {
  if (!url) return null;

  return (
    <div className="insight-modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="insight-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="insight-modal-header">
          <h2>Dashboard</h2>
          <button onClick={onClose}>✕</button>
        </div>
        <iframe src={url} className="insight-iframe" />
      </div>
    </div>
  );
}

export default function Insights() {
  const [tableauUrl, setTableauUrl] = useState<string | null>(null);
  
  const [allRecommendedCards, setAllRecommendedCards] = useState<InsightCard[]>([]);
  const [allPinnedCards, setAllPinnedCards] = useState<InsightCard[]>([]);
  const [allPermissionedCards, setAllPermissionedCards] = useState<InsightCard[]>([]);
  
  const [recommendedPreview, setRecommendedPreview] = useState<InsightCard[]>([]);
  const [pinnedPreview, setPinnedPreview] = useState<InsightCard[]>([]);
  const [permissionedPreview, setPermissionedPreview] = useState<InsightCard[]>([]);
  
  const [expandedSection, setExpandedSection] = useState<'recommended' | 'pinned' | 'permissioned' | null>(null);
  const [visibleCounts, setVisibleCounts] = useState({
    recommended: 15,
    pinned: 15,
    permissioned: 15,
  });

  useEffect(() => {
    const updateCardWidth = () => {
      const viewportWidth = window.innerWidth;
      const sidebarWidth = 100;
      const padding = 120;
      const gap = 20;
      const minCardWidth = 240;
      
      const availableWidth = viewportWidth - sidebarWidth - padding;
      const numCards = Math.max(3, Math.floor((availableWidth + gap) / (minCardWidth + gap)));
      const cardWidth = (availableWidth - (gap * (numCards - 1))) / numCards;
      
      document.documentElement.style.setProperty('--dynamic-card-width', `${Math.max(cardWidth, minCardWidth)}px`);
      document.documentElement.style.setProperty('--grid-columns', `${Math.min(5, numCards)}`);
    };

    updateCardWidth();
    window.addEventListener('resize', updateCardWidth);
    return () => window.removeEventListener('resize', updateCardWidth);
  }, []);

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        const data = await TableauAPI.explore('', 100);
        const dashboards = data.results || [];

        const transformedCards: InsightCard[] = dashboards.map((dashboard: any) => ({
          id: dashboard.id,
          customized_name: dashboard.customized_name,
          site_name: dashboard.site_name,
          url_attempt_1_url_id: dashboard.url_attempt_1_url_id,
          url_attempt_2_repo: dashboard.url_attempt_2_repo || '',
          url_attempt_2_simple: dashboard.url_attempt_2_simple || '',
          url_id: dashboard.url_id,
          view_index: dashboard.view_index,
          view_name: dashboard.view_name,
          view_repository_url: dashboard.view_repository_url,
          workbook_name: dashboard.workbook_name,
          workbook_repo_url: dashboard.workbook_repo_url,
          last_accessed: dashboard.last_accessed,
          is_public: dashboard.is_public,
          view_count: dashboard.view_count || 0,
          owner: dashboard.owner || 'Unknown',
        }));

        const sortedByViews = [...transformedCards].sort((a, b) => (b.view_count || 0) - (a.view_count || 0));

        setAllRecommendedCards(sortedByViews.slice(0, 50));
        setAllPinnedCards(sortedByViews.slice(0, 50));
        setAllPermissionedCards(sortedByViews.slice(0, 50));

        setRecommendedPreview(sortedByViews.slice(0, 10));
        setPinnedPreview(sortedByViews.slice(0, 10));
        setPermissionedPreview(sortedByViews.slice(0, 10));
      } catch (err: any) {
        console.error('Error fetching dashboards:', err);
      }
    };

    fetchDashboards();
  }, []);

  const handleExpand = (url: string) => {
    setTableauUrl(url);
  };

  const handleCloseTableau = () => {
    setTableauUrl(null);
  };

  const handleShowMore = (section: 'recommended' | 'pinned' | 'permissioned') => {
    setExpandedSection(section);
    setVisibleCounts(prev => ({ ...prev, [section]: 15 }));
  };

  const handleCollapse = () => {
    setExpandedSection(null);
  };

  const handleLoadMore = (section: 'recommended' | 'pinned' | 'permissioned') => {
    setVisibleCounts(prev => ({
      ...prev,
      [section]: Math.min(prev[section] + 15, 50),
    }));
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
      {expandedSection ? (
        <ExpandedSection
          title={getExpandedTitle()}
          allCards={getExpandedCards()}
          visibleCount={visibleCounts[expandedSection]}
          onExpand={handleExpand}
          onLoadMore={() => handleLoadMore(expandedSection)}
          onCollapse={handleCollapse}
          hasMore={visibleCounts[expandedSection] < getExpandedCards().length}
        />
      ) : (
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

      {tableauUrl && <TableauModal url={tableauUrl} onClose={handleCloseTableau} />}
    </div>
  );
}
-----
.insights-page {
  margin-top: 90px;
  padding: 2rem;
}

.insight-section {
  margin-bottom: 3rem;
  position: relative;
}

.insight-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.insight-section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.insight-show-more {
  background: none;
  border: none;
  color: #008043;
  cursor: pointer;
  padding: 0;
  font-size: 0.875rem;
  font-weight: 600;
  transition: color 0.2s;
}

.insight-show-more:hover {
  color: #00a854;
  text-decoration: underline;
}

.insight-expanded-section {
  width: 100%;
  padding: 2rem 0;
}

.insight-expanded-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.insight-collapse-btn {
  background: linear-gradient(135deg, #008043 0%, #00a854 100%);
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s;
}

.insight-collapse-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 128, 67, 0.3);
}

.insight-expanded-grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns, 5), 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.insight-load-more-container {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.insight-load-more-btn {
  background: none;
  border: 2px solid #008043;
  color: #008043;
  cursor: pointer;
  padding: 1rem 3rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s;
}

.insight-load-more-btn:hover {
  background: #008043;
  color: #ffffff;
  transform: translateY(-2px);
}

.insight-card {
  width: var(--dynamic-card-width, 280px);
  min-width: var(--dynamic-card-width, 280px);
  max-width: var(--dynamic-card-width, 280px);
}

.insight-expanded-grid .insight-card {
  width: 100%;
  min-width: 240px;
  max-width: 100%;
}
