function InfoModal({ isOpen, onClose, card }: { isOpen: boolean; onClose: () => void; card: InsightCard | null }) {
  const [activeTab, setActiveTab] = useState<'sources' | 'quality'>('sources');
  
  if (!isOpen || !card) return null;

  const getDataSources = () => {
    const count = Math.floor(Math.random() * 3) + 1;
    return Array.from({ length: count }, (_, i) => `Data Source ${i + 1}`);
  };

  const getQualityStatus = () => {
    const statuses = [
      { label: 'Amber', color: '#FFA500', description: 'Data quality needs attention' },
      { label: 'Not Available', color: '#6B7280', description: 'Data Source 2 not yet has a monitoring in place' },
      { label: 'Green', color: '#10B981', description: 'All systems operational' }
    ];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const dataSources = getDataSources();
  const qualityStatus = getQualityStatus();
  const owner = card.owner || 'Unknown';

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
    
    return updated.toLocaleString('en-US', options);
  };

  return (
    <div className="info-modal-overlay" onClick={onClose}>
      <div className="info-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="info-modal-header">
          <h3>Additional Info</h3>
          <button className="info-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="info-modal-body">
          <div className="info-modal-section">
            <h4>{card.customized_name || card.view_name}</h4>
            <div className="info-modal-details">
              <p><strong>Owner:</strong> {owner}</p>
              <p><strong>Data Sources:</strong></p>
              <div className="info-data-sources">
                {dataSources.map((source, idx) => (
                  <span key={idx} className="info-source-badge">{source}</span>
                ))}
              </div>
              <p><strong>Data Source Owner:</strong> {owner}</p>
              <p><strong>Last Refresh:</strong> {getTimeSinceRefresh(card.last_accessed)}</p>
              <p><strong>Load Time:</strong> {(Math.random() * 5 + 10).toFixed(1)}s</p>
              <p><strong>Add Col 1:</strong> Custom Column</p>
            </div>
          </div>

          <div className="info-modal-section info-quality-section">
            <h4>Data Quality Overview</h4>
            <div className="info-quality-tabs">
              {dataSources.map((source, idx) => (
                <button
                  key={idx}
                  className={`info-quality-tab ${activeTab === 'quality' && idx === 0 ? 'active' : ''}`}
                  onClick={() => setActiveTab('quality')}
                >
                  {source}
                </button>
              ))}
            </div>

            <div className="info-quality-status">
              <p><strong>Current Status</strong></p>
              <div className="info-status-indicator">
                <span 
                  className="info-status-circle" 
                  style={{ backgroundColor: qualityStatus.color }}
                />
                <span className="info-status-label">{qualityStatus.label}</span>
              </div>
              <p className="info-status-cause"><strong>Status Cause</strong></p>
              <p className="info-status-description">{qualityStatus.description}</p>
            </div>
          </div>

          <button className="info-contact-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M22 7l-10 7L2 7"/>
            </svg>
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
-----------------------
.info-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.info-modal-container {
  background: #ffffff;
  border-radius: 12px;
  width: 90%;
  max-width: 1000px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.info-modal-header {
  background: linear-gradient(135deg, #008043 0%, #00a854 100%);
  color: #ffffff;
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.info-modal-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.info-modal-close {
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
}

.info-modal-close:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: rotate(90deg);
}

.info-modal-body {
  padding: 2rem;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.info-modal-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-modal-section h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.info-modal-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-modal-details p {
  font-size: 0.9375rem;
  color: #4b5563;
  margin: 0;
  line-height: 1.6;
}

.info-modal-details strong {
  color: #1f2937;
  font-weight: 600;
}

.info-data-sources {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.info-source-badge {
  background: #e5e7eb;
  color: #374151;
  padding: 0.375rem 0.875rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
}

.info-quality-section {
  background: #f9fafb;
  border-radius: 8px;
  padding: 1.5rem;
}

.info-quality-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.info-quality-tab {
  background: #e5e7eb;
  border: none;
  color: #6b7280;
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.info-quality-tab.active {
  background: #008043;
  color: #ffffff;
}

.info-quality-tab:hover {
  background: #00a854;
  color: #ffffff;
}

.info-quality-status {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-quality-status p {
  font-size: 0.9375rem;
  color: #4b5563;
  margin: 0;
}

.info-status-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
}

.info-status-circle {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
}

.info-status-label {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.info-status-cause {
  font-weight: 600;
  color: #6b7280;
  margin-top: 1rem;
}

.info-status-description {
  color: #4b5563;
  line-height: 1.6;
}

.info-contact-button {
  grid-column: 1 / -1;
  background: #008043;
  border: none;
  color: #ffffff;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  margin-top: 1rem;
  transition: all 0.3s;
}

.info-contact-button:hover {
  background: #00a854;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 128, 67, 0.3);
}
---------------