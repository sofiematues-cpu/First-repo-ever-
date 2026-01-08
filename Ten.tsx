useEffect(() => {
  const updateCardWidth = () => {
    // Get actual scroll container width
    const scrollContainer = document.querySelector('.insight-scroll');
    if (!scrollContainer) return;
    
    const containerWidth = scrollContainer.clientWidth;
    const gap = 20; // 1.25rem in pixels
    const minCardWidth = 260;
    const maxCardWidth = 320;
    
    // Calculate how many FULL cards can fit
    let numCards = Math.floor((containerWidth + gap) / (minCardWidth + gap));
    
    // Calculate exact card width to fill container perfectly
    let cardWidth = (containerWidth - (gap * (numCards - 1))) / numCards;
    
    // If cards would be too big, add one more card
    if (cardWidth > maxCardWidth && numCards > 1) {
      numCards += 1;
      cardWidth = (containerWidth - (gap * (numCards - 1))) / numCards;
    }
    
    // Ensure minimum width
    if (cardWidth < minCardWidth) {
      cardWidth = minCardWidth;
    }
    
    document.documentElement.style.setProperty('--dynamic-card-width', `${cardWidth}px`);
  };

  // Small delay to ensure DOM is ready
  setTimeout(updateCardWidth, 100);
  
  window.addEventListener('resize', updateCardWidth);
  return () => window.removeEventListener('resize', updateCardWidth);
}, []);
--------------------
.insight-section {
  margin-bottom: 3rem;
  position: relative;
  width: 100%;
}

.insight-scroll {
  display: flex;
  gap: 1.25rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding-bottom: 0.5rem;
  scrollbar-width: none;
  width: 100%;
}

.insight-scroll::-webkit-scrollbar {
  display: none;
}

.insight-card {
  width: var(--dynamic-card-width, 280px);
  min-width: var(--dynamic-card-width, 280px);
  max-width: var(--dynamic-card-width, 280px);
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
