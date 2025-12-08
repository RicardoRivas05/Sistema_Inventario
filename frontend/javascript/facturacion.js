document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const idVenta = params.get("id");
  const contenedor = document.getElementById("factura-detalle");

  if (!idVenta) {
    contenedor.innerHTML = "<p style='color:red;'>Error: ID de venta no especificado.</p>";
    return;
  }

  try {
    // ✅ Llamada real al backend con el ID de la venta
    const response = await fetch(`http://[::1]:3001/ventas/${idVenta}`);
    if (!response.ok) throw new Error("Error al obtener los datos de la venta.");

    const detalle = await response.json();
    contenedor.innerHTML = "";

    if (!detalle) {
      contenedor.innerHTML = `<p>No se encontraron detalles para esta venta.</p>`;
      return;
    }

    // Ejemplo de estructura esperada desde tu backend:
    // {
    //   "idVenta": 1,
    //   "fechaVenta": "2025-10-11T00:00:00.000Z",
    //   "total": 2000,
    //   "idCliente": 1,
    //   "idUsuario": 1,
    //   "estado": "1",
    //   "detalles": [
    //     { "producto": "iPhone 13", "cantidad": 1, "precioUnitario": 2000 }
    //   ]
    // }

    const fecha = new Date(detalle.fechaVenta).toLocaleDateString("es-ES");

    const html = `
      <div class="factura-info">
        <p><strong>ID Venta:</strong> ${detalle.idVenta}</p>
        <p><strong>ID Cliente:</strong> ${detalle.idCliente}</p>
        <p><strong>ID Usuario:</strong> ${detalle.idUsuario}</p>
        <p><strong>Fecha:</strong> ${fecha}</p>
        <p><strong>Estado:</strong> ${detalle.estado == "1" ? "Completada" : "Pendiente"}</p>
      </div>

      <table class="factura-tabla">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unitario (L.)</th>
            <th>Subtotal (L.)</th>
          </tr>
        </thead>
        <tbody>
          ${
            detalle.detalles && detalle.detalles.length > 0
              ? detalle.detalles
                  .map(
                    (p) => `
                    <tr>
                      <td>${p.producto}</td>
                      <td>${p.cantidad}</td>
                      <td>L. ${p.precioUnitario.toFixed(2)}</td>
                      <td>L. ${(p.cantidad * p.precioUnitario).toFixed(2)}</td>
                    </tr>`
                  )
                  .join("")
              : `<tr><td colspan="4">No hay productos en esta venta</td></tr>`
          }
        </tbody>
      </table>

      <div class="factura-total">
        Total a Pagar: L. ${detalle.total.toFixed(2)}
      </div>
    `;

    contenedor.innerHTML = html;
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = `<p style="color:red;">Error al cargar los detalles de la factura.</p>`;
  }
});

// Botón de impresión
document.addEventListener("click", (e) => {
  if (e.target.id === "btn-imprimir") {
    window.print();
  }
});
