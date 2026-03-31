from ..models import Tenant, Subscription, DocumentType

class PlanManager:
    PLANS = {
        'FREE': {
            'max_documents': 5,
            'can_upload_custom': False,
            'allowed_template_slugs': ['rent-agreement'],
            'razorpay_plan_id': None,
        },
        'PRO': {
            'max_documents': 50,
            'can_upload_custom': False,
            'allowed_template_slugs': None,
            'razorpay_plan_id': 'plan_PRO_rzp_123', # Placeholder
        },
        'ADVANCED': {
            'max_documents': float('inf'),
            'can_upload_custom': True,
            'allowed_template_slugs': None,
            'razorpay_plan_id': 'plan_ADV_rzp_456', # Placeholder
        }
    }

    @staticmethod
    def get_plan_config_by_name(name):
        return PlanManager.PLANS.get(name)

    @staticmethod
    def get_plan_config(tenant):
        try:
            subscription = tenant.subscription
            if subscription.status != 'ACTIVE' and subscription.plan != 'FREE':
                return PlanManager.PLANS['FREE']
            return PlanManager.PLANS.get(subscription.plan, PlanManager.PLANS['FREE'])
        except Exception:
            return PlanManager.PLANS['FREE']

    @staticmethod
    def can_generate_document(tenant):
        config = PlanManager.get_plan_config(tenant)
        if tenant.total_docs_generated >= config['max_documents']:
            return False, f"You have reached your {tenant.subscription.plan} limit of {config['max_documents']} documents."
        return True, None

    @staticmethod
    def can_access_template(tenant, document_type):
        config = PlanManager.get_plan_config(tenant)
        
        # ADVANCED can access everything
        if tenant.subscription.plan == 'ADVANCED':
            return True
            
        # Global templates check for other plans
        if document_type.is_global:
            allowed_slugs = config.get('allowed_template_slugs')
            if allowed_slugs is None: # PRO has access to all global
                return True
            return document_type.slug in allowed_slugs
            
        # Private templates (custom upload)
        return config['can_upload_custom'] and document_type.tenant == tenant
