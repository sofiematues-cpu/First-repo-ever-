from django.db import models
from apps.accounts.models import User


class PinnedCard(models.Model):
    """Store pinned Tableau cards for users"""
    
    # User relationship
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pinned_cards')
    
    # Core card identity (from Tableau API)
    card_id = models.IntegerField(db_index=True)  # "id" field from API
    customized_name = models.CharField(max_length=500, blank=True, default='')
    url_id = models.CharField(max_length=200, blank=True, default='')
    
    # View information
    view_name = models.CharField(max_length=500, blank=True, default='')
    view_repository_url = models.TextField(blank=True, default='')
    view_index = models.IntegerField(default=0)
    
    # Workbook information
    workbook_name = models.CharField(max_length=500, blank=True, default='')
    workbook_repo_url = models.CharField(max_length=500, blank=True, default='')
    
    # Site information
    site_name = models.CharField(max_length=200, blank=True, default='')
    site_url_namespace = models.CharField(max_length=200, blank=True, default='')
    
    # Access information
    last_accessed = models.CharField(max_length=100, blank=True, default='')
    is_public = models.BooleanField(default=False)
    
    # URL attempts (the actual Tableau URLs)
    url_attempt_1_url_id = models.TextField(blank=True, default='')
    url_attempt_2_repo = models.TextField(blank=True, default='')
    url_attempt_3_simple = models.TextField(blank=True, default='')
    
    # Metadata
    pinned_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'pinned_cards'
        ordering = ['-pinned_at']
        unique_together = ['user', 'card_id']
        indexes = [
            models.Index(fields=['user', '-pinned_at']),
            models.Index(fields=['card_id']),
        ]

    def __str__(self):
        return f"{self.user.oidc_sub} - {self.customized_name or self.view_name} ({self.card_id})"
-----------/////////
from rest_framework import serializers
from .models import PinnedCard


class PinCardSerializer(serializers.Serializer):
    """Serializer for pinning a card - accepts full card data"""
    card_id = serializers.IntegerField(required=True)
    customized_name = serializers.CharField(required=False, allow_blank=True, default='')
    url_id = serializers.CharField(required=False, allow_blank=True, default='')
    view_name = serializers.CharField(required=False, allow_blank=True, default='')
    view_repository_url = serializers.CharField(required=False, allow_blank=True, default='')
    view_index = serializers.IntegerField(required=False, default=0)
    workbook_name = serializers.CharField(required=False, allow_blank=True, default='')
    workbook_repo_url = serializers.CharField(required=False, allow_blank=True, default='')
    site_name = serializers.CharField(required=False, allow_blank=True, default='')
    site_url_namespace = serializers.CharField(required=False, allow_blank=True, default='')
    last_accessed = serializers.CharField(required=False, allow_blank=True, default='')
    is_public = serializers.BooleanField(required=False, default=False)
    url_attempt_1_url_id = serializers.CharField(required=False, allow_blank=True, default='')
    url_attempt_2_repo = serializers.CharField(required=False, allow_blank=True, default='')
    url_attempt_3_simple = serializers.CharField(required=False, allow_blank=True, default='')


class PinnedCardSerializer(serializers.ModelSerializer):
    """Serializer for returning pinned cards - returns all fields"""
    class Meta:
        model = PinnedCard
        fields = [
            'card_id',
            'customized_name',
            'url_id',
            'view_name',
            'view_repository_url',
            'view_index',
            'workbook_name',
            'workbook_repo_url',
            'site_name',
            'site_url_namespace',
            'last_accessed',
            'is_public',
            'url_attempt_1_url_id',
            'url_attempt_2_repo',
            'url_attempt_3_simple',
            'pinned_at',
        ]
