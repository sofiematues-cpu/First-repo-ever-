/* ============================================
   FIXED HEIGHT LAYOUT - No Vertical Scroll
   ============================================ */

.insights-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Prevent page-level scrolling */
}

/* Header stays at top */
.insights-page > header {
  flex-shrink: 0;
}

/* Main content area - fills remaining height */
.insights-page main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 20px;
  gap: 20px;
}

/* Each section takes equal height (1/3 of available space) */
.insight-section,
.pinned-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* Important for flex children */
  overflow: hidden;
}

/* Section header - fixed height */
.insight-section-header {
  flex-shrink: 0;
  margin-bottom: 12px;
}

/* Scroll container - takes remaining height */
.insight-scroll {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  display: flex;
  gap: 16px;
  padding-bottom: 8px;
}

/* Hide scrollbar but keep functionality */
.insight-scroll::-webkit-scrollbar {
  height: 6px;
}

.insight-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.insight-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.insight-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* ============================================
   EXPANDED SECTION - Full Height
   ============================================ */

.insight-expanded-section {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Expanded header */
.insight-expanded-header {
  flex-shrink: 0;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Expanded content - scrollable grid */
.insight-expanded-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* Grid layout for expanded cards */
.insight-expanded-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding-bottom: 20px;
}

/* Load More button at bottom of expanded view */
.insight-load-more-container {
  flex-shrink: 0;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

.insight-load-more-btn {
  padding: 12px 32px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.insight-load-more-btn:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.insight-load-more-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
}

/* ============================================
   RESPONSIVE - Maintain Layout
   ============================================ */

@media (max-width: 1024px) {
  .insights-page main {
    gap: 16px;
    padding: 16px;
  }
  
  .insight-expanded-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .insights-page main {
    gap: 12px;
    padding: 12px;
  }
  
  .insight-expanded-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .insight-expanded-section {
    background: #111827;
  }
  
  .insight-expanded-header {
    border-bottom-color: #374151;
  }
  
  .insight-load-more-container {
    border-top-color: #374151;
  }
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
  onExpand: (url: string, card: InsightCard) => void;
  onLoadMore?: () => void;
  onCollapse: () => void;
  hasMore: boolean;
}) {
  const visibleCards = allCards.slice(0, visibleCount);

  return (
    <div className="insight-expanded-section">
      {/* Header */}
      <div className="insight-expanded-header">
        <h2 className="insight-section-title">{title}</h2>
        <button className="insight-collapse-btn" onClick={onCollapse}>
          ✕
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="insight-expanded-content">
        <div className="insight-expanded-grid">
          {visibleCards.map((card) => (
            <Card key={card.id} card={card} onExpand={onExpand} />
          ))}
        </div>
      </div>

      {/* Load More at Bottom */}
      {hasMore && onLoadMore && (
        <div className="insight-load-more-container">
          <button 
            className="insight-load-more-btn" 
            onClick={onLoadMore}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}





return (
  <div className="insights-page">
    {/* Header (if you have one) */}
    <header>
      <h1>Insights</h1>
    </header>

    {/* Main content - 3 sections */}
    <main>
      {/* Recommended Section - 1/3 height */}
      {expandedSection !== 'recommended' && (
        <ScrollSection
          title="Recommended"
          cards={recommendedPreview}
          onExpand={handleExpand}
          onShowMore={() => handleShowMore('recommended')}
        />
      )}

      {/* Pinned by Me Section - 1/3 height */}
      {expandedSection !== 'pinned' && (
        <section className="pinned-section">
          <ScrollSection
            title="Pinned by Me"
            cards={pinnedCards.slice(0, Math.min(5, pinnedCards.length))}
            onExpand={handleExpand}
            onShowMore={pinnedCards.length > 5 ? () => handleShowMore('pinned') : undefined}
            onPinClick={handlePinClick}
            emptyMessage="You haven't pinned any cards yet. Click the pin icon 📌 on any card to save your favorites here!"
          />
        </section>
      )}

      {/* Permissioned Section - 1/3 height */}
      {expandedSection !== 'permissioned' && (
        <ScrollSection
          title="Permissioned"
          cards={permissionedPreview}
          onExpand={handleExpand}
          onShowMore={() => handleShowMore('permissioned')}
        />
      )}

      {/* Expanded Section - Full screen overlay */}
      {expandedSection === 'recommended' && (
        <ExpandedSection
          title="Recommended"
          allCards={allRecommendedCards}
          visibleCount={visibleCounts.recommended}
          onExpand={handleExpand}
          onLoadMore={() => handleLoadMore('recommended')}
          onCollapse={handleCollapse}
          hasMore={visibleCounts.recommended < allRecommendedCards.length}
        />
      )}

      {expandedSection === 'pinned' && (
        <ExpandedSection
          title="Pinned by Me"
          allCards={allPinnedCards}
          visibleCount={visibleCounts.pinned}
          onExpand={handleExpand}
          onLoadMore={() => handleLoadMore('pinned')}
          onCollapse={handleCollapse}
          hasMore={visibleCounts.pinned < pinnedCards.length}
        />
      )}

      {expandedSection === 'permissioned' && (
        <ExpandedSection
          title="Permissioned"
          allCards={allPermissionedCards}
          visibleCount={visibleCounts.permissioned}
          onExpand={handleExpand}
          onLoadMore={() => handleLoadMore('permissioned')}
          onCollapse={handleCollapse}
          hasMore={visibleCounts.permissioned < allPermissionedCards.length}
        />
      )}
    </main>
  </div>
);




