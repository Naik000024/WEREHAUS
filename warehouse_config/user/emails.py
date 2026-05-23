from djoser import email
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
import os

class CustomActivationEmail(email.ActivationEmail):
    # We leave these here, but we will override them in the send method
    template_name = "emails/activation.txt"
    html_template_name = "emails/activation.html"
    subject_template_name = "emails/activation_subject.txt"

    def get_context_data(self):
        context = super().get_context_data()
        # Explicitly read from settings.DJOSER to bypass Djoser's request-domain override
        djoser_settings = getattr(settings, 'DJOSER', {})
        domain = djoser_settings.get('DOMAIN', 'warehouse-frontend-bxqn.onrender.com')
        protocol = djoser_settings.get('PROTOCOL', 'https')
        
        # Dynamically adapt local IP for mobile / localhost testing
        request = getattr(self, 'request', None) or context.get('request')
        django_request = getattr(request, '_request', request) if request else None
        
        if django_request and hasattr(django_request, 'get_host') and 'RENDER' not in os.environ:
            try:
                host = django_request.get_host()
                if ':' in host:
                    ip_or_name = host.split(':')[0]
                    domain = f"{ip_or_name}:3000"
                else:
                    domain = f"{host}:3000"
                protocol = 'http'
            except Exception as e:
                print(f"--- [WARNING] Failed to dynamically resolve local host IP: {e} ---")
        
        uid = context.get("uid")
        token = context.get("token")
        context["url"] = f"{protocol}://{domain}/#/activate/{uid}/{token}"
        return context

    def send(self, to, *args, **kwargs):
        # 1. Get the data from context
        context = self.get_context_data()
        username = context.get("user").username
        activation_url = context.get("url")
        uid = context.get("uid")
        token = context.get("token")

        # 2. Set the Subject, Recipients, and Sender
        self.subject = "Activate your Warehouse Account"
        self.to = to
        self.from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'onboarding@resend.dev')

        # 3. Set the Body (Plain Text)
        self.body = (
            f"Hi {username},\n\n"
            f"Please click the link below to activate your account:\n"
            f"{activation_url}\n\n"
            f"Alternatively, if you are activating from the mobile app, use the following credentials:\n"
            f"UID: {uid}\n"
            f"Token: {token}\n\n"
            f"If you did not request this, please ignore this email."
        )

        print(f"--- HARDCODED SEND: Sending to {to} ---")
        return EmailMultiAlternatives.send(self, *args, **kwargs)