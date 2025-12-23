'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { useAuth, useEffect as useRequireAuth } from 'react';
import { Dashboard } from '@/lib/api';
import { InsightCard } from './insights.types';
import { pinnedCards as fallbackPinnedCards } from './insights-data';
import { url } from 'inspector';
import { AuthProvider } from '@/app/AuthProvider';

interface CardProps {
  card: InsightCard;
  onExpand: (url: string) => void;
}

function Card({ card, onExpand }: CardProps) {
  return (
    <div className="insight-card" onClick={() => onExpand(card.tableauUrl)}>
      <div className="insight-card-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      </div>
      <div className="insight-card-content">
        <div className="insight-card-header">
          <div className="insight-card-title">{card.title}</div>
          <div className="insight-card-tag">{card.tag}</div>
        </div>
        <div className="insight-card-subtitle">{card.subtitle}</div>
        <div className="insight-card-meta">{card.meta}</div>
      </div>
      <div className="insight-expand-icon">
        <FiChevronRight />
      </div>
    </div>
  );
}

function ScrollSection({ title, cards, onExpand }: { title: string; cards: InsightCard[]; onExpand: (url: string) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: WheelEvent) => {
    if (scrollRef.current && sectionRef.current?.contains(e.target as Node)) {
      e.preventDefault();
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
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
    <section className="insight-section" ref={sectionRef}>
      <div onClick={scrollLeft} className="insight-nav-btn insight-nav-left">
        <FiChevronLeft />
      </div>

      <div className="insight-section-content">
        <h2>{title}</h2>
        <div id={`scroll-${title}`} className="insight-scroll" ref={scrollRef}>
          {cards.map((card) => (
            <Card key={card.id} card={card} onExpand={onExpand} />
          ))}
        </div>
      </div>

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
          <h3>Dashboard</h3>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch dashboards from API
   */
  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        setLoading(true);
        setError(null);

        // CORRECT API ENDPOINT - Based on your backend
        const response = await fetch('https://portal.sd1.dev.echonet/api/tableau/insights/explore/?limit=100');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const dashboards = data.results || [];

        // Transform API response to InsightCard format
        const transformedCards: InsightCard[] = dashboards.map((dashboard: any) => {
          // Calculate time since last refresh
          const timeSinceRefresh = dashboard.updated_at 
            ? getTimeSinceRefresh(dashboard.updated_at)
            : 'Unknown';

          return {
            id: dashboard.id?.toString() || Math.random().toString(),
            title: dashboard.title || dashboard.view_name || 'Untitled',
            subtitle: `Validated - Last refresh: ${timeSinceRefresh}`,
            tag: dashboard.tag || dashboard.project_name || 'General',
            meta: `Viewed ${dashboard.view_count || 0} this month - Owner: ${dashboard.owner || 'Unknown'}`,
            tableauUrl: dashboard.url_attempt_2_repos || dashboard.url_attempt_1 || '',
            view_name: dashboard.view_name,
            workbook_name: dashboard.workbook_name,
            project_name: dashboard.project_name,
            owner: dashboard.owner,
            view_count: dashboard.view_count,
            updated_at: dashboard.updated_at
          };
        });

        // Split cards into sections
        // Top 10 most viewed = Pinned
        const sortedByViews = [...transformedCards].sort((a, b) => 
          (b.view_count || 0) - (a.view_count || 0)
        );
        setPinnedCards(sortedByViews.slice(0, 10));

        // Next 10 = Recommended
        setRecommendedCards(sortedByViews.slice(10, 20));

        // Rest = Permissioned
        setPermissionedCards(sortedByViews.slice(20));

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboards:', err);
        setError('Failed to load dashboards. Please try again.');
        
        // Use fallback data on error
        setPinnedCards(fallbackPinnedCards);
        setRecommendedCards([]);
        setPermissionedCards([]);
        
        setLoading(false);
      }
    };

    fetchDashboards();
  }, []);

  /**
   * Helper function to calculate time since refresh
   */
  const getTimeSinceRefresh = (updatedAt: string): string => {
    try {
      const updated = new Date(updatedAt);
      const now = new Date();
      const diffMs = now.getTime() - updated.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffDays > 0) return `${diffDays}d ago`;
      if (diffHours > 0) return `${diffHours}h ago`;
      return 'Just now';
    } catch {
      return 'Unknown';
    }
  };

  /**
   * Handle card expand - open Tableau modal
   */
  const handleExpand = (url: string) => {
    setTableauUrl(url);
  };

  // Loading state
  if (loading) {
    return (
      <AuthProvider>
        <>
          <Header title="Insights" />
          <div className="insights-page">
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-xl">Loading dashboards...</p>
            </div>
          </div>
        </>
      </AuthProvider>
    );
  }

  // Error state
  if (error) {
    return (
      <AuthProvider>
        <>
          <Header title="Insights" />
          <div className="insights-page">
            <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
              <p className="text-xl">⚠️ {error}</p>
            </div>
          </div>
        </>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <>
        <Header title="Insights" />
        <div className="insights-page">
          <ScrollSection title="Pinned by Me" cards={pinnedCards} onExpand={handleExpand} />
          <ScrollSection title="Recommended" cards={recommendedCards} onExpand={handleExpand} />
          <ScrollSection title="Permissioned" cards={permissionedCards} onExpand={handleExpand} />
        </div>
        {tableauUrl && <TableauModal url={tableauUrl} onClose={() => setTableauUrl(null)} />}
      </>
    </AuthProvider>
  );
}
