const [pinnedCards, setPinnedCards] = useState<InsightCard[]>([]);
const [pinnedCardsLoading, setPinnedCardsLoading] = useState(true);




useEffect(() => {
  fetchDashboards();
  LoadPinnedCards();
}, []);




{expandedSection === 'pinned' && pinnedCards.length > 0 && (



{pinnedCardsLoading ? (
  <div className="insight-loading-state">
    <div className="insight-loading-spinner"></div>
    <p>Loading pinned cards...</p>
  </div>
) : (
  <ScrollSection cards={pinnedCards} onExpand={handleLoadMore} expandedSection={expandedSection} />
)}
