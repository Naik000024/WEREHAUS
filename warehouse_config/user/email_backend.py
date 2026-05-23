import os
import requests
from django.core.mail.backends.base import BaseEmailBackend
from django.conf import settings

class ResendEmailBackend(BaseEmailBackend):
    def send_messages(self, email_messages):
        if not email_messages:
            return 0
        
        api_key = os.environ.get('RESEND_API_KEY')
        if not api_key:
            # Fallback to console logs if API key is missing (great for local testing)
            print("\n--- [RESEND_OFFLINE] RESEND_API_KEY NOT FOUND. PRINTING EMAIL TO CONSOLE ---")
            for message in email_messages:
                print(f"FROM: {message.from_email or settings.DEFAULT_FROM_EMAIL}")
                print(f"TO: {', '.join(message.to)}")
                print(f"SUBJECT: {message.subject}")
                print(f"BODY:\n{message.body}")
                print("------------------------------------------------------------------------\n")
            return len(email_messages)

        sent_count = 0
        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        for message in email_messages:
            # Resend free tier onboarding requires the 'from' email to be onboarding@resend.dev
            # unless you have verified your own custom domain in Resend.
            from_email = os.environ.get('RESEND_FROM_EMAIL', 'onboarding@resend.dev')

            # Ensure we pass the html body correctly if it is an HTML email
            is_html = getattr(message, 'content_subtype', '') == 'html' or '<html' in message.body.lower()

            payload = {
                "from": from_email,
                "to": message.to,
                "subject": message.subject,
            }

            if is_html:
                payload["html"] = message.body
            else:
                payload["text"] = message.body

            try:
                response = requests.post(url, json=payload, headers=headers, timeout=10)
                if response.status_code in [200, 201]:
                    sent_count += 1
                    print(f"RESEND_UPLINK_SUCCESS: Activation email sent to {message.to}")
                else:
                    print(f"RESEND_API_ERROR: {response.status_code} - {response.text}")
            except Exception as e:
                print(f"RESEND_CONNECTION_ERROR: Failed to POST to Resend API. Details: {str(e)}")

        return sent_count
