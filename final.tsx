return (
  <AuthProvider>
    <Header title="Insights" />
    <div className="insights-page">
      <main>
        {/* Show sections only when NOT expanded */}
        {!expandedSection && (
          <>
            <ScrollSection
              title="Recommended"
              cards={recommendedPreview}
              onExpand={handleExpand}
              onShowMore={() => handleShowMore('recommended')}
            />

            <section className="pinned-section">
              <ScrollSection
                title="Pinned by Me"
                cards={pinnedCards.slice(0, Math.min(5, pinnedCards.length))}
                onExpand={handleExpand}
                onShowMore={pinnedCards.length > 5 ? () => handleShowMore('pinned') : undefined}
                onPinClick={handlePinClick}
                emptyMessage="You haven't pinned any cards yet. Click the pin icon 📌 on any card to save your favorites here!"
              />
            </section>

            <ScrollSection
              title="Permissioned"
              cards={permissionedPreview}
              onExpand={handleExpand}
              onShowMore={() => handleShowMore('permissioned')}
            />
          </>
        )}

        {/* Expanded sections - full screen */}
        {expandedSection === 'pinned' && (
          <ExpandedSection
            title="Pinned by Me"
            allCards={pinnedCards}
            visibleCount={visibleCounts.pinned}
            onExpand={handleExpand}
            onLoadMore={() => handleLoadMore('pinned')}
            onCollapse={handleCollapse}
            hasMore={visibleCounts.pinned < pinnedCards.length}
          />
        )}

        {expandedSection === 'recommended' && (
          <ExpandedSection
            title="Recommended"
            allCards={allRecommendedCards}
            visibleCount={visibleCounts.recommended}
            onExpand={handleExpand}
            onLoadMore={() => handleLoadMore('recommended')}
            onCollapse={handleCollapse}
            hasMore={visibleCounts.recommended < allRecommendedCards.length}
          />
        )}

        {expandedSection === 'permissioned' && (
          <ExpandedSection
            title="Permissioned"
            allCards={allPermissionedCards}
            visibleCount={visibleCounts.permissioned}
            onExpand={handleExpand}
            onLoadMore={() => handleLoadMore('permissioned')}
            onCollapse={handleCollapse}
            hasMore={visibleCounts.permissioned < allPermissionedCards.length}
          />
        )}
      </main>

      {tableauUrl && (
        <TableauModal
          url={tableauUrl}
          onClose={handleCloseTableau}
          card={infoModalCard}
          onInfoClick={handleInfoClick}
          pinnedCards={pinnedCards}
          isOpen={infoModalOpen}
          onClose={() => setInfoModalOpen(false)}
          card={infoModalCard}
        />
      )}
    </div>
  </AuthProvider>
);
