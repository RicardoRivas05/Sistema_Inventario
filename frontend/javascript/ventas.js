document.addEventListener("DOMContentLoaded", async () => {
  const tablaBody = document.querySelector("#tabla-ventas tbody");

  try {
    // ✅ Consulta al backend real
    const response = await fetch("http://[::1]:3001/ventas");
    if (!response.ok) throw new Error("Error al obtener los datos del servidor");

    const ventas = await response.json();

    tablaBody.innerHTML = "";

    if (ventas.length === 0) {
      tablaBody.innerHTML = `<tr><td colspan="7">No hay ventas registradas</td></tr>`;
      return;
    }

    ventas.forEach((venta) => {
      const fila = document.createElement("tr");
      const fecha = new Date(venta.fechaVenta).toLocaleDateString("es-ES");

      fila.innerHTML = `
        <td>${venta.idVenta}</td>
        <td>${fecha}</td>
        <td>L. ${venta.total.toFixed(2)}</td>
        <td>${venta.idCliente}</td>
        <td>${venta.idUsuario}</td>
        <td>${venta.estado == "1" ? "Completada" : "Pendiente"}</td>
        <td><button class="btn-detalle" onclick="verDetalle(${venta.idVenta})"><i class="fas fa-eye"></i> Ver</button></td>
      `;

      tablaBody.appendChild(fila);
    });
  } catch (error) {
    console.error("Error:", error);
    tablaBody.innerHTML = `<tr><td colspan="7" style="color:red;">Error al cargar ventas</td></tr>`;
  }
});

function verDetalle(idVenta) {
  // Redirige al módulo de facturación con el ID de la venta seleccionada
  window.location.href = `/Html/Facturacion.html?id=${idVenta}`;
}
