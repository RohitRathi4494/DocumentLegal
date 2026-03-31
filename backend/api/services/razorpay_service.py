import razorpay
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class RazorpayService:
    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

    @classmethod
    def create_subscription(cls, plan_id, customer_email, total_count=12):
        """
        Creates a subscription in Razorpay.
        """
        try:
            data = {
                "plan_id": plan_id,
                "total_count": total_count,
                "quantity": 1,
                "customer_notify": 1,
                "notes": {
                    "email": customer_email
                }
            }
            subscription = cls.client.subscription.create(data)
            return subscription
        except Exception as e:
            logger.error(f"Razorpay subscription creation failed: {str(e)}")
            raise e

    @classmethod
    def verify_webhook(cls, body, signature):
        """
        Verifies the Razorpay webhook signature.
        """
        try:
            return cls.client.utility.verify_webhook_signature(
                body, 
                signature, 
                settings.RAZORPAY_WEBHOOK_SECRET
            )
        except Exception as e:
            logger.error(f"Razorpay webhook verification failed: {str(e)}")
            return False

    @classmethod
    def cancel_subscription(cls, subscription_id):
        """
        Cancels a subscription in Razorpay.
        """
        try:
            return cls.client.subscription.cancel(subscription_id, {"cancel_at_cycle_end": 0})
        except Exception as e:
            logger.error(f"Razorpay subscription cancellation failed: {str(e)}")
            raise e
