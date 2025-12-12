document.addEventListener("DOMContentLoaded", async () => {
  // === CONFIGURACIÓN ===
  const API_BASE_URL = "http://[::1]:3001";
  const ITEMS_PER_PAGE = 10;
  
  // === VARIABLES GLOBALES ===
  let ventas = [];
  let filteredVentas = [];
  let currentPage = 1;
  let totalPages = 1;
  let currentFilters = {
    date: "",
    status: "",
    search: ""
  };

  // === ELEMENTOS DOM ===
  const tablaBody = document.querySelector("#tabla-ventas tbody");
  const searchInput = document.getElementById("searchInput");
  const filterDate = document.getElementById("filterDate");
  const filterStatus = document.getElementById("filterStatus");
  const btnExport = document.getElementById("btnExport");
  const btnRefresh = document.getElementById("btnRefresh");
  const btnPrint = document.getElementById("btnPrint");
  const btnPrevPage = document.getElementById("prevPage");
  const btnNextPage = document.getElementById("nextPage");
  const pageInfo = document.getElementById("pageInfo");
  const tableCount = document.getElementById("tableCount");
  
  // Estadísticas
  const totalVentasEl = document.getElementById("totalVentas");
  const totalMontoEl = document.getElementById("totalMonto");
  const promedioVentaEl = document.getElementById("promedioVenta");
  const ventasPendientesEl = document.getElementById("ventasPendientes");
  const lastUpdateEl = document.getElementById("lastUpdate");
  
  // Modal
  const detailModal = document.getElementById("detailModal");
  const modalClose = document.getElementById("modalClose");
  const modalCancel = document.getElementById("modalCancel");
  const modalPrint = document.getElementById("modalPrint");
  const modalVentaId = document.getElementById("modalVentaId");
  const modalLoading = document.getElementById("modalLoading");
  const modalContent = document.getElementById("modalContent");

  // === FUNCIONES PRINCIPALES ===
  
  async function cargarVentas() {
    try {
      mostrarLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/ventas`);
      if (!response.ok) throw new Error("Error al obtener los datos del servidor");

      const data = await response.json();
      
      // Transformar datos según estructura de la API
      ventas = data.map(venta => ({
        idVenta: venta.idVenta || venta.id || 0,
        fecha: venta.fechaVenta || venta.fecha || new Date().toISOString(),
        total: parseFloat(venta.total) || 0,
        idCliente: venta.idCliente || "N/A",
        nombreCliente: venta.nombreCliente || venta.cliente || "Cliente general",
        idUsuario: venta.idUsuario || 1,
        nombreUsuario: venta.nombreUsuario || "Sistema",
        estado: venta.estado || "1",
        productos: venta.productos || venta.detalle || [],
        metodoPago: venta.metodoPago || "Efectivo",
        observaciones: venta.observaciones || "",
        originalData: venta
      }));
      
      console.log(`✅ ${ventas.length} ventas cargadas`);
      
      // Aplicar filtros iniciales
      aplicarFiltros();
      actualizarEstadisticas();
      actualizarFecha();
      
    } catch (error) {
      console.error("Error:", error);
      mostrarError("Error al cargar ventas desde el servidor");
    } finally {
      mostrarLoading(false);
    }
  }

  function aplicarFiltros() {
    filteredVentas = [...ventas];
    
    // Filtrar por fecha
    if (currentFilters.date) {
      const filterDateObj = new Date(currentFilters.date);
      filteredVentas = filteredVentas.filter(v => {
        const ventaDate = new Date(v.fecha);
        return ventaDate.toDateString() === filterDateObj.toDateString();
      });
    }
    
    // Filtrar por estado
    if (currentFilters.status) {
      if (currentFilters.status === "canceladas") {
        filteredVentas = filteredVentas.filter(v => v.estado === "cancelado" || v.estado === "0");
      } else {
        filteredVentas = filteredVentas.filter(v => v.estado === currentFilters.status);
      }
    }
    
    // Filtrar por búsqueda
    if (currentFilters.search) {
      const searchTerm = currentFilters.search.toLowerCase();
      filteredVentas = filteredVentas.filter(v => 
        v.idVenta.toString().includes(searchTerm) ||
        (v.nombreCliente && v.nombreCliente.toLowerCase().includes(searchTerm)) ||
        (v.idCliente && v.idCliente.toString().includes(searchTerm))
      );
    }
    
    // Calcular paginación
    totalPages = Math.ceil(filteredVentas.length / ITEMS_PER_PAGE);
    currentPage = 1;
    
    // Renderizar tabla
    renderizarTabla();
    actualizarPaginacion();
  }

  function renderizarTabla() {
    if (!tablaBody) return;
    
    // Calcular índice de inicio y fin
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const ventasPagina = filteredVentas.slice(startIndex, endIndex);
    
    // Actualizar contador
    if (tableCount) {
      tableCount.textContent = `Mostrando ${ventasPagina.length} de ${filteredVentas.length} ventas`;
    }
    
    if (ventasPagina.length === 0) {
      tablaBody.innerHTML = `
        <tr>
          <td colspan="8" class="loading" style="color: #666; font-style: italic;">
            <i class="fas fa-search"></i> No se encontraron ventas con los filtros aplicados
          </td>
        </tr>
      `;
      return;
    }
    
    tablaBody.innerHTML = "";
    
    ventasPagina.forEach((venta) => {
      const fila = document.createElement("tr");
      const fecha = new Date(venta.fecha).toLocaleDateString("es-ES", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Determinar estado
      let estadoClass = "status-completed";
      let estadoText = "Completada";
      
      if (venta.estado === "0") {
        estadoClass = "status-pending";
        estadoText = "Pendiente";
      } else if (venta.estado === "cancelado") {
        estadoClass = "status-canceled";
        estadoText = "Cancelada";
      }
      
      // Contar productos
      const numProductos = venta.productos ? venta.productos.length : 0;
      const productosText = numProductos > 0 ? `${numProductos} producto${numProductos !== 1 ? 's' : ''}` : "Sin productos";
      
      fila.innerHTML = `
        <td><strong>#${venta.idVenta.toString().padStart(6, '0')}</strong></td>
        <td>${fecha}</td>
        <td>${venta.nombreCliente}</td>
        <td>${productosText}</td>
        <td><strong>L. ${venta.total.toFixed(2)}</strong></td>
        <td>${venta.nombreUsuario}</td>
        <td><span class="status-badge ${estadoClass}">${estadoText}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-action btn-view" onclick="verDetalleVenta(${venta.idVenta})" title="Ver detalles">
              <i class="fas fa-eye"></i> Ver
            </button>
            <button class="btn-action btn-print-small" onclick="imprimirVenta(${venta.idVenta})" title="Imprimir recibo">
              <i class="fas fa-print"></i>
            </button>
            ${venta.estado === "1" ? `
            <button class="btn-action btn-cancel" onclick="cancelarVenta(${venta.idVenta})" title="Cancelar venta">
              <i class="fas fa-ban"></i>
            </button>
            ` : ''}
          </div>
        </td>
      `;
      
      tablaBody.appendChild(fila);
    });
  }

  function actualizarPaginacion() {
    if (pageInfo) {
      pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    }
    
    if (btnPrevPage) {
      btnPrevPage.disabled = currentPage === 1;
    }
    
    if (btnNextPage) {
      btnNextPage.disabled = currentPage === totalPages || totalPages === 0;
    }
  }

  function cambiarPagina(direccion) {
    if (direccion === 'next' && currentPage < totalPages) {
      currentPage++;
    } else if (direccion === 'prev' && currentPage > 1) {
      currentPage--;
    }
    
    renderizarTabla();
    actualizarPaginacion();
  }

  function actualizarEstadisticas() {
    if (ventas.length === 0) {
      totalVentasEl.textContent = "0";
      totalMontoEl.textContent = "L. 0.00";
      promedioVentaEl.textContent = "L. 0.00";
      ventasPendientesEl.textContent = "0";
      return;
    }
    
    const totalVentas = ventas.length;
    const ventasCompletadas = ventas.filter(v => v.estado === "1").length;
    const ventasPendientes = ventas.filter(v => v.estado === "0").length;
    const montoTotal = ventas.reduce((sum, v) => sum + v.total, 0);
    const promedio = montoTotal / ventasCompletadas;
    
    totalVentasEl.textContent = totalVentas;
    totalMontoEl.textContent = `L. ${montoTotal.toFixed(2)}`;
    promedioVentaEl.textContent = `L. ${promedio.toFixed(2)}`;
    ventasPendientesEl.textContent = ventasPendientes;
  }

  function actualizarFecha() {
    if (lastUpdateEl) {
      const now = new Date();
      const options = { 
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      };
      lastUpdateEl.textContent = `Última actualización: ${now.toLocaleString('es-ES', options)}`;
    }
  }

  // === FUNCIONES DEL MODAL ===
  
  async function verDetalleVenta(idVenta) {
    try {
      // Mostrar modal y cargar datos
      detailModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      
      modalVentaId.textContent = `#${idVenta.toString().padStart(6, '0')}`;
      modalLoading.style.display = 'flex';
      modalContent.style.display = 'none';
      
      // Buscar la venta en los datos ya cargados
      const venta = ventas.find(v => v.idVenta === idVenta);
      
      if (!venta) {
        throw new Error("Venta no encontrada");
      }
      
      // Formatear fecha
      const fecha = new Date(venta.fecha).toLocaleDateString("es-ES", {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Determinar estado
      let estadoClass = "status-completed";
      let estadoText = "Completada";
      
      if (venta.estado === "0") {
        estadoClass = "status-pending";
        estadoText = "Pendiente";
      } else if (venta.estado === "cancelado") {
        estadoClass = "status-canceled";
        estadoText = "Cancelada";
      }
      
      // Crear tabla de productos
      let productosHTML = '';
      if (venta.productos && venta.productos.length > 0) {
        productosHTML = `
          <div class="productos-lista">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${venta.productos.map(p => `
                  <tr>
                    <td>${p.nombre || p.producto || 'Producto'}</td>
                    <td>${p.cantidad || 1}</td>
                    <td>L. ${(p.precio || 0).toFixed(2)}</td>
                    <td>L. ${((p.precio || 0) * (p.cantidad || 1)).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      } else {
        productosHTML = '<p style="color: #666; font-style: italic;">No hay detalles de productos disponibles</p>';
      }
      
      // Actualizar contenido del modal
      modalContent.innerHTML = `
        <div class="venta-detalle">
          <div class="detalle-header">
            <div class="detalle-info">
              <h4>Fecha y Hora</h4>
              <p>${fecha}</p>
            </div>
            <div class="detalle-info">
              <h4>Cliente</h4>
              <p>${venta.nombreCliente}</p>
            </div>
            <div class="detalle-info">
              <h4>Usuario</h4>
              <p>${venta.nombreUsuario}</p>
            </div>
            <div class="detalle-info">
              <h4>Método de Pago</h4>
              <p>${venta.metodoPago}</p>
            </div>
            <div class="detalle-info">
              <h4>Estado</h4>
              <p><span class="status-badge ${estadoClass}">${estadoText}</span></p>
            </div>
          </div>
          
          <h3 style="margin-bottom: 15px; color: #374151;">
            <i class="fas fa-box"></i> Productos Vendidos
          </h3>
          ${productosHTML}
          
          ${venta.observaciones ? `
          <div class="detalle-info">
            <h4>Observaciones</h4>
            <p style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #3598db;">
              ${venta.observaciones}
            </p>
          </div>
          ` : ''}
          
          <div class="detalle-total">
            <div class="total-label">TOTAL DE LA VENTA</div>
            <div class="total-valor">L. ${venta.total.toFixed(2)}</div>
          </div>
        </div>
      `;
      
      // Ocultar loading y mostrar contenido
      modalLoading.style.display = 'none';
      modalContent.style.display = 'block';
      
    } catch (error) {
      console.error("Error cargando detalles:", error);
      modalContent.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #e74c3c;">
          <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px;"></i>
          <h3>Error al cargar detalles</h3>
          <p>${error.message}</p>
        </div>
      `;
      modalLoading.style.display = 'none';
      modalContent.style.display = 'block';
    }
  }

  function cerrarModal() {
    detailModal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }

  async function imprimirVenta(idVenta) {
    try {
      // Aquí puedes implementar la lógica para imprimir el recibo
      // Por ahora, solo mostramos una alerta
      const venta = ventas.find(v => v.idVenta === idVenta);
      if (venta) {
        mostrarNotificacion(`Imprimiendo recibo de venta #${idVenta}...`, 'info');
        
        // Simular impresión
        setTimeout(() => {
          window.print();
        }, 500);
      }
    } catch (error) {
      console.error("Error imprimiendo venta:", error);
      mostrarNotificacion("Error al imprimir recibo", "error");
    }
  }

  async function cancelarVenta(idVenta) {
    if (!confirm(`¿Estás seguro de cancelar la venta #${idVenta}? Esta acción no se puede deshacer.`)) {
      return;
    }
    
    try {
      mostrarNotificacion(`Cancelando venta #${idVenta}...`, 'info');
      
      // Aquí iría la llamada a la API para cancelar la venta
      // const response = await fetch(`${API_BASE_URL}/ventas/${idVenta}/cancelar`, { method: 'PUT' });
      
      // Simulación de cancelación exitosa
      setTimeout(() => {
        mostrarNotificacion(`Venta #${idVenta} cancelada correctamente`, 'success');
        cargarVentas(); // Recargar datos
      }, 1000);
      
    } catch (error) {
      console.error("Error cancelando venta:", error);
      mostrarNotificacion("Error al cancelar venta", "error");
    }
  }

  // === FUNCIONES AUXILIARES ===
  
  function mostrarLoading(mostrar) {
    if (mostrar && tablaBody) {
      tablaBody.innerHTML = `
        <tr>
          <td colspan="8" class="loading">
            <i class="fas fa-spinner fa-spin"></i> Cargando ventas...
          </td>
        </tr>
      `;
    }
  }

  function mostrarError(mensaje) {
    if (tablaBody) {
      tablaBody.innerHTML = `
        <tr>
          <td colspan="8" style="color: #e74c3c; text-align: center; padding: 40px;">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 15px; display: block;"></i>
            <h3>Error al cargar ventas</h3>
            <p>${mensaje}</p>
            <button onclick="cargarVentas()" style="margin-top: 15px; padding: 8px 20px; background: #3598db; color: white; border: none; border-radius: 4px; cursor: pointer;">
              <i class="fas fa-sync-alt"></i> Reintentar
            </button>
          </td>
        </tr>
      `;
    }
  }

  function mostrarNotificacion(mensaje, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `
      <i class="fas ${tipo === 'success' ? 'fa-check-circle' : tipo === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
      <span>${mensaje}</span>
    `;
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background: ${tipo === 'success' ? '#27ae60' : tipo === 'error' ? '#e74c3c' : '#3598db'};
      color: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    // Agregar estilos CSS para la animación
    if (!document.querySelector('#toast-estilos')) {
      const style = document.createElement('style');
      style.id = 'toast-estilos';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // Auto-eliminar después de 3 segundos
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  function exportarVentas() {
    if (filteredVentas.length === 0) {
      mostrarNotificacion('No hay datos para exportar', 'warning');
      return;
    }
    
    try {
      // Crear contenido CSV
      let csvContent = "ID Venta,Fecha,Cliente,Productos,Total,Usuario,Estado,Método Pago\n";
      
      filteredVentas.forEach(v => {
        const fecha = new Date(v.fecha).toLocaleDateString("es-ES");
        const estado = v.estado === "1" ? "Completada" : v.estado === "0" ? "Pendiente" : "Cancelada";
        const numProductos = v.productos ? v.productos.length : 0;
        
        csvContent += `${v.idVenta},"${fecha}","${v.nombreCliente}",${numProductos},${v.total},"${v.nombreUsuario}","${estado}","${v.metodoPago}"\n`;
      });
      
      // Crear y descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `ventas_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      mostrarNotificacion('Datos exportados como CSV', 'success');
      
    } catch (error) {
      console.error('Error exportando ventas:', error);
      mostrarNotificacion('Error al exportar datos', 'error');
    }
  }

  // === EVENT LISTENERS ===
  
  // Filtros
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentFilters.search = e.target.value;
      aplicarFiltros();
    });
  }
  
  if (filterDate) {
    filterDate.addEventListener('change', (e) => {
      currentFilters.date = e.target.value;
      aplicarFiltros();
    });
  }
  
  if (filterStatus) {
    filterStatus.addEventListener('change', (e) => {
      currentFilters.status = e.target.value;
      aplicarFiltros();
    });
  }
  
  // Botones
  if (btnExport) {
    btnExport.addEventListener('click', exportarVentas);
  }
  
  if (btnRefresh) {
    btnRefresh.addEventListener('click', cargarVentas);
  }
  
  if (btnPrint) {
    btnPrint.addEventListener('click', () => window.print());
  }
  
  // Paginación
  if (btnPrevPage) {
    btnPrevPage.addEventListener('click', () => cambiarPagina('prev'));
  }
  
  if (btnNextPage) {
    btnNextPage.addEventListener('click', () => cambiarPagina('next'));
  }
  
  // Modal
  if (modalClose) {
    modalClose.addEventListener('click', cerrarModal);
  }
  
  if (modalCancel) {
    modalCancel.addEventListener('click', cerrarModal);
  }
  
  if (modalPrint) {
    modalPrint.addEventListener('click', () => {
      // Aquí iría la lógica para imprimir el recibo del modal
      mostrarNotificacion('Imprimiendo recibo...', 'info');
      window.print();
    });
  }
  
  // Cerrar modal al hacer clic fuera
  if (detailModal) {
    detailModal.addEventListener('click', (e) => {
      if (e.target === detailModal) {
        cerrarModal();
      }
    });
  }

  // === INICIALIZACIÓN ===
  
  // Hacer funciones globales
  window.verDetalleVenta = verDetalleVenta;
  window.imprimirVenta = imprimirVenta;
  window.cancelarVenta = cancelarVenta;
  window.cargarVentas = cargarVentas;
  
  // Cargar datos iniciales
  await cargarVentas();
  
  // Configurar actualización automática cada 60 segundos
  setInterval(async () => {
    console.log('🔄 Actualizando ventas automáticamente...');
    await cargarVentas();
  }, 60000);
  
  console.log('✅ Sistema de ventas inicializado');
});