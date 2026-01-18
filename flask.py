{pinnedCards.length > 0 && (
  <ScrollSection
    title="Pinned by Me"
    cards={pinnedCards.slice(0, showMorePinned ? pinnedCards.length : 3)}
    onExpand={handleExpand}
    onShowMore={() => handleShowMore('pinned')}
    showMoreButton={pinnedCards.length > 3}
    showingAll={showMorePinned || pinnedCards.length <= 3}
    onPinClick={handlePinClick}
  />
)}
-----------------------
/* Pin animation */
@keyframes pinCardAnimation {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
  }
  60% {
    transform: scale(1.05) translateY(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.insight-card.pinned-animation {
  animation: pinCardAnimation 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Pin icon filled state with green */
.insight-card-actions .pin-icon.filled {
  color: #10b981; /* Beautiful green */
  fill: #10b981;
}

.insight-card-actions .pin-icon.filled:hover {
  color: #059669; /* Darker green on hover */
  fill: #059669;
}

/* Pin icon animation */
@keyframes pinIconBounce {
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.2) rotate(-10deg);
  }
  75% {
    transform: scale(1.2) rotate(10deg);
  }
}

.insight-card-actions .pin-icon.pinning {
  animation: pinIconBounce 0.4s ease;
}
--------------------
/* Update existing pin icon styles */
.insight-card-actions .pin-icon {
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6b7280;
  stroke: currentColor;
  fill: none;
}

.insight-card-actions .pin-icon:hover {
  color: #10b981; /* Green on hover */
  transform: scale(1.1);
}

.insight-card-actions .pin-icon.filled {
  color: #10b981; /* Beautiful green when pinned */
  fill: #10b981;
  stroke: #10b981;
}

.insight-card-actions .pin-icon.filled:hover {
  color: #059669;
  fill: #059669;
  stroke: #059669;
  transform: scale(1.15) rotate(15deg);
}
-------------