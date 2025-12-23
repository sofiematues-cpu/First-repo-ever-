useEffect(() => {
  const fetchDashboards = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ TableauAPI.explore() already returns the data, not response
      const data = await TableauAPI.explore('', 100);
      
      console.log('✅ API Data received:', data);
      console.log('✅ Number of results:', data.results?.length);
      
      const dashboards = data.results || [];

      // Transform API response to InsightCard format
      const transformedCards: InsightCard[] = dashboards.map((dashboard: any) => {
        const timeSinceRefresh = dashboard.updated_at 
          ? getTimeSinceRefresh(dashboard.updated_at)
          : 'Unknown';

        return {
          id: dashboard.id?.toString() || Math.random().toString(),
          title: dashboard.title || dashboard.view_name || 'Untitled',
          subtitle: `Validated - Last refresh: ${timeSinceRefresh}`,
          tag: dashboard.tag || dashboard.project_name || 'General',
          meta: `Viewed ${dashboard.view_count || 0} this month - Owner: ${dashboard.owner || 'Unknown'}`,
          tableauUrl: dashboard.url_attempt_2_repos || dashboard.url_attempt_1 || '',
          view_name: dashboard.view_name,
          workbook_name: dashboard.workbook_name,
          project_name: dashboard.project_name,
          owner: dashboard.owner,
          view_count: dashboard.view_count,
          updated_at: dashboard.updated_at
        };
      });

      // Split cards into sections
      const sortedByViews = [...transformedCards].sort((a, b) => 
        (b.view_count || 0) - (a.view_count || 0)
      );
      setPinnedCards(sortedByViews.slice(0, 10));
      setRecommendedCards(sortedByViews.slice(10, 20));
      setPermissionedCards(sortedByViews.slice(20));

      setLoading(false);
    } catch (err: any) {
      console.error('❌ Error fetching dashboards:', err);
      console.error('❌ Error message:', err.message);
      setError('Failed to load dashboards. Please try again.');
      setLoading(false);
    }
  };

  fetchDashboards();
}, []);
