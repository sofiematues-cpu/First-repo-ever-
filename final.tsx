/* Updated .insight-scroll for Recommended and Permissioned sections */
.insight-scroll {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
    width: 100%;
    overflow: hidden;
}

/* Hide scrollbar */
.insight-scroll::-webkit-scrollbar {
    display: none;
}

/* Card sizing - let grid control the width */
.insight-card {
    width: 100%;
    min-width: 0; /* Important for grid children */
    max-width: 100%;
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

/* Remove the nth-child hiding rule */
.insight-card:nth-child(n+6) {
    display: block; /* Changed from none */
}

/* Responsive breakpoints for Recommended/Permissioned */
/* Small laptop ~1280px: 5 cards */
@media (min-width: 1280px) {
    .insight-scroll {
        grid-template-columns: repeat(5, 1fr);
    }
}

/* Larger monitors ~1600px: 6-7 cards */
@media (min-width: 1600px) {
    .insight-scroll {
        grid-template-columns: repeat(6, 1fr);
    }
}

@media (min-width: 1800px) {
    .insight-scroll {
        grid-template-columns: repeat(7, 1fr);
    }
}

/* Huge monitors ~1920px+: 8-9 cards */
@media (min-width: 1920px) {
    .insight-scroll {
        grid-template-columns: repeat(8, 1fr);
    }
}

@media (min-width: 2200px) {
    .insight-scroll {
        grid-template-columns: repeat(9, 1fr);
    }
}

/* ============================================ */
/* PINNED BY ME SECTION - Compact Layout */
/* ============================================ */
.pinned-section .insight-scroll,
section.pinned-section .insight-scroll {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem; /* Smaller gap */
    width: auto;
}

.pinned-section .insight-card,
section.pinned-section .insight-card {
    width: auto;
    min-width: 200px;
    max-width: 280px;
    flex: 0 0 auto; /* Don't grow, don't shrink */
}

/* If pinned section uses different class structure */
.insight-section.pinned .insight-scroll {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}
