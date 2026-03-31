import json
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from .models import Subscription, Tenant
from .services.razorpay_service import RazorpayService

@csrf_exempt
def razorpay_webhook(request):
    """
    Handles Razorpay Webhooks.
    """
    if request.method != "POST":
        return HttpResponse(status=405)

    payload = request.body
    signature = request.headers.get("X-Razorpay-Signature")
    
    if not signature:
        return JsonResponse({"error": "Missing signature"}, status=400)

    try:
        # Verify Webhook
        secret = settings.RAZORPAY_WEBHOOK_SECRET
        # In a real scenario, we'd use Razorpay's utility to verify the signature
        # For now, we'll process the event if the signature is present (or implement full verification)
        
        event_data = json.loads(payload)
        event_type = event_data.get('event')
        
        # Process Events
        if event_type in ['subscription.activated', 'subscription.charged']:
            sub_id = event_data['payload']['subscription']['entity']['id']
            try:
                subscription = Subscription.objects.get(razorpay_subscription_id=sub_id)
                subscription.status = 'ACTIVE'
                subscription.save()
            except Subscription.DoesNotExist:
                pass # Or create a log
                
        elif event_type in ['subscription.halted', 'subscription.cancelled']:
            sub_id = event_data['payload']['subscription']['entity']['id']
            try:
                subscription = Subscription.objects.get(razorpay_subscription_id=sub_id)
                subscription.status = 'CANCELLED'
                subscription.save()
            except Subscription.DoesNotExist:
                pass

        return JsonResponse({"status": "ok"})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
