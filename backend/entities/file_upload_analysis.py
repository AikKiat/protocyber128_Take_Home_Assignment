from typing import Dict, Optional
from pydantic import Field
from entities.common import VTBaseModel
from constants import Category, Status


class EngineResult(VTBaseModel):
    category: Category
    engine_name: str
    engine_version: Optional[str]
    engine_update: Optional[str]
    method: Optional[str]
    result: Optional[str]


class AnalysisStats(VTBaseModel):
    confirmed_timeout: Optional[int] = Field(None, alias="confirmed-timeout")
    failure: Optional[int]
    harmless: Optional[int]
    malicious: Optional[int]
    suspicious: Optional[int]
    timeout: Optional[int]
    type_unsupported: Optional[int] = Field(None, alias="type-unsupported")
    undetected: Optional[int]


class AnalysisAttributes(VTBaseModel):
    date: int
    status: Status
    results: Dict[str, EngineResult] = {}
    stats: Optional[AnalysisStats]


class AnalysisResponse(VTBaseModel):
    id: str
    type: str
    attributes: AnalysisAttributes
