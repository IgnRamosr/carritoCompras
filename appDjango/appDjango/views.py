from django.shortcuts import get_object_or_404, render
from .models import Producto
from django.http import JsonResponse

def home_page(request):
    productos = Producto.objects.all()
    return render(request, 'index.html' , {'productos': productos})

def detalle_producto(request, producto_id):
    try:
        producto = get_object_or_404(Producto, id=producto_id)
        data = {
            'id': producto.id,
            'nombre': producto.nombre,
            'precio': producto.precio,
            'descripcion': producto.descripcion,
            'imagen': producto.imagen.url,
            'cantidad': producto.cantidad,
        }
        return JsonResponse(data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)