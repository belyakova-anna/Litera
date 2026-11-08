from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from app.config import Settings


def make_serializer(settings: Settings) -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(settings.session_secret, salt="litera-auth")


def create_session_token(settings: Settings) -> str:
    return make_serializer(settings).dumps({"ok": True})


def verify_session_token(settings: Settings, token: str | None) -> bool:
    if not token:
        return False
    try:
        data = make_serializer(settings).loads(token, max_age=settings.cookie_max_age)
        return bool(data.get("ok"))
    except (BadSignature, SignatureExpired):
        return False
