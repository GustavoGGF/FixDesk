from django.db import models
from os.path import join

class SupportTicket(models.Model):
    ticketRequester = models.CharField(max_length=31, blank=False)
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
    chat = models.TextField(max_length=10000, blank=True, null=True)
    equipament = models.TextField(max_length=30, blank=True, null=True)
    date_alocate = models.TextField(max_length=1000, blank=True, null=True)
    open = models.BooleanField(null=True, blank=False)
    details = models.TextField(max_length=1000, blank=True, null=True)
    last_sender = models.TextField(max_length=31, blank=False, null=True)
    last_viewer = models.TextField(max_length=10000, blank=False, null=True)
    technician_mail = models.EmailField(max_length=50, blank=True, null=True)

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
    # Definir `ticket` como chave primária e foreign key ao mesmo tempo
    ticket = models.ForeignKey(
        SupportTicket,
        on_delete=models.PROTECT,
        db_column='ticket_id',
        related_name='files',
    )
    file_name = models.CharField(max_length=255, null=True, blank=True)
    file_type = models.CharField(max_length=255, null=True, blank=True)
    data = models.BinaryField(null=True, blank=True)  # Usando BinaryField para armazenar binários (longblob no MySQL)

    class Meta:
        db_table = 'helpdesk_ticketfile'
        managed = False

class TicketMail(models.Model):
    ticket = models.ForeignKey(
        SupportTicket,
        on_delete=models.PROTECT,
        db_column='ticket_id',
    )
    send_date  = models.DateField(null=False, blank=False)
    
    class Meta:
        db_table = 'helpdesk_ticketmail'
        managed = True
