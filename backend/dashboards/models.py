from django.db import models


# Create your models here.
class Equipaments(models.Model):
    equipament = models.ImageField(upload_to="equipaments/", null=True, blank=True)
    id = models.AutoField(primary_key=True)
    model = models.TextField(max_length=20, null=True, blank=True)
    company = models.TextField(max_length=20, null=True, blank=True)

    def __str__(self):
        return str(self.id)

    def save(self, *args, **kwargs):
        if not self.id:
            last_ticket = Equipaments.objects.order_by("-id").first()
            if last_ticket:
                self.id = last_ticket.id + 1
            else:
                self.id = 1

        super().save(*args, **kwargs)
