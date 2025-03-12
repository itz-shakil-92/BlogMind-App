from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from typing import List, Dict, Any, Optional
from jinja2 import Environment, select_autoescape, FileSystemLoader
from app.config import settings

# Configure FastMail
conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_TLS=settings.MAIL_TLS,
    MAIL_SSL=settings.MAIL_SSL,
    USE_CREDENTIALS=settings.MAIL_USE_CREDENTIALS,
    VALIDATE_CERTS=settings.MAIL_VALIDATE_CERTS,
    TEMPLATE_FOLDER=settings.TEMPLATES_DIR
)

# Create Jinja2 environment
env = Environment(
    loader=FileSystemLoader(settings.TEMPLATES_DIR),
    autoescape=select_autoescape(["html", "xml"])
)


async def send_email(
        email_to: List[EmailStr],
        subject: str,
        template_name: str,
        template_data: Dict[str, Any]
):
    """Send an email using a template"""
    # Render template
    template = env.get_template(f"{template_name}.html")
    html_content = template.render(**template_data)

    # Create message
    message = MessageSchema(
        subject=subject,
        recipients=email_to,
        body=html_content,
        subtype="html"
    )

    # Send email
    fm = FastMail(conf)
    await fm.send_message(message)


async def send_comment_notification(
        blog_author_email: EmailStr,
        blog_title: str,
        comment_author_name: str,
        comment_content: str,
        blog_url: str
):
    """Send a notification when someone comments on a blog post"""
    await send_email(
        email_to=[blog_author_email],
        subject=f"New comment on your blog post: {blog_title}",
        template_name="comment_notification",
        template_data={
            "blog_title": blog_title,
            "comment_author": comment_author_name,
            "comment_content": comment_content,
            "blog_url": blog_url
        }
    )


async def send_like_notification(
        blog_author_email: EmailStr,
        blog_title: str,
        liker_name: str,
        blog_url: str
):
    """Send a notification when someone likes a blog post"""
    await send_email(
        email_to=[blog_author_email],
        subject=f"Someone liked your blog post: {blog_title}",
        template_name="like_notification",
        template_data={
            "blog_title": blog_title,
            "liker_name": liker_name,
            "blog_url": blog_url
        }
    )


async def send_welcome_email(
        user_email: EmailStr,
        user_name: str
):
    """Send a welcome email to a new user"""
    await send_email(
        email_to=[user_email],
        subject="Welcome to BlogMind!",
        template_name="welcome_email",
        template_data={
            "user_name": user_name
        }
    )