from django.db import connections

def check_database_connection():
    try:
        connections['default'].ensure_connection()
        print("Conexión exitosa a la base de datos.")
    except Exception as e:
        print(f"Error de conexión a la base de datos: {e}")
