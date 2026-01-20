function ScrollSection({
  title,
  cards,
  onExpand,
  onShowMore,
  onPinClick,
  emptyMessage,
}: {
  title: string;
  cards: InsightCard[];
  onExpand: (url: string, card: InsightCard) => void;
  onShowMore?: () => void;
  onPinClick?: (card: InsightCard) => void;
  emptyMessage?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // const handleWheel = (e: WheelEvent) => {
  //   if (scrollRef.current && scrollRef.current.contains(e.target as Node)) {
  //     e.preventDefault();
  //     scrollRef.current.scrollLeft += e.deltaY;
  //   }
  // };

  // useEffect(() => {
  //   const section = scrollRef.current;
  //   if (section) {
  //     section.addEventListener('wheel', handleWheel, { passive: false });
  //     return () => section.removeEventListener('wheel', handleWheel);
  //   }
  // }, []);

  // const scrollLeft = () => {
  //   if (scrollRef.current) {
  //     scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  //   }
  // };

  // const scrollRight = () => {
  //   if (scrollRef.current) {
  //     scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  //   }
  // };

  // 🆕 Handle empty state with friendly message
  if (cards.length === 0 && emptyMessage) {
    return (
      <section className="insight-section">
        <div className="insight-section-header">
          <h2 className="insight-section-title">{title}</h2>
        </div>
        <div className="insight-empty-state">
          <div className="empty-state-icon">📌</div>
          <p className="empty-state-message">{emptyMessage}</p>
        </div>
      </section>
    );
  }

  if (cards.length === 0) return null;

  return (
    <section className="insight-section">
      <div className="insight-section-header">
        <h2 className="insight-section-title">{title}</h2>
        {onShowMore && (
          <button className="insight-show-more" onClick={onShowMore}>
            Show More
          </button>
        )}
      </div>
      <div style={{ position: 'relative' }}>
        <div className="insight-scroll" ref={scrollRef}>
          {cards.map((card) => (
            <Card key={card.id} card={card} onExpand={onExpand} />
          ))}
        </div>
        {/* <button onClick={scrollLeft} className="insight-nav-btn insight-nav-left">
          <FiChevronLeft />
        </button>
        <button onClick={scrollRight} className="insight-nav-btn insight-nav-right">
          <FiChevronRight />
        </button> */}
      </div>
    </section>
  );
}


/* ============================================
   EMPTY STATE STYLES - For Pinned Cards
   ============================================ */

.insight-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  border: 2px dashed #dee2e6;
  margin: 24px 0;
  min-height: 280px;
  transition: all 0.3s ease;
}

.insight-empty-state:hover {
  border-color: #adb5bd;
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
  transform: translateY(-2px);
}

.empty-state-icon {
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.6;
  animation: gentle-bounce 2.5s ease-in-out infinite;
  filter: grayscale(20%);
}

.empty-state-message {
  font-size: 1rem;
  color: #6c757d;
  text-align: center;
  max-width: 480px;
  line-height: 1.7;
  margin: 0;
  font-weight: 400;
  letter-spacing: 0.01em;
}

/* Gentle bounce animation for the icon */
@keyframes gentle-bounce {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-12px) scale(1.05);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .insight-empty-state {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    border-color: #374151;
  }
  
  .insight-empty-state:hover {
    border-color: #4b5563;
    background: linear-gradient(135deg, #111827 0%, #0f172a 100%);
  }
  
  .empty-state-message {
    color: #9ca3af;
  }
  
  .empty-state-icon {
    opacity: 0.7;
    filter: grayscale(10%) brightness(1.1);
  }
}

/* Responsive - smaller screens */
@media (max-width: 768px) {
  .insight-empty-state {
    padding: 48px 24px;
    min-height: 220px;
  }
  
  .empty-state-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .empty-state-message {
    font-size: 0.9rem;
    max-width: 320px;
  }
}

/* Extra small screens */
@media (max-width: 480px) {
  .insight-empty-state {
    padding: 40px 20px;
    min-height: 200px;
  }
  
  .empty-state-icon {
    font-size: 40px;
  }
  
  .empty-state-message {
    font-size: 0.85rem;
    max-width: 280px;
  }
}





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

