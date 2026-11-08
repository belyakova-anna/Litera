from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.auth import create_session_token, verify_session_token
from app.config import Settings, get_settings
from app.deps import require_login
from app.schemas import AuthMe, LoginRequest

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=AuthMe)
def login(
    body: LoginRequest,
    response: Response,
    settings: Settings = Depends(get_settings),
) -> AuthMe:
    if body.password != settings.litera_password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный пароль")
    token = create_session_token(settings)
    response.set_cookie(
        key=settings.cookie_name,
        value=token,
        httponly=True,
        samesite="lax",
        secure=settings.cookie_secure,
        max_age=settings.cookie_max_age,
        path="/",
    )
    return AuthMe(authenticated=True)


@router.post("/logout", response_model=AuthMe)
def logout(
    response: Response,
    settings: Settings = Depends(get_settings),
) -> AuthMe:
    response.delete_cookie(settings.cookie_name, path="/")
    return AuthMe(authenticated=False)


@router.get("/me", response_model=AuthMe)
def me(
    request: Request,
    settings: Settings = Depends(get_settings),
) -> AuthMe:
    token = request.cookies.get(settings.cookie_name)
    return AuthMe(authenticated=verify_session_token(settings, token))


@router.get("/ping")
def ping(_: None = Depends(require_login)) -> dict[str, str]:
    return {"status": "ok"}
