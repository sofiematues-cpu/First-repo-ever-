/* Expanded overlay - full screen */
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

/* Expanded header */
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

/* Scrollable content area */
.insight-expanded-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
}

/* Grid - 5 cards per row */
.insight-expanded-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  max-width: 1800px;
  margin: 0 auto;
}

/* Load More button - centered at bottom */
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

/* Responsive - adjust columns */
@media (max-width: 1600px) {
  .insight-expanded-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1200px) {
  .insight-expanded-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .insight-expanded-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .insight-expanded-grid {
    grid-template-columns: 1fr;
  }
}
