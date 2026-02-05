from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import mercadopago

@api_view(["POST"])
def crear_preferencia(request):
    # Reemplaza con tu Access Token real
    sdk = mercadopago.SDK("APP_USR-5006527019840999-020415-bd90aef781be9ac6dbb5908fdf64bbf6-3182278274")

    # Obtener los productos enviados desde el frontend
    productos_carrito = request.data.get("productos", [])

    if not productos_carrito:
        return Response(
            {"error": "No hay productos en el carrito"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # Armar la lista de items para Mercado Pago dinámicamente
    items_mp = []
    for p in productos_carrito:
        items_mp.append({
            "title": p.get("nombre", "Producto"),
            "quantity": int(p.get("cantidad", 1)),
            "unit_price": float(p.get("precioUnitario", 0)),
            "currency_id": "ARS"  # Ajusta según tu país
        })

    # Asegúrate de que las URLs terminen sin barra diagonal si tu router de React es sensible,
    # o simplemente que sean strings válidos.
    preference_data = {
        "items": items_mp,
        "back_urls": {
            "success": "http://localhost:5173/home",
            "failure": "http://localhost:5173/home",
            "pending": "http://localhost:5173/home"
        },
        "binary_mode": True  # Recomendado: evita estados de "pago pendiente" intermedios
    }

    try:
        # Intenta la creación con la data estructurada
        result = sdk.preference().create(preference_data)
        
        # Mercado Pago devuelve el resultado en 'response'
        if result["status"] >= 400:
            print(f"DEBUG MP: {result['response']}")
            return Response(result["response"], status=result["status"])

        preference = result["response"]
        return Response({
            "preference_id": preference["id"],
            "init_point": preference["init_point"]
        })
    except Exception as e:
        print(f"Excepción: {str(e)}")
        return Response({"error": str(e)}, status=500)