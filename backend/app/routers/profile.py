from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_login
from app.models import Profile
from app.schemas import ProfileOut, ProfileUpdate

router = APIRouter(
    prefix="/api/profile",
    tags=["profile"],
    dependencies=[Depends(require_login)],
)


def _ensure_profile(db: Session) -> Profile:
    profile = db.get(Profile, 1)
    if profile is None:
        profile = Profile(id=1)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.get("", response_model=ProfileOut)
def get_profile(db: Session = Depends(get_db)) -> Profile:
    return _ensure_profile(db)


@router.patch("", response_model=ProfileOut)
def update_profile(body: ProfileUpdate, db: Session = Depends(get_db)) -> Profile:
    profile = _ensure_profile(db)
    data = body.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return profile
