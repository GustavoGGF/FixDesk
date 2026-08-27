from dataclasses import dataclass


@dataclass
class ChatLogEntryConversation:
    date: str
    user: str
    message: str
    hours: str

    def __str__(self) -> str:
        return f",[[Date:{self.date}],[System:{self.user} {self.message}],[Hours:{self.hours}]]"
