from typing import Any, TypedDict, Sequence


class HistogramData(TypedDict):
    days: Sequence[str | int]
    values: Any
