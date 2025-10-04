from django.db import models

class Trade(models.Model):
    date = models.DateField()
    entry_time = models.TimeField()
    exit_time = models.TimeField()
    index = models.CharField(max_length=50)
    type = models.CharField(max_length=10)       # Call / Put
    trend = models.CharField(max_length=20)      # With / Against Trend
    plan = models.CharField(max_length=20)       # Planned / Overtrade
    pl = models.FloatField()
    brokerage = models.FloatField()
    charges = models.FloatField()
    net_pl = models.FloatField()

    def save(self, *args, **kwargs):
        self.net_pl = self.pl - self.brokerage - self.charges
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.date} | {self.index} | Net P&L: {self.net_pl}"
