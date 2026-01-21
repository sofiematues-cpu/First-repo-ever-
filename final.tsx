.insight-scroll {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  width: 100%;
  max-width: 100%;
}

.insight-section {
  margin-bottom: 1.5rem;
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 100%;
  overflow: hidden; /* THIS IS KEY! */
}

.insight-card {
  width: 100%;
  min-width: 0; /* THIS IS KEY! */
  background: linear-gradient(135deg, #ffffff 0%, #f0fafb 100%);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}
