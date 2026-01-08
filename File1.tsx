import React, { useEffect, useState } from 'react';
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
  onReturnToModal: () => void;
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

export default function SectionModal({ isOpen, onClose, title, cards, onCardExpand, onReturnToModal }: SectionModalProps) {
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const calculateColumns = () => {
      const width = window.innerWidth;
      if (width < 768) return 1;
      if (width < 1024) return 2;
      if (width < 1440) return 3;
      if (width < 1920) return 4;
      if (width < 2560) return 5;
      return 6;
    };

    const updateColumns = () => {
      setColumns(calculateColumns());
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

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

  const handleCardExpand = (url: string) => {
    onCardExpand(url);
  };

  return (
    <div 
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(9px)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
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
          width: '98vw',
          height: '96vh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.3s ease',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
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
            flexShrink: 0,
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
            flex: 1,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: '1.5rem',
            }}
          >
            {cards.map((card) => (
              <Card key={card.id} card={card} onExpand={handleCardExpand} />
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
