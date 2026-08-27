from django.db import models
from os.path import join
from typing import Any

class Area(models.Model):
    id = models.AutoField(primary_key=True)
    code = models.CharField(max_length=10, unique=True, null=False, blank=False)
    active = models.BooleanField(default=True, null=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'helpdesk_area'
        managed = True

    def __str__(self) -> str:
        return self.code

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
    respective_area = models.ForeignKey(Area, on_delete=models.PROTECT, db_column='respective_area')
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
    files: models.QuerySet["TicketFile"]

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

    def to_dict(self) -> dict[str, Any]:
        """
        Converte a instância do ticket de suporte em um dicionário.

        Este método serializa os campos do modelo Django para um dicionário JSON,
        garantindo que o identificador único do ticket seja incluído no retorno.

        Returns:
            dict[str, Any]: Dicionário contendo os dados dos campos do ticket e seu ID.
        """
        from json import loads
        from django.core.serializers import serialize
        fields = loads(serialize("json", [self]))[0]["fields"]
        fields["id"] = self.id
        fields["respective_area_code"] = self.respective_area.code if getattr(self, 'respective_area_id', None) else None
        return fields

class TicketFile(models.Model):
    id = models.AutoField(primary_key=True)
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
