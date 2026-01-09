function TableauModal({ url, onClose, card }: { url: string; onClose: () => void; card: InsightCard | null }) {
  const [loadTime, setLoadTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const loadStartTime = useRef<number>(Date.now());

  if (!url || !card) return null;

  const handleIframeLoad = () => {
    const endTime = Date.now();
    const timeTaken = ((endTime - loadStartTime.current) / 1000).toFixed(1);
    setLoadTime(parseFloat(timeTaken));
    setIsLoading(false);
  };

  const getTimeSinceRefresh = (lastAccessed: string): string => {
    if (!lastAccessed) return 'Unknown';
    const cleaned = lastAccessed.replace(/[\\\/\[\]$']+/g, '');
    const updated = new Date(cleaned);
    if (isNaN(updated.getTime())) return 'Unknown';
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    
    return updated.toLocaleString('en-US', options).replace(',', ' |');
  };

  const getDataQuality = (): { label: string; color: string } => {
    const random = Math.floor(Math.random() * 3);
    const qualities = [
      { label: 'Bronze', color: '#CD7F32' },
      { label: 'Silver', color: '#C0C0C0' },
      { label: 'Gold', color: '#FFD700' }
    ];
    return qualities[random];
  };

  const dataQuality = getDataQuality();

  return (
    <div className="insight-modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="insight-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="insight-modal-header">
          <div className="insight-modal-header-left">
            <h2>{card.customized_name || card.view_name}</h2>
            
            <button className="insight-header-icon" title="Dashboard Information">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
            </button>
            
            <button className="insight-header-icon insight-pin-icon" title="Pin Dashboard">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 17v5"/>
                <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>
              </svg>
            </button>
          </div>
          
          <div className="insight-modal-header-right">
            <span className="insight-modal-stat">
              Last Refreshed: {getTimeSinceRefresh(card.last_accessed)}
            </span>
            <span className="insight-modal-divider">|</span>
            <span className="insight-modal-stat">
              Load Time: {isLoading ? 'Loading...' : `${loadTime}s`}
            </span>
            <span className="insight-modal-divider">|</span>
            <span className="insight-modal-stat">
              Data Quality: 
              <span 
                className="insight-quality-circle" 
                style={{ backgroundColor: dataQuality.color }}
                title={dataQuality.label}
              />
            </span>
            <button onClick={onClose} className="insight-modal-close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <iframe 
          src={url} 
          className="insight-iframe" 
          onLoad={handleIframeLoad}
        />
      </div>
    </div>
  );
}
----------------------
.insight-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #008043 0%, #00a854 100%);
  color: #ffffff;
  min-height: 60px;
}

.insight-modal-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.insight-modal-header-left h2 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: #ffffff;
}

.insight-header-icon {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #ffffff;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
  padding: 0;
}

.insight-header-icon:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.insight-pin-icon:hover {
  background: rgba(255, 215, 0, 0.3);
}

.insight-modal-header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8125rem;
}

.insight-modal-stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffffff;
  white-space: nowrap;
}

.insight-modal-divider {
  color: rgba(255, 255, 255, 0.4);
  font-weight: 300;
}

.insight-quality-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  margin-left: 0.25rem;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.insight-modal-close {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #ffffff;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
  margin-left: 0.5rem;
  padding: 0;
}

.insight-modal-close:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: rotate(90deg);
}
----------------