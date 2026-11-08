from fastapi import Depends, HTTPException, Request, status

from app.auth import verify_session_token
from app.config import Settings, get_settings


def require_login(
    request: Request,
    settings: Settings = Depends(get_settings),
) -> None:
    token = request.cookies.get(settings.cookie_name)
    if not verify_session_token(settings, token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Требуется вход",
        )
