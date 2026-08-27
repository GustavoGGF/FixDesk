class UserHelpDesk:
    name: str
    department: str
    job_title: str
    mail: str
    company: str
    helpdesk: str
    roles: list[str]

    def __init__(
        self,
        name: str | None,
        department: str | None,
        job_title: str | None,
        mail: str | None,
        company: str | None,
        helpdesk: str | list[str] | None,
        roles: list[str] | None = None,
    ) -> None:
        self.name = name or ""
        self.department = department or ""
        self.job_title = job_title or ""
        self.mail = mail or ""
        self.company = company or ""

        if isinstance(helpdesk, list):
            self.roles = [r for r in helpdesk if r]
            self.helpdesk = self.roles[0] if self.roles else ""
        elif isinstance(helpdesk, str):
            self.helpdesk = helpdesk
            if roles is not None:
                self.roles = [r for r in roles if r]
            elif helpdesk:
                self.roles = [helpdesk]
            else:
                self.roles = []
        else:
            self.helpdesk = ""
            self.roles = [r for r in roles if r] if roles is not None else []
