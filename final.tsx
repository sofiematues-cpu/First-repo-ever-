useEffect(()=>{
    const handleResize = () =>{
        const count = getVisibleCount();
        setVisibleCounts(prev =>{
            // Don't reset if a section is expanded
            if(expandedSection === 'recommended' || expandedSection === 'permissioned'){
                return prev;
            }
            
            if(prev.recommended !== count){
                return{
                    ...prev,
                    recommended : count,
                    permissioned : count,
                };
            }
            return prev;
        });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    const interval = setInterval(handleResize, 1000);
    
    return () => {
        window.removeEventListener('resize', handleResize);
        clearInterval(interval);
    };
}, [expandedSection]); // <-- ADD THIS DEPENDENCY
