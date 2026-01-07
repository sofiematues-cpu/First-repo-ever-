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
---------------------
import React, { useEffect } from 'react';
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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onExpand(card.url_attempt_2_repo);
  };

  return (
    <div 
      onClick={handleClick}
      style={{
        minWidth: '280px',
        maxWidth: '280px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f0fafb 100%)',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
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
        }}
      >
        <LayoutDashboard size={32} strokeWidth={1.5} />
      </div>
      <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
        {card.customized_name || card.view_name}
      </div>
      <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '0.5rem' }}>
        {card.site_name}
      </div>
      <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '1rem' }}>
        {card.workbook_name}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.75rem' }}>
        Last refresh: {getTimeSinceRefresh(card.last_accessed)}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
        Owner: {card.owner || 'Unknown'}
      </div>
    </div>
  );
}

export default function SectionModal({ isOpen, onClose, title, cards, onCardExpand }: SectionModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => { window.removeEventListener('keydown', handleEscape); };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: '0',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(9px)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        animation: 'fadeIn 0.25s ease',
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
        style={{
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '16px',
          width: '90vw',
          maxWidth: '1400px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.3s ease',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem 2rem',
            background: 'linear-gradient(135deg, #008043 0%, #00a854 100%)',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
          }}
        >
          <h2
            style={{
              color: '#ffffff',
              fontSize: '1.5rem',
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
              fontSize: '1.5rem',
              cursor: 'pointer',
              width: '40px',
              height: '40px',
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

        <div
          style={{
            padding: '2rem',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
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
                padding: '4rem',
                color: '#9ca3af',
                fontSize: '1.125rem',
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
------------------------
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
