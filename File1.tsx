'use client';

import { useEffect, useState, useRef } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Header } from '@/components/layout/header';
import { TableauAPI } from '@/lib/api';
import { AuthProvider } from '@/app/AuthProvider';
import SectionModal from './SectionModal';

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
    <div
      className="insight-card"
      onClick={() => onExpand(card.url_attempt_2_repo)}
    >
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

function ScrollSection({
  title,
  cards,
  onExpand,
  onShowMore,
  hasMore,
}: {
  title: string;
  cards: InsightCard[];
  onExpand: (url: string) => void;
  onShowMore: () => void;
  hasMore: boolean;
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
      <div className="insight-section-content">
        <h2 className="insight-section-title">{title}</h2>
        {hasMore && (
          <button className="insight-show-more" onClick={onShowMore}>
            Show More
          </button>
        )}
      </div>
      <div style={{ position: 'relative' }}>
        <div id={`scroll-${title}`} className="insight-scroll" ref={scrollRef}>
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
    <div className="insight-modal" onClick={(e) => { if (e.target === e.currentTarget) { e.stopPropagation(); onClose(); }}}>
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
  const [pinnedCards, setPinnedCards] = useState<InsightCard[]>([]);
  const [recommendedCards, setRecommendedCards] = useState<InsightCard[]>([]);
  const [permissionedCards, setPermissionedCards] = useState<InsightCard[]>([]);
  const [allPinnedCards, setAllPinnedCards] = useState<InsightCard[]>([]);
  const [allRecommendedCards, setAllRecommendedCards] = useState<InsightCard[]>([]);
  const [allPermissionedCards, setAllPermissionedCards] = useState<InsightCard[]>([]);
  const [activeSectionModal, setActiveSectionModal] = useState<'permissioned' | 'pinned' | 'recommended' | null>(null);

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

        setAllPermissionedCards(sortedByViews.slice(0, 10));
        setAllPinnedCards(sortedByViews.slice(10, 20));
        setAllRecommendedCards(sortedByViews.slice(20, 30));

        setPermissionedCards(sortedByViews.slice(0, 10));
        setPinnedCards(sortedByViews.slice(10, 20));
        setRecommendedCards(sortedByViews.slice(20, 30));
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

  const handleShowMore = (section: 'permissioned' | 'pinned' | 'recommended') => {
    setActiveSectionModal(section);
  };

  const handleCloseModal = () => {
    setActiveSectionModal(null);
  };

  const getModalCards = () => {
    if (activeSectionModal === 'permissioned') return allPermissionedCards;
    if (activeSectionModal === 'pinned') return allPinnedCards;
    if (activeSectionModal === 'recommended') return allRecommendedCards;
    return [];
  };

  const getModalTitle = () => {
    if (activeSectionModal === 'permissioned') return 'Permissioned Dashboards';
    if (activeSectionModal === 'pinned') return 'Pinned by Me';
    if (activeSectionModal === 'recommended') return 'Recommended Dashboards';
    return '';
  };

  return (
    <div className="insights-page">
      <ScrollSection
        title="Permissioned"
        cards={permissionedCards}
        onExpand={handleExpand}
        onShowMore={() => handleShowMore('permissioned')}
        hasMore={true}
      />

      <ScrollSection
        title="Pinned by Me"
        cards={pinnedCards}
        onExpand={handleExpand}
        onShowMore={() => handleShowMore('pinned')}
        hasMore={true}
      />

      <ScrollSection
        title="Recommended"
        cards={recommendedCards}
        onExpand={handleExpand}
        onShowMore={() => handleShowMore('recommended')}
        hasMore={true}
      />

      <SectionModal
        isOpen={activeSectionModal !== null}
        onClose={handleCloseModal}
        title={getModalTitle()}
        cards={getModalCards()}
        onCardExpand={handleExpand}
      />

      {tableauUrl && <TableauModal url={tableauUrl} onClose={handleCloseTableau} />}
    </div>
  );
}
------------------
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

.insight-section-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.insight-modal-body {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  padding: 2rem;
  overflow-y: auto;
  max-height: calc(95vh - 100px);
}