------------------
@method_decorator(csrf_exempt, name='dispatch')
class PinCardView(APIView):
    """
    Pin a card for the authenticated user with full card data.
    POST /api/pinned-cards/pin/
    Body: {full card object from Tableau API}
    """
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        # Validate request data
        serializer = PinCardSerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning(f"Invalid pin request: {serializer.errors}")
            return Response(
                {'success': False, 'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get authenticated user
        user, error_response = get_user_from_session(request)
        if error_response:
            return error_response
        
        try:
            # Create pinned card with ALL data in PostgreSQL
            pinned_card = PinnedCard.objects.create(
                user=user,
                card_id=serializer.validated_data['card_id'],
                customized_name=serializer.validated_data.get('customized_name', ''),
                url_id=serializer.validated_data.get('url_id', ''),
                view_name=serializer.validated_data.get('view_name', ''),
                view_repository_url=serializer.validated_data.get('view_repository_url', ''),
                view_index=serializer.validated_data.get('view_index', 0),
                workbook_name=serializer.validated_data.get('workbook_name', ''),
                workbook_repo_url=serializer.validated_data.get('workbook_repo_url', ''),
                site_name=serializer.validated_data.get('site_name', ''),
                site_url_namespace=serializer.validated_data.get('site_url_namespace', ''),
                last_accessed=serializer.validated_data.get('last_accessed', ''),
                is_public=serializer.validated_data.get('is_public', False),
                url_attempt_1_url_id=serializer.validated_data.get('url_attempt_1_url_id', ''),
                url_attempt_2_repo=serializer.validated_data.get('url_attempt_2_repo', ''),
                url_attempt_3_simple=serializer.validated_data.get('url_attempt_3_simple', ''),
            )
            logger.info(
                f"✓ User {user.oidc_sub} ({user.full_name}) pinned card '{pinned_card.customized_name or pinned_card.view_name}' "
                f"[ID: {pinned_card.card_id}] - Saved FULL data to PostgreSQL"
            )
            return Response(
                {'success': True, 'message': 'Card pinned successfully'},
                status=status.HTTP_201_CREATED
            )
        except IntegrityError:
            logger.warning(
                f"User {user.oidc_sub} attempted to pin duplicate card {serializer.validated_data['card_id']}"
            )
            return Response(
                {'success': False, 'error': 'Card already pinned'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error pinning card for {user.oidc_sub}: {str(e)}")
            return Response(
                {'success': False, 'error': 'Failed to pin card'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
--------------------
export const pinCard = async (card: InsightCard): Promise<PinCardResponse> => {
  try {
    const response = await fetch('/api/pinned-cards/pin/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        card_id: card.id,
        customized_name: card.customized_name || '',
        url_id: card.url_id || '',
        view_name: card.view_name || '',
        view_repository_url: card.view_repository_url || '',
        view_index: card.view_index || 0,
        workbook_name: card.workbook_name || '',
        workbook_repo_url: card.workbook_repo_url || '',
        site_name: card.site_name || '',
        site_url_namespace: card.site_url_namespace || '',
        last_accessed: card.last_accessed || '',
        is_public: card.is_public || false,
        url_attempt_1_url_id: card.url_attempt_1_url_id || '',
        url_attempt_2_repo: card.url_attempt_2_repo || '',
        url_attempt_3_simple: card.url_attempt_3_simple || '',
      }),
    });
    return await response.json();
  } catch (error: any) {
    console.error('Error pinning card:', error);
    if (error.response?.status === 400) {
      throw new Error('Card is already pinned');
    }
    if (error.response?.status === 400) {
      throw new Error('Invalid card data');
    }
    throw error;
  }
};
---------------------
const handlePinClick = async (card: InsightCard) => {
  const isPinned = pinnedCards.some((c) => c.id === card.id);
  
  try {
    if (isPinned) {
      // Unpin
      await unpinCard(card.id);
      setPinnedCards((prev) => prev.filter((c) => c.id !== card.id));
    } else {
      // Pin with animation
      const response = await pinCard(card);
      if (response.success) {
        // Add animation class temporarily
        const cardElement = document.querySelector(`[data-card-id="${card.id}"]`);
        cardElement?.classList.add('pinning');
        setTimeout(() => cardElement?.classList.remove('pinning'), 400);
        
        // Add to pinned cards with animation
        setPinnedCards((prev) => {
          const newCards = [card, ...prev];
          // Trigger animation on first card in pinned section
          setTimeout(() => {
            const firstPinnedCard = document.querySelector('.pinned-section .insight-card');
            firstPinnedCard?.classList.add('pinned-animation');
            setTimeout(() => firstPinnedCard?.classList.remove('pinned-animation'), 500);
          }, 100);
          return newCards;
        });
      }
    }
  } catch (error: any) {
    console.error('Error toggling pin:', error);
    if (error.message === 'Card is already pinned') {
      // Already pinned, just update state
      setPinnedCards((prev) => prev.filter((c) => c.id !== card.id));
    }
  }
};
----------------------
{/* Pinned by Me section - only show if cards exist */}
{pinnedCards.length > 0 && (
  <section className="pinned-section">
    <ScrollSection
      title="Pinned by Me"
      cards={pinnedCards.slice(0, showMorePinned ? pinnedCards.length : 3)}
      onExpand={handleExpand}
      onShowMore={() => handleShowMore('pinned')}
      showMoreButton={pinnedCards.length > 3}
      showingAll={showMorePinned || pinnedCards.length <= 3}
      onPinClick={handlePinClick}
    />
  </section>
)}
-------------------
/* GREEN pin icon styling */
.insight-card-actions .pin-icon {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  color: #6b7280;
  stroke: currentColor;
  fill: none;
}

.insight-card-actions .pin-icon:hover {
  color: #10b981;
  transform: scale(1.1);
}

.insight-card-actions .pin-icon.filled {
  color: #10b981 !important;
  fill: #10b981 !important;
  stroke: #10b981 !important;
}

.insight-card-actions .pin-icon.filled:hover {
  color: #059669 !important;
  fill: #059669 !important;
  stroke: #059669 !important;
  transform: scale(1.15) rotate(15deg);
}

/* Pin icon bounce animation */
@keyframes pinIconBounce {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.3) rotate(-15deg); }
  75% { transform: scale(1.3) rotate(15deg); }
}

.insight-card-actions .pin-icon.pinning {
  animation: pinIconBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Card appears in pinned section animation */
@keyframes pinCardAnimation {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(-30px);
  }
  60% {
    transform: scale(1.05) translateY(5px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.insight-card.pinned-animation {
  animation: pinCardAnimation 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
/-------------------