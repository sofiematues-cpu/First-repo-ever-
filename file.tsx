'use client';

import { useEffect, useState } from 'react';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { InsightCard } from './InsightsCard';
import { TableauAPI } from '@/lib/api';

interface InsightCard {
  id: number;
  customized_name: string;
  site_name: string;
  url_attempt_1_url_id: string;
  url_attempt_2_repo: string;
  url_attempt_3_simple: string;
  url_id: string;
  view_index: number;
  view_name: string;
  view_repository_url: string;
  workbook_name: string;
  workbook_repo_url: string;
  last_accessed: string;
  is_public: boolean;
  view_count?: number;
  owner?: string;
}

export default function Insights() {
  const [tableauUrl, setTableauUrl] = useState<string | null>(null);
  const [pinnedCards, setPinnedCards] = useState<InsightCard[]>([]);
  const [recommendedCards, setRecommendedCards] = useState<InsightCard[]>([]);
  const [permissionedCards, setPermissionedCards] = useState<InsightCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await TableauAPI.explore('', 300);
        
        const dashboards = data.results || [];

        // Transform API response to InsightCard format
        const transformedCards: InsightCard[] = dashboards.map((dashboard: any) => ({
          id: dashboard.id,
          customized_name: dashboard.customized_name || dashboard.view_name,
          site_name: dashboard.site_name,
          url_attempt_1_url_id: dashboard.url_attempt_1_url_id || '',
          url_attempt_2_repo: dashboard.url_attempt_2_repo || dashboard.url_attempt_1_url_id || '',
          url_attempt_3_simple: dashboard.url_attempt_3_simple || dashboard.url_attempt_1_url_id || '',
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

        // Split cards into sections based on view_count
        const sortedByViews = [...transformedCards].sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        
        setPinnedCards(sortedByViews.slice(0, 10));
        setRecommendedCards(sortedByViews.slice(10, 20));
        setPermissionedCards(sortedByViews.slice(20, 30));

      } catch (err: any) {
        console.error('Error fetching dashboards:', err);
        setError('Failed to load dashboards. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboards();
  }, []);

  const getTimeSinceRefresh = (lastAccessed: string): string => {
    if (!lastAccessed) return 'Unknown';
    
    const updated = new Date(lastAccessed);
    const now = new Date();
    const diffMs = now.getTime() - updated.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const handleExpand = (url: string) => {
    setTableauUrl(url);
  };

  const handleClose = () => {
    setTableauUrl(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-xl">Loading dashboards...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">⚠️ {error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header title="Insights" />
      <div className="insights-page">
        <ScrollSection title="Pinned by Me" cards={pinnedCards} onExpand={handleExpand} getTimeSinceRefresh={getTimeSinceRefresh} />
        <ScrollSection title="Recommended" cards={recommendedCards} onExpand={handleExpand} getTimeSinceRefresh={getTimeSinceRefresh} />
        <ScrollSection title="Permissioned" cards={permissionedCards} onExpand={handleExpand} getTimeSinceRefresh={getTimeSinceRefresh} />
      </div>

      {tableauUrl && <TableauModal url={tableauUrl} onClose={handleClose} />}
    </>
  );
}

function ScrollSection({ 
  title, 
  cards, 
  onExpand,
  getTimeSinceRefresh 
}: { 
  title: string; 
  cards: InsightCard[]; 
  onExpand: (url: string) => void;
  getTimeSinceRefresh: (lastAccessed: string) => string;
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
      scrollRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  if (cards.length === 0) return null;

  return (
    <section className="insight-section">
      <div className="insight-section-content">
        <h2 className="insight-section-title">{title}</h2>
        <div 
          id={`scroll-${title}`} 
          className="insight-scroll" 
          ref={scrollRef}
        >
          {cards.map((card) => (
            <InsightCard 
              key={card.id} 
              card={card} 
              onExpand={onExpand}
              getTimeSinceRefresh={getTimeSinceRefresh}
            />
          ))}
        </div>
      </div>

      <button onClick={scrollLeft} className="insight-nav-btn insight-nav-left">
        <FiChevronLeft />
      </button>
      <button onClick={scrollRight} className="insight-nav-btn insight-nav-right">
        <FiChevronRight />
      </button>
    </section>
  );
}

function TableauModal({ url, onClose }: { url: string; onClose: () => void }) {
  if (!url) return null;

  return (
    <div className="insight-modal" onClick={onClose}>
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
__________________________________
'use client';

import { LayoutDashboard } from 'lucide-react';

interface InsightCard {
  id: number;
  customized_name: string;
  site_name: string;
  url_attempt_1_url_id: string;
  view_name: string;
  workbook_name: string;
  last_accessed: string;
  view_count?: number;
  owner?: string;
}

interface CardProps {
  card: InsightCard;
  onExpand: (url: string) => void;
  getTimeSinceRefresh: (lastAccessed: string) => string;
}

export function InsightCard({ card, onExpand, getTimeSinceRefresh }: CardProps) {
  return (
    <div 
      className="insight-card" 
      onClick={() => onExpand(card.url_attempt_1_url_id)}
    >
      <div className="insight-card-icon">
        <LayoutDashboard size={32} strokeWidth={1.5} />
      </div>

      <div className="insight-card-content">
        <div className="insight-card-header">
          <div className="insight-card-title">{card.customized_name}</div>
          <div className="insight-card-tag">{card.site_name}</div>
        </div>

        <div className="insight-card-subtitle">{card.workbook_name}</div>
        <div className="insight-card-meta">Validated - Last refresh: {getTimeSinceRefresh(card.last_accessed)}</div>
        <div className="insight-card-meta">
          Viewed {card.view_count || 0} time{card.view_count !== 1 ? 's' : ''} this month - Owner: {card.owner || 'Unknown'}
        </div>
      </div>

      <div className="insight-expand-icon">
        <FiChevronRight />
      </div>
    </div>
  );
}
