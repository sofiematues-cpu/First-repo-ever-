.insight-scroll {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  width: 100%;
  overflow: hidden;
}

.insight-section {
  margin-bottom: 1.5rem;
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-height: 320px;
  overflow: hidden;
}

.insight-card {
  width: var(--dynamic-card-width, 280px);
  min-width: var(--dynamic-card-width, 280px);
  max-width: var(--dynamic-card-width, 280px);
  height: 220px;
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

/* Hide cards beyond 5 */
.insight-card:nth-child(n+6) {
  display: none;
}

.insight-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  border-radius: #008043;
  background: #ffffff;
}
