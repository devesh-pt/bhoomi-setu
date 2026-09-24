import os
from sqlalchemy.orm import Session
from app.adapters.base import BaseLandAdapter
from app.adapters.demo_adapter import DemoAdapter
from app.adapters.bhuiyan_adapter import BhuiyanAdapter

def get_land_adapter(db: Session) -> BaseLandAdapter:
    """
    Factory function returning active Land Record Adapter instance.
    Defaults to DemoAdapter querying local SQLite.
    Set RECORD_ADAPTER=bhuiyan to switch to BhuiyanAdapter stub.
    """
    adapter_name = os.getenv("RECORD_ADAPTER", "demo").lower()
    if adapter_name == "bhuiyan":
        return BhuiyanAdapter()
    return DemoAdapter(db)
