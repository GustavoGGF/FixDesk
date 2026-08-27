from typing import TypedDict, Sequence


class UserList(TypedDict):
    id: int
    first_name: str
    last_name: str
    groups: Sequence[str]
