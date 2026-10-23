"""HTTP routes. Paths and response shapes match the frontend (/api/resources...)."""
from typing import Optional

from fastapi import APIRouter, HTTPException

from app.models import ResourceCreate, ResourceList, ResourceOne
from app.services import resource_service as svc

router = APIRouter(prefix="/resources", tags=["resources"])


def _or_404(item):
    if item is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    return {"resource": item}


@router.get("", response_model=ResourceList)
def list_resources(subject: Optional[str] = None, level: Optional[str] = None,
                   q: Optional[str] = None):
    return {"resources": svc.list_resources(subject, level, q)}


@router.post("", response_model=ResourceOne, status_code=201)
def create_resource(payload: ResourceCreate):
    return {"resource": svc.create_resource(payload)}


@router.get("/{resource_id}", response_model=ResourceOne)
def get_resource(resource_id: int):
    return _or_404(svc.get_resource(resource_id))


@router.post("/{resource_id}/helpful", response_model=ResourceOne)
def helpful(resource_id: int):
    return _or_404(svc.mark_helpful(resource_id))


@router.post("/{resource_id}/flag", response_model=ResourceOne)
def flag(resource_id: int):
    return _or_404(svc.flag_resource(resource_id))
