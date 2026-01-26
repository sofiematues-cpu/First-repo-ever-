// ============================================
// LOAD ALL DATA IN PARALLEL
// ============================================
useEffect(() => {
    const loadAllData = async () => {
        setIsPageLoading(true);
        
        try {
            // Fetch ALL APIs in parallel
            const [dashboardsData, pinnedCardsData] = await Promise.all([
                TableauAPI.explore('', 100).catch(err => {
                    console.error('Error fetching dashboards:', err);
                    return { results: [] };
                }),
                getPinnedCards().catch(err => {
                    console.error('Error loading pinned cards:', err);
                    return { success: false, data: [] };
                })
            ]);

            // Process dashboards data
            const dashboards = dashboardsData.results || [];
            const transformedCards: InsightCard[] = dashboards.map((dashboard: any) => ({
                id: dashboard.id,
                customized_name: dashboard.customized_name,
                site_name: dashboard.site_name,
                url_attempt_1_url_id: dashboard.url_attempt_1_url_id,
                url_attempt_2_repo: dashboard.url_attempt_2_repo || '',
                url_attempt_2_simple: dashboard.url_attempt_2_simple || '',
                url_id: dashboard.url_id,
                view_index: dashboard.view_index,
                view_name: dashboard.view_name,
                view_repository_url: dashboard.view_repository_url,
                workbook_name: dashboard.workbook_name,
                workbook_repo_url: dashboard.workbook_repo_url,
                last_accessed: dashboard.last_accessed,
                is_public: dashboard.is_public,
                view_count: dashboard.view_count || 0,
                owner: dashboard.owner || 'Unknown',
            }));

            const sortedByViews = [...transformedCards].sort((a, b) => (b.view_count || 0) - (a.view_count || 0));

            setAllRecommendedCards(sortedByViews.slice(0, 50));
            setAllPinnedCards(sortedByViews.slice(0, 50));
            setAllPermissionedCards(sortedByViews.slice(0, 50));

            setRecommendedPreview(sortedByViews.slice(0, 10));
            setPinnedPreview(sortedByViews.slice(0, 10));
            setPermissionedPreview(sortedByViews.slice(0, 10));

            // Process pinned cards data
            if (pinnedCardsData.success && pinnedCardsData.data) {
                const cards: InsightCard[] = pinnedCardsData.data.map((pinnedCard: any) => ({
                    id: pinnedCard.card_id,
                    customized_name: pinnedCard.customized_name || '',
                    url_id: pinnedCard.url_id || '',
                    view_name: pinnedCard.view_name,
                    view_repository_url: pinnedCard.view_repository_url || '',
                    view_index: pinnedCard.view_index || 0,
                    workbook_name: pinnedCard.workbook_name || '',
                    workbook_repo_url: pinnedCard.workbook_repo_url || '',
                    site_name: pinnedCard.site_name || '',
                    last_accessed: pinnedCard.last_accessed || '',
                    is_public: pinnedCard.is_public || false,
                    url_attempt_1_url_id: pinnedCard.url_attempt_1_url_id || '',
                    url_attempt_2_repo: pinnedCard.url_attempt_2_repo || '',
                    url_attempt_2_simple: pinnedCard.url_attempt_2_repo || '',
                    view_count: 0,
                    owner: '',
                }));
                setPinnedCards(cards);
            }

        } catch (error) {
            console.error('Error loading page data:', error);
        } finally {
            setIsPageLoading(false);
            setPinnedCardsLoading(false);
        }
    };

    loadAllData();
}, []);
