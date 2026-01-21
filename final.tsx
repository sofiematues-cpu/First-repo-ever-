/* ============================================
   MAIN PAGE LAYOUT
   ============================================ */

.insights-page {
  margin-top: 56px;
  padding: 1.25rem;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.6), rgba(230, 253, 244, 0.4));
  min-height: calc(100vh - 56px);
}

/* ============================================
   SECTION STYLES
   ============================================ */

.insight-section {
  margin-bottom: 1.5rem;
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.insight-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.insight-section-content h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0;
}

/* ============================================
   SCROLL CONTAINER - NO HORIZONTAL SCROLL
   ============================================ */

.insight-scroll {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1.25rem;
  width: 100%;
  overflow: visible;
}

/* ============================================
   CARD STYLES
   ============================================ */

.insight-card {
  width: 100%;
  min-width: 0;
  background: linear-gradient(135deg, #ffffff 0%, #f0fafb 100%);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.insight-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  border-radius: #008043;
  background: #ffffff;
}

/* ============================================
   CARD ICONS - TABLEAU & PIN
   ============================================ */

.insight-card-icon {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tableau-icon {
  width: 18px !important;
  height: 18px !important;
  object-fit: contain;
  opacity: 0.75;
  transition: all 0.2s ease;
}

.insight-card-icon:hover .tableau-icon,
.insight-card:hover .tableau-icon {
  opacity: 1;
  transform: scale(1.05);
}

/* Pin button - top right corner */
.insight-pin-button {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
  padding: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.insight-pin-button:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.pin-icon {
  width: 16px !important;
  height: 16px !important;
  object-fit: contain;
  transition: all 0.2s ease;
}

.insight-pin-button.pinned .pin-icon {
  transform: rotate(-15deg);
}

/* ============================================
   EXPANDED SECTION - FULL SCREEN OVERLAY
   ============================================ */

.insight-expanded-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f9fafb;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.insight-expanded-header {
  flex-shrink: 0;
  padding: 20px 32px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.insight-collapse-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 32px;
  height: 32px;
}

.insight-collapse-btn:hover {
  color: #111827;
}

.insight-expanded-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
}

.insight-expanded-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  max-width: 1800px;
  margin: 0 auto;
}

/* ============================================
   LOAD MORE BUTTON
   ============================================ */

.insight-load-more-container {
  flex-shrink: 0;
  padding: 24px;
  text-align: center;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.insight-load-more-btn {
  padding: 14px 48px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.insight-load-more-btn:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

/* ============================================
   TABLEAU MODAL
   ============================================ */

.tableau-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: white;
}

.tableau-modal-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.tableau-modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 4px 8px;
}

.tableau-modal-close:hover {
  color: #111827;
}

/* ============================================
   EMPTY STATE - FOR PINNED CARDS
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

@keyframes gentle-bounce {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-12px) scale(1.05);
  }
}

/* ============================================
   RESPONSIVE DESIGN
   ============================================ */

@media (max-width: 1600px) {
  .insight-scroll {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .insight-expanded-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1200px) {
  .insight-scroll {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .insight-expanded-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .insight-scroll {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .insight-expanded-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
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

@media (max-width: 600px) {
  .insight-scroll {
    grid-template-columns: 1fr;
  }
  
  .insight-expanded-grid {
    grid-template-columns: 1fr;
  }
  
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

/* ============================================
   DARK MODE SUPPORT
   ============================================ */

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
