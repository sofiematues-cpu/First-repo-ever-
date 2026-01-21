.insight-scroll {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 0.5rem;
  padding-right: 1.25rem; /* 🆕 Add right padding */
  width: 100%;
  scroll-snap-type: x mandatory; /* 🆕 Snap to cards */
}

.insight-card {
  min-width: 280px;
  max-width: 280px;
  flex-shrink: 0;
  scroll-snap-align: start; /* 🆕 Snap cards into view */
}

/* Parent container */
.insight-section {
  margin-bottom: 2rem;
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  padding-right: 0; /* 🆕 Remove right padding from section */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
  overflow: hidden; /* 🆕 Clean edge cutoff */
}
