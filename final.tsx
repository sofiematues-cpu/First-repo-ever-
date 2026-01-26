/* ============================================
   EMPTY STATE - Clean, Professional, Light
   ============================================ */
.insight-empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 40px 20px;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border-radius: 12px;
    border: 1px dashed #e0e0e0;
    margin: 10px 0;
}

.insight-empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.6;
    filter: grayscale(20%);
}

.insight-empty-state h3 {
    font-size: 18px;
    color: #374151;
    margin-bottom: 8px;
    font-weight: 600;
}

.insight-empty-state p {
    font-size: 14px;
    color: #6b7280;
    max-width: 400px;
    margin: 0 auto;
    line-height: 1.5;
}

/* ============================================
   SHOW MORE BUTTON - Clean & Professional
   ============================================ */
.insight-show-more {
    background: transparent;
    border: none;
    color: #008043;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 6px;
    transition: all 0.2s ease;
}

.insight-show-more:hover {
    background: rgba(0, 128, 67, 0.08);
    color: #006635;
}

/* ============================================
   EXPANDED SECTION - Professional Layout
   ============================================ */
.insight-expanded-section {
    background: #ffffff;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    margin-bottom: 24px;
}

.insight-expanded-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
}

.insight-expanded-header h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
}

.insight-collapse-btn {
    background: #f3f4f6;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    font-size: 18px;
    transition: all 0.2s ease;
}

.insight-collapse-btn:hover {
    background: #e5e7eb;
    color: #374151;
}

.insight-expanded-content {
    max-height: 60vh;
    overflow-y: auto;
    padding-right: 8px;
}

.insight-expanded-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
}

/* Responsive grid for expanded section */
@media (max-width: 1600px) {
    .insight-expanded-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

@media (max-width: 1280px) {
    .insight-expanded-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 1024px) {
    .insight-expanded-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* ============================================
   LOAD MORE BUTTON - Professional Style
   ============================================ */
.insight-load-more-container {
    display: flex;
    justify-content: center;
    padding: 24px 0;
    margin-top: 16px;
}

.insight-load-more-btn {
    background: linear-gradient(135deg, #008043 0%, #006635 100%);
    color: #ffffff;
    border: none;
    padding: 12px 32px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 128, 67, 0.2);
}

.insight-load-more-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 128, 67, 0.3);
}

.insight-load-more-btn:active {
    transform: translateY(0);
}

.insight-load-more-btn:disabled {
    background: #d1d5db;
    cursor: not-allowed;
    box-shadow: none;
}

/* ============================================
   LOADING STATE - Clean Spinner
   ============================================ */
.insight-loading-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 40px;
    color: #6b7280;
}

.insight-loading-spinner {
    display: inline-block;
    width: 32px;
    height: 32px;
    border: 3px solid #f3f4f6;
    border-top-color: #008043;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* ============================================
   SCROLLBAR STYLING FOR EXPANDED CONTENT
   ============================================ */
.insight-expanded-content::-webkit-scrollbar {
    width: 6px;
}

.insight-expanded-content::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 3px;
}

.insight-expanded-content::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
}

.insight-expanded-content::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
}
