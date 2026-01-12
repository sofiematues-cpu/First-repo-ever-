<button 
  className="info-contact-button"
  onClick={() => {
    const subject = encodeURIComponent(`Support Request: ${card?.customized_name || card?.view_name || 'Dashboard'}`);
    const body = encodeURIComponent(
      `Hello Support Team,\n\n` +
      `I need assistance with the following dashboard:\n\n` +
      `Dashboard Name: ${card?.customized_name || card?.view_name || 'N/A'}\n` +
      `Owner: ${card?.owner || 'Unknown'}\n` +
      `Last Refresh: ${card?.last_accessed || 'N/A'}\n\n` +
      `Issue Description:\n[Please describe your issue here]\n\n` +
      `Best regards`
    );
    window.location.href = `mailto:support@yourcompany.com?subject=${subject}&body=${body}`;
  }}
>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M22 7l-10 7L2 7"/>
  </svg>
  Contact Support
</button>
