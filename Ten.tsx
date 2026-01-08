useEffect(() => {
  const updateCardWidth = () => {
    const viewportWidth = window.innerWidth;
    const sidebarWidth = 100;
    const gap = 20;
    const padding = 100;
    const minCardWidth = 260;
    
    const availableWidth = viewportWidth - sidebarWidth - padding;
    const maxCards = Math.floor((availableWidth + gap) / (minCardWidth + gap));
    const cardWidth = (availableWidth - (gap * (maxCards - 1))) / maxCards;
    
    document.documentElement.style.setProperty('--dynamic-card-width', `${cardWidth}px`);
  };

  updateCardWidth();
  window.addEventListener('resize', updateCardWidth);
  return () => window.removeEventListener('resize', updateCardWidth);
}, []);
-----------------------
.insight-card {
  width: var(--dynamic-card-width, 280px);
  min-width: 260px;
  max-width: 350px;
  background: linear-gradient(135deg, #ffffff 0%, #f0fafb 100%);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}
-------------------
function TableauModal({ url, onClose }: { url: string; onClose: () => void }) {
  if (!url) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'rgba(0, 0, 0, 0.92)',
        backdropFilter: 'blur(12px)',
        zIndex: 4000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.5rem',
        animation: 'fadeIn 0.25s ease',
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
          width: '99vw',
          height: '98vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
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

        <div style={{ flex: '1', width: '100%', border: 'none' }}>
          <iframe src={url} style={{ width: '100%', height: '100%', border: 'none' }} />
        </div>
      </div>
    </div>
  );
}
-------------