'use client';

import { useEffect, useState, useRef } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { TableauAPI } from '@/lib/api';
import { AuthProvider } from '@/app/AuthProvider';
import SectionModal from './SectionModal'; // Adjust path as needed

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

// Simplified Card for Main Page (no owner, no last refresh)
function SimplifiedCard({ card, onExpand }: { card: InsightCard; onExpand: (url: string) => void }) {
  return (
    <div
      style={{
        minWidth: '240px',
        maxWidth: '240px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f0fafb 100%)',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '1.25rem',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={() => onExpand(card.url_attempt_2_repo)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 128, 67, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          background: 'linear-gradient(135deg, #ff0fdfa 0%, #dcfc6 100%)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.875rem',
          color: '#008043',
        }}
      >
        <LayoutDashboard size={28} strokeWidth={1.5} />
      </div>

      <div>
        <div
          style={{
            fontSize: '0.9375rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '0.375rem',
            lineHeight: '1.4',
          }}
        >
          {card.customized_name || card.view_name}
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            marginBottom: '0.625rem',
          }}
        >
          {card.site_name}
        </div>
      </div>

      <div
        style={{
          fontSize: '0.75rem',
          color: '#6b7280',
          marginTop: '0.625rem',
        }}
      >
        {card.workbook_name}
      </div>
    </div>
  );
}

function GridSection({
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
  if (cards.length === 0) return null;

  return (
    <section style={{ marginBottom: '3rem', position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0',
          }}
        >
          {title}
        </h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: hasMore ? '1rem' : '0',
        }}
      >
        {cards.map((card) => (
          <SimplifiedCard key={card.id} card={card} onExpand={onExpand} />
        ))}
      </div>

      {hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button
            onClick={onShowMore}
            style={{
              background: 'none',
              border: 'none',
              color: '#008043',
              cursor: 'pointer',
              padding: '0.5rem 1rem',
              fontSize: '0.9375rem',
              fontWeight: '600',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#00a854';
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#008043';
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            Show More
          </button>
        </div>
      )}
    </section>
  );
}

function TableauModal({ url, onClose }: { url: string; onClose: () => void }) {
  if (!url) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: '0',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(9px)',
        zIndex: 4000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div
        style={{
          background: 'transparent',
          borderRadius: '16px',
          width: '90%',
          height: '95%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.75rem',
            background: 'linear-gradient(135deg, #008043 0%, #00a854 100%)',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
          }}
        >
          <h2 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: '600', margin: '0' }}>
            Dashboard
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: '#ffffff',
              fontSize: '1.25rem',
              cursor: 'pointer',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              transition: 'all 0.2s',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ flex: '1', width: '100%', border: 'none' }}>
          <iframe src={url} style={{ width: '100%', height: '100%', border: 'none' }} />
        </div>
      </div>
    </div>
  );
}

export default function Insights() {
  const [tableauUrl, setTableauUrl] = useState<string | null>(null);
  
  // Main page cards (responsive amount)
  const [permissionedCards, setPermissionedCards] = useState<InsightCard[]>([]);
  const [pinnedCards, setPinnedCards] = useState<InsightCard[]>([]);
  const [recommendedCards, setRecommendedCards] = useState<InsightCard[]>([]);
  
  // All cards for modal (10 each)
  const [allPermissionedCards, setAllPermissionedCards] = useState<InsightCard[]>([]);
  const [allPinnedCards, setAllPinnedCards] = useState<InsightCard[]>([]);
  const [allRecommendedCards, setAllRecommendedCards] = useState<InsightCard[]>([]);

  const [activeSectionModal, setActiveSectionModal] = useState<'permissioned' | 'pinned' | 'recommended' | null>(null);

  const getCardsToShow = () => {
    if (typeof window === 'undefined') return 6;
    const width = window.innerWidth;
    if (width < 768) return 4;
    if (width < 1280) return 6;
    if (width < 1920) return 8;
    return 10;
  };

  const [cardsToShow, setCardsToShow] = useState(6);

  useEffect(() => {
    const updateCardsToShow = () => {
      setCardsToShow(getCardsToShow());
    };

    updateCardsToShow();
    window.addEventListener('resize', updateCardsToShow);

    return () => {
      window.removeEventListener('resize', updateCardsToShow);
    };
  }, []);

  // EXACT API CALLING METHOD FROM YOUR CODE
  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        const data = await TableauAPI.explore('', 100); // CHANGED TO 100 AS YOU SPECIFIED
        const dashboards = data.results || [];

        // Transform API response to InsightCard format
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

        // Sort by view count
        const sortedByViews = [...transformedCards].sort((a, b) => (b.view_count || 0) - (a.view_count || 0));

        // CHANGED: Section order - Permissioned first, then Pinned, then Recommended
        // Store ALL 10 cards for modal
        setAllPermissionedCards(sortedByViews.slice(0, 10));
        setAllPinnedCards(sortedByViews.slice(10, 20));
        setAllRecommendedCards(sortedByViews.slice(20, 30));

        // Show only responsive amount on main page
        setPermissionedCards(sortedByViews.slice(0, cardsToShow));
        setPinnedCards(sortedByViews.slice(10, 10 + cardsToShow));
        setRecommendedCards(sortedByViews.slice(20, 20 + cardsToShow));

      } catch (err: any) {
        console.error('Error fetching dashboards:', err);
      }
    };

    fetchDashboards();
  }, [cardsToShow]); // Re-fetch when cardsToShow changes

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
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
      
      <div style={{ marginTop: '70px', padding: '2.5rem' }}>
        <div
          style={{
            background: '#f8f9fa',
            height: 'calc(100vh - 70px)',
            overflowX: 'hidden',
            overflowY: 'auto',
            maxWidth: 'calc(100vw - 100px)',
          }}
        >
          {/* SECTION ORDER: Permissioned → Pinned → Recommended */}
          <GridSection
            title="Permissioned"
            cards={permissionedCards}
            onExpand={handleExpand}
            onShowMore={() => handleShowMore('permissioned')}
            hasMore={allPermissionedCards.length > permissionedCards.length}
          />

          <GridSection
            title="Pinned by Me"
            cards={pinnedCards}
            onExpand={handleExpand}
            onShowMore={() => handleShowMore('pinned')}
            hasMore={allPinnedCards.length > pinnedCards.length}
          />

          <GridSection
            title="Recommended"
            cards={recommendedCards}
            onExpand={handleExpand}
            onShowMore={() => handleShowMore('recommended')}
            hasMore={allRecommendedCards.length > recommendedCards.length}
          />
        </div>
      </div>

      {/* Section Modal */}
      <SectionModal
        isOpen={activeSectionModal !== null}
        onClose={handleCloseModal}
        title={getModalTitle()}
        cards={getModalCards()}
        onCardExpand={handleExpand}
      />

      {/* Tableau Modal */}
      {tableauUrl && <TableauModal url={tableauUrl} onClose={handleCloseTableau} />}
    </>
  );
}
