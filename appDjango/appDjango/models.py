from django.db import models

class Producto(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=25)
    descripcion = models.TextField()
    precio = models.IntegerField()
    color = models.CharField(max_length=100)
    cantidad = models.IntegerField()
    imagen = models.ImageField(upload_to='productos/')

    def __str__(self):
        return self.nombre
