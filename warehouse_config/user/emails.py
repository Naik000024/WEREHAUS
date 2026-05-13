from djoser import email

class CustomActivationEmail(email.ActivationEmail):
    # We leave these here, but we will override them in the send method
    template_name = "emails/activation.txt"
    html_template_name = "emails/activation.html"
    subject_template_name = "emails/activation_subject.txt"

    def get_context_data(self):
        context = super().get_context_data()
        # Ensure we have the user and the link
        user = context.get("user")
        context["url"] = f"http://localhost:3000/activate/{context.get('uid')}/{context.get('token')}"
        return context

    def send(self, to, *args, **kwargs):
        # 1. Get the data from context
        context = self.get_context_data()
        username = context.get("user").username
        activation_url = context.get("url")

        # 2. Set the Subject
        self.subject = "Activate your Warehouse Account"

        # 3. Set the Body (Plain Text)
        self.body = (
            f"Hi {username},\n\n"
            f"Please click the link below to activate your account:\n"
            f"{activation_url}\n\n"
            f"If you did not request this, please ignore this email."
        )

        print(f"--- HARDCODED SEND: Sending to {to} ---")
        return super().send(to, *args, **kwargs)