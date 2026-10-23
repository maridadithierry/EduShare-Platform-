"""Request/response schemas. Field names match the frontend's Resource type."""
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator

Level = Literal["Primary", "Secondary", "University"]


class ResourceCreate(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    description: str = Field(default="", max_length=500)
    subject: str = Field(min_length=2, max_length=60)
    level: Level
    language: str = Field(default="English", max_length=30)
    url: str = Field(default="", max_length=500, pattern=r"^(https?://\S+)?$")

    @field_validator("level", mode="before")
    @classmethod
    def normalise_level(cls, v):
        return v.strip().capitalize() if isinstance(v, str) else v


class Resource(BaseModel):
    id: int
    title: str
    description: str
    subject: str
    level: str
    language: str
    helpfulCount: int
    url: Optional[str] = ""


class ResourceList(BaseModel):
    resources: list[Resource]


class ResourceOne(BaseModel):
    resource: Resource
