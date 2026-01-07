import React, { useEffect, useRef } from 'react';
import { LayoutDashboard } from 'lucide-react';

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

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  cards: InsightCard[];
  onCardExpand: (url: string) => void;
}

function Card({ card, onExpand }: { card: InsightCard; onExpand: (url: string) => void }) {
  const getTimeSinceRefresh = (lastAccessed: string): string => {
    if (!lastAccessed) return 'Unknown';
    const cleaned = lastAccessed.replace(/[\\\/\[\]$']+/g, '');
    const updated = new Date(cleaned);
    const now = new Date();

    if (isNaN(updated.getTime())) return 'Unknown';

    const diffMs = now.getTime() - updated.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div
      style={{
        minWidth: '260px',
        maxWidth: '260px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f0fafb 100%)',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '1.5rem',
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
          width: '48px',
          height: '48px',
          background: 'linear-gradient(135deg, #ff0fdfa 0%, #dcfc6 100%)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          color: '#008043',
          transition: 'all 0.3s ease',
        }}
      >
        <LayoutDashboard size={32} strokeWidth={1.5} />
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <div
          style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '0.5rem',
          }}
        >
          {card.customized_name || card.view_name}
        </div>
        <div
          style={{
            fontSize: '0.8125rem',
            color: '#6b7280',
            marginTop: '0.25rem',
          }}
        >
          {card.site_name}
        </div>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <div
          style={{
            fontSize: '0.8125rem',
            color: '#6b7280',
            marginTop: '1rem',
            justifyContent: 'space-between',
          }}
        >
          {card.workbook_name}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
          Last refresh: {getTimeSinceRefresh(card.last_accessed)}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
          Owner: {card.owner || 'Unknown'}
        </div>
      </div>
    </div>
  );
}

export default function SectionModal({ isOpen, onClose, title, cards, onCardExpand }: SectionModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: '0',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(9px)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.25s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      <div
        ref={modalRef}
        style={{
          background: 'transparent',
          borderRadius: '16px',
          width: '90%',
          height: '95%',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.3s ease',
        }}
      >
        {/* Header */}
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
          <h2
            style={{
              color: '#ffffff',
              fontSize: '1.25rem',
              fontWeight: '600',
              margin: '0',
            }}
          >
            {title}
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
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'rotate(90deg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'rotate(0deg)';
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(9px)',
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: '2rem',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.25rem',
              overflowY: 'auto',
              overflowX: 'hidden',
              paddingRight: '0.5rem',
            }}
          >
            {cards.map((card) => (
              <Card key={card.id} card={card} onExpand={onCardExpand} />
            ))}
          </div>

          {cards.length === 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#9ca3af',
                fontSize: '1rem',
              }}
            >
              No dashboards available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
----------------------
'use client';

import { useEffect, useState, useRef } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { TableauAPI } from '@/lib/api';
import { AuthProvider } from '@/app/AuthProvider';
import SectionModal from './SectionModal'; // NEW IMPORT

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

// NEW: Simplified Card Component for Main Page (no owner, no last refresh)
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
          transition: 'all 0.3s ease',
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

// NEW: Responsive Grid Section Component
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
  
  // NEW: Separate state for visible cards and all cards
  const [permissionedCards, setPermissionedCards] = useState<InsightCard[]>([]);
  const [pinnedCards, setPinnedCards] = useState<InsightCard[]>([]);
  const [recommendedCards, setRecommendedCards] = useState<InsightCard[]>([]);
  
  const [allPermissionedCards, setAllPermissionedCards] = useState<InsightCard[]>([]);
  const [allPinnedCards, setAllPinnedCards] = useState<InsightCard[]>([]);
  const [allRecommendedCards, setAllRecommendedCards] = useState<InsightCard[]>([]);

  // NEW: Modal state
  const [activeSectionModal, setActiveSectionModal] = useState<'permissioned' | 'pinned' | 'recommended' | null>(null);

  // NEW: Function to determine how many cards to show based on screen width
  const getCardsToShow = () => {
    if (typeof window === 'undefined') return 6;
    const width = window.innerWidth;
    if (width < 768) return 4; // Phone
    if (width < 1280) return 6; // Tablet/Laptop
    if (width < 1920) return 8; // Desktop
    return 10; // Large screens
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

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        const data = await TableauAPI.explore('', 300);
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

        // CHANGED: New section order - Permissioned first
        const allPermissioned = sortedByViews.slice(0, 10);
        const allPinned = sortedByViews.slice(10, 20);
        const allRecommended = sortedByViews.slice(20, 30);

        // Store all cards
        setAllPermissionedCards(allPermissioned);
        setAllPinnedCards(allPinned);
        setAllRecommendedCards(allRecommended);

        // Show only responsive amount
        setPermissionedCards(allPermissioned.slice(0, cardsToShow));
        setPinnedCards(allPinned.slice(0, cardsToShow));
        setRecommendedCards(allRecommended.slice(0, cardsToShow));
      } catch (err: any) {
        console.error('Error fetching dashboards:', err);
      }
    };

    fetchDashboards();
  }, [cardsToShow]);

  const handleExpand = (url: string) => {
    setTableauUrl(url);
  };

  const handleCloseTableau = () => {
    setTableauUrl(null);
  };

  // NEW: Modal handlers
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
          {/* CHANGED: Section order - Permissioned first */}
          <GridSection
            title="Permissioned"
            cards={permissionedCards}
            onExpand={handleExpand}
            onShowMore={() => handleShowMore('permissioned')}
            hasMore={allPermissionedCards.length > cardsToShow}
          />

          <GridSection
            title="Pinned by Me"
            cards={pinnedCards}
            onExpand={handleExpand}
            onShowMore={() => handleShowMore('pinned')}
            hasMore={allPinnedCards.length > cardsToShow}
          />

          <GridSection
            title="Recommended"
            cards={recommendedCards}
            onExpand={handleExpand}
            onShowMore={() => handleShowMore('recommended')}
            hasMore={allRecommendedCards.length > cardsToShow}
          />
        </div>
      </div>

      {/* NEW: Section Modal */}
      <SectionModal
        isOpen={activeSectionModal !== null}
        onClose={handleCloseModal}
        title={getModalTitle()}
        cards={getModalCards()}
        onCardExpand={handleExpand}
      />

      {/* Existing Tableau Modal */}
      {tableauUrl && <TableauModal url={tableauUrl} onClose={handleCloseTableau} />}
    </>
  );
}
--------------------