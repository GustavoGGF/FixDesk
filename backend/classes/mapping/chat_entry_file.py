from dataclasses import dataclass


@dataclass
class ChatLogEntryFile:
    date: str
    user: str
    action: str
    hours: str

    def __str__(self) -> str:
        return f",[[Date:{self.date}],[System:{self.user} {self.action}],[Hours:{self.hours}]]"
