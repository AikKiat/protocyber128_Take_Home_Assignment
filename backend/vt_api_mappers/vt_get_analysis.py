from typing import Dict, Optional
from pydantic import Field
from api.vt_base_mapper_model import VTBaseModel
from constants import Category, Status


class EngineResult(VTBaseModel):
    category: Category
    engine_name: str
    engine_version: Optional[str] = None
    engine_update: Optional[str] = None
    method: Optional[str] = None
    result: Optional[str] = None


class AnalysisStats(VTBaseModel):
    confirmed_timeout: Optional[int] = Field(None, alias="confirmed-timeout")
    failure: Optional[int] = None
    harmless: Optional[int] = None
    malicious: Optional[int] = None
    suspicious: Optional[int] = None
    timeout: Optional[int] = None
    type_unsupported: Optional[int] = Field(None, alias="type-unsupported")
    undetected: Optional[int] = None


class AnalysisAttributes(VTBaseModel):
    date: int
    status: Status
    results: Dict[str, EngineResult] = {}
    stats: Optional[AnalysisStats] = None


class AnalysisResponsePayload(VTBaseModel):
    id: str
    type: str
    attributes: AnalysisAttributes
