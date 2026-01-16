from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from .models import PinnedCard
import json

@csrf_exempt
@login_required
def pin_card(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        card_id = data.get('card_id')
        
        # Check if already pinned
        if PinnedCard.objects.filter(user=request.user, card_id=card_id).exists():
            return JsonResponse({'success': False, 'message': 'Already pinned'})
        
        # Create pinned card
        PinnedCard.objects.create(
            user=request.user,
            card_id=card_id,
            card_data=data.get('card_data', {})
        )
        
        return JsonResponse({'success': True, 'message': 'Card pinned'})
    
    # GET - return user's pinned cards
    cards = PinnedCard.objects.filter(user=request.user).values()
    return JsonResponse({'success': True, 'data': list(cards)})

@csrf_exempt
@login_required
def unpin_card(request):
    data = json.loads(request.body)
    card_id = data.get('card_id')
    
    PinnedCard.objects.filter(user=request.user, card_id=card_id).delete()
    
    return JsonResponse({'success': True, 'message': 'Card unpinned'})
---------------
from django.urls import path
from . import views

urlpatterns = [
    path('pin-card/', views.pin_card, name='pin-card'),
    path('unpin-card/', views.unpin_card, name='unpin-card'),
]
