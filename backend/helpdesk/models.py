from django.db import models
from dashboards.models import Equipaments
from os.path import join


def support_ticket_file_path(instance, filename):
    return join("uploads", str(instance.ticket.id), filename)


class SupportTicket(models.Model):
    ticketRequester = models.CharField(max_length=30, blank=False)
    department = models.CharField(max_length=10, null=True, blank=True)
    mail = models.EmailField(max_length=50, blank=False)
    company = models.CharField(max_length=15)
    sector = models.CharField(max_length=20, blank=False)
    occurrence = models.CharField(max_length=20, blank=False, null=False)
    problemn = models.CharField(max_length=20, blank=False, null=False)
    observation = models.TextField(max_length=500, blank=True, null=True)
    start_date = models.DateTimeField(null=False)
    end_date = models.DateTimeField(null=True)
    respective_area = models.CharField(max_length=10, blank=False, null=False)
    responsible_technician = models.CharField(
        max_length=30, blank=True, null=True, editable=True
    )
    id = models.AutoField(primary_key=True)
    PID = models.IntegerField(null=False, blank=False)
    open = models.BooleanField(null=True, blank=False)
    chat = models.TextField(max_length=10000, blank=True, null=True)
    equipament = models.ForeignKey(
        Equipaments, blank=True, null=True, on_delete=models.SET_NULL
    )
    date_alocate = models.TextField(max_length=1000, blank=True, null=False)
    name_new_user = models.TextField(max_length=15, blank=True, null=False)
    sector_new_user = models.TextField(max_length=30, blank=True, null=False)
    where_from = models.TextField(max_length=30, blank=True, null=False)
    machine_new_user = models.BooleanField(blank=True, null=True)
    company_new_user = models.TextField(max_length=15, blank=True, null=False)
    software_new_user = models.TextField(max_length=300, blank=True, null=False)
    cost_center = models.IntegerField(null=False, blank=False, default=False)
    job_title_new_user = models.TextField(max_length=50, blank=True, null=False)
    start_work_new_user = models.TextField(max_length=60, blank=True, null=False)
    copy_profile_new_user = models.TextField(max_length=50, blank=True, null=False)
    mail_tranfer = models.TextField(max_length=30, blank=True, null=False)
    old_files = models.TextField(max_length=400, blank=True, null=False)
    details = models.TextField(max_length=1000, blank=True, null=True)

    def __str__(self):
        return str(self.id)

    def save(self, *args, **kwargs):
        if not self.id:
            last_ticket = SupportTicket.objects.order_by("-id").first()
            if last_ticket:
                self.id = last_ticket.id + 1
            else:
                self.id = 1

        super().save(*args, **kwargs)


class TicketFile(models.Model):
    ticket = models.ForeignKey(SupportTicket, on_delete=models.PROTECT)
    file = models.FileField(upload_to=support_ticket_file_path)

    def __str__(self):
        return str(self.id)

    def save(self, *args, **kwargs):
        if not self.id:
            last_ticket = TicketFile.objects.order_by("-id").first()
            if last_ticket:
                self.id = last_ticket.id + 1
            else:
                self.id = 1

        super().save(*args, **kwargs)
