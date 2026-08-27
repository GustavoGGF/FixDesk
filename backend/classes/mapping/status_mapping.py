from typing import Optional, TypedDict

class StatusMap(TypedDict):
    open: bool
    close: bool
    stop: Optional[bool] # Ou apenas None, se for o caso
    all: str