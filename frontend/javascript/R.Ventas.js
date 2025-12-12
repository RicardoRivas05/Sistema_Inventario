// ======================================
// REGISTRO DE VENTAS - R.Ventas.js
// Conectado a LoopBack (Productos, Ventas, DetalleVentas)
// ======================================

// RUTAS DEL BACKEND (ajusta si cambian)
const PRODUCTOS_PAGE_PATH   = "/productos/page";
const VENTAS_PATH           = "/ventas";
const DETALLE_VENTAS_PATH   = "/detalle-ventas";


// ESTADO EN MEMORIA


let productos = [];  // inventario
let ventas    = [];  // historial
let carrito   = [];  // venta actual


// REFERENCIAS AL DOM

// Formulario de venta
const productoSelect   = document.getElementById("productoSelect");
const precioProducto   = document.getElementById("precioProducto");
const stockDisponible  = document.getElementById("stockDisponible");
const cantidadInput    = document.getElementById("cantidadInput");

// Tablas
const tbodyCarrito     = document.getElementById("tbodyCarrito");
const tbodyProductos   = document.getElementById("tbodyProductos");
const tbodyHistorial   = document.getElementById("tbodyHistorial");

// Footer venta
const totalVentaSpan   = document.getElementById("totalVenta");
const ventaMessage     = document.getElementById("venta-message");

// Botones
const btnAgregar           = document.getElementById("btnAgregar");
const btnConfirmarVenta    = document.getElementById("btnConfirmarVenta");
const btnLimpiarCarrito    = document.getElementById("btnLimpiarCarrito");
const btnNuevaVenta        = document.getElementById("btn-nueva-venta");

// Buscador historial
const historialSearchInput = document.getElementById("historial-search");


// MENSAJES

function mostrarMensajeVenta(texto, tipo = "info") {
  if (!ventaMessage) return;
  ventaMessage.textContent = texto || "";

  if (tipo === "error") {
    ventaMessage.style.color = "#dc2626";   // rojo
  } else if (tipo === "ok") {
    ventaMessage.style.color = "#16a34a";   // verde
  } else {
    ventaMessage.style.color = "#f97316";   // naranja
  }
}

// CARGA DESDE EL BACKEND

async function cargarProductos() {
  try {
    // /productos/page?page=1&limit=100
    const resp = await api.get(`${PRODUCTOS_PAGE_PATH}?page=1&limit=100`);

    // Dependiendo de cómo responda tu API:
    //  - si devuelve array directo -> productos = resp
    //  - si devuelve {data:[...]}   -> productos = resp.data
    //  - si devuelve {items:[...]}  -> productos = resp.items
    if (Array.isArray(resp)) {
      productos = resp;
    } else if (resp && Array.isArray(resp.data)) {
      productos = resp.data;
    } else if (resp && Array.isArray(resp.items)) {
      productos = resp.items;
    } else {
      productos = [];
    }
  } catch (err) {
    console.error("Error cargando productos:", err);
    productos = [];
  }

  renderProductosSelect();
  renderTablaProductos();
}

async function cargarHistorialVentas() {
  try {
    // GET /ventas -> array de ventas
    ventas = await api.get(VENTAS_PATH);
  } catch (err) {
    console.error("Error cargando ventas:", err);
    ventas = [];
  }

  renderHistorialVentas();
}

// SELECT DE PRODUCTOS

function renderProductosSelect() {
  if (!productoSelect) return;

  productoSelect.innerHTML = "";

  if (!productos.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Sin productos en inventario";
    productoSelect.appendChild(option);

    productoSelect.disabled = true;
    btnAgregar.disabled = true;
    btnConfirmarVenta.disabled = true;

    precioProducto.value = "L 0.00";
    stockDisponible.value = "0";

    mostrarMensajeVenta(
      "No hay productos registrados. Crea productos primero en Inventario.",
      "info"
    );
    return;
  }

  productoSelect.disabled = false;
  btnAgregar.disabled = false;
  btnConfirmarVenta.disabled = false;

  productos.forEach((p) => {
    const option = document.createElement("option");
    // Ajusta según tu modelo: id / idProducto / codigoProducto...
    option.value = String(p.id ?? p.idProducto);
    option.textContent = p.nombre ?? p.descripcion ?? `Producto ${option.value}`;
    productoSelect.appendChild(option);
  });

  actualizarInfoProducto();
}

function actualizarInfoProducto() {
  if (!productoSelect || productoSelect.disabled) {
    precioProducto.value = "L 0.00";
    stockDisponible.value = "0";
    return;
  }

  const idSel = Number(productoSelect.value);
  const prod = productos.find(
    (p) => (p.id ?? p.idProducto) === idSel
  );

  if (prod) {
    // Ajusta a tus campos reales:
    const precio = Number(
      prod.precio ?? prod.precioVenta ?? prod.precioUnitario ?? 0
    );
    const stock = Number(
      prod.stock ?? prod.existencia ?? prod.cantidad ?? 0
    );

    precioProducto.value = `L ${precio.toFixed(2)}`;
    stockDisponible.value = String(stock);
  } else {
    precioProducto.value = "L 0.00";
    stockDisponible.value = "0";
  }
}

// CARRITO

function calcularTotalCarrito() {
  return carrito.reduce((t, item) => t + item.precio * item.cantidad, 0);
}

function renderCarrito() {
  if (!tbodyCarrito) return;
  tbodyCarrito.innerHTML = "";

  carrito.forEach((item) => {
    const tr = document.createElement("tr");

    const tdNombre = document.createElement("td");
    tdNombre.textContent = item.nombre;

    const tdCantidad = document.createElement("td");
    tdCantidad.textContent = String(item.cantidad);

    const tdPrecio = document.createElement("td");
    tdPrecio.textContent = `L ${item.precio.toFixed(2)}`;

    const tdSubtotal = document.createElement("td");
    tdSubtotal.textContent = `L ${(item.precio * item.cantidad).toFixed(2)}`;

    const tdAccion = document.createElement("td");
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.classList.add("btn", "btn-secondary", "btn-sm", "btn-row");
    btnEliminar.addEventListener("click", () => eliminarDelCarrito(item.idProd));
    tdAccion.appendChild(btnEliminar);

    tr.appendChild(tdNombre);
    tr.appendChild(tdCantidad);
    tr.appendChild(tdPrecio);
    tr.appendChild(tdSubtotal);
    tr.appendChild(tdAccion);

    tbodyCarrito.appendChild(tr);
  });

  const total = calcularTotalCarrito();
  totalVentaSpan.textContent = `L ${total.toFixed(2)}`;
}

function agregarAlCarrito() {
  mostrarMensajeVenta("");

  if (!productoSelect || productoSelect.disabled) {
    mostrarMensajeVenta("No hay productos para vender.", "error");
    return;
  }

  const idSel = Number(productoSelect.value);
  const prod = productos.find(
    (p) => (p.id ?? p.idProducto) === idSel
  );
  const cantidad = Number(cantidadInput.value);

  if (!prod) {
    mostrarMensajeVenta("Selecciona un producto válido.", "error");
    return;
  }
  if (!cantidad || cantidad <= 0) {
    mostrarMensajeVenta("Ingresa una cantidad válida.", "error");
    return;
  }

  const stock = Number(
    prod.stock ?? prod.existencia ?? prod.cantidad ?? 0
  );
  const precio = Number(
    prod.precio ?? prod.precioVenta ?? prod.precioUnitario ?? 0
  );

  if (cantidad > stock) {
    mostrarMensajeVenta("La cantidad supera el stock disponible.", "error");
    return;
  }

  const idProd = prod.id ?? prod.idProducto;

  const itemExistente = carrito.find((i) => i.idProd === idProd);
  if (itemExistente) {
    if (itemExistente.cantidad + cantidad > stock) {
      mostrarMensajeVenta("La cantidad total excede el stock.", "error");
      return;
    }
    itemExistente.cantidad += cantidad;
  } else {
    carrito.push({
      idProd,
      nombre: prod.nombre ?? prod.descripcion ?? `Producto ${idProd}`,
      precio,
      cantidad,
    });
  }

  renderCarrito();
  mostrarMensajeVenta("Producto agregado al carrito.", "ok");
}

function eliminarDelCarrito(idProd) {
  carrito = carrito.filter((i) => i.idProd !== idProd);
  renderCarrito();
}

function limpiarCarrito() {
  carrito = [];
  renderCarrito();
  mostrarMensajeVenta("Carrito limpiado.", "info");
}

function nuevaVenta() {
  carrito = [];
  renderCarrito();
  mostrarMensajeVenta("Nueva venta iniciada.", "info");
}

// TABLA DE INVENTARIO

function renderTablaProductos() {
  if (!tbodyProductos) return;
  tbodyProductos.innerHTML = "";

  if (!productos.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 3;
    td.textContent = "Sin productos en inventario.";
    td.style.fontSize = "12px";
    td.style.color = "#6b7280";
    tr.appendChild(td);
    tbodyProductos.appendChild(tr);
    return;
  }

  productos.forEach((prod) => {
    const tr = document.createElement("tr");

    const precio = Number(
      prod.precio ?? prod.precioVenta ?? prod.precioUnitario ?? 0
    );
    const stock = Number(
      prod.stock ?? prod.existencia ?? prod.cantidad ?? 0
    );

    const tdNombre = document.createElement("td");
    tdNombre.textContent = prod.nombre ?? prod.descripcion ?? "Producto";

    const tdPrecio = document.createElement("td");
    tdPrecio.textContent = `L ${precio.toFixed(2)}`;

    const tdStock = document.createElement("td");
    tdStock.textContent = String(stock);

    tr.appendChild(tdNombre);
    tr.appendChild(tdPrecio);
    tr.appendChild(tdStock);
    tbodyProductos.appendChild(tr);
  });
}

// HISTORIAL DE VENTAS

function renderHistorialVentas(lista = null) {
  if (!tbodyHistorial) return;

  const origen = Array.isArray(lista) ? lista : ventas;
  tbodyHistorial.innerHTML = "";

  if (!origen.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 4;
    td.textContent = "Aún no hay ventas registradas.";
    td.style.fontSize = "12px";
    td.style.color = "#6b7280";
    tr.appendChild(td);
    tbodyHistorial.appendChild(tr);
    return;
  }

  origen.forEach((venta) => {
    const tr = document.createElement("tr");

    const tdId = document.createElement("td");
    // En tu modelo el id es idVenta
    tdId.textContent = String(venta.idVenta ?? venta.id);

    const tdFecha = document.createElement("td");
    tdFecha.textContent = String(venta.fechaVenta ?? venta.createdAt ?? "");

    const tdDetalle = document.createElement("td");
    tdDetalle.textContent = venta.estado ?? "COMPLETADA";

    const tdTotal = document.createElement("td");
    const total = Number(venta.total ?? 0);
    tdTotal.textContent = `L ${total.toFixed(2)}`;

    tr.appendChild(tdId);
    tr.appendChild(tdFecha);
    tr.appendChild(tdDetalle);
    tr.appendChild(tdTotal);
    tbodyHistorial.appendChild(tr);
  });
}

function filtrarHistorial() {
  const q = (historialSearchInput?.value || "").trim().toLowerCase();
  if (!q) {
    renderHistorialVentas();
    return;
  }

  const filtradas = ventas.filter((v) => {
    const idStr = String(v.idVenta ?? v.id).toLowerCase();
    const fechaStr = String(
      v.fechaVenta ?? v.createdAt ?? ""
    ).toLowerCase();
    return idStr.includes(q) || fechaStr.includes(q);
  });

  renderHistorialVentas(filtradas);
}

// CONFIRMAR VENTA (POST /ventas + /detalle-ventas)

async function confirmarVenta() {
  mostrarMensajeVenta("");

  if (!carrito.length) {
    mostrarMensajeVenta("No hay productos en el carrito.", "error");
    return;
  }

  // Verificar stock actual
  for (const item of carrito) {
    const prod = productos.find(
      (p) => (p.id ?? p.idProducto) === item.idProd
    );
    const stock = Number(
      prod?.stock ?? prod?.existencia ?? prod?.cantidad ?? 0
    );
    if (!prod || item.cantidad > stock) {
      mostrarMensajeVenta(`Stock insuficiente para: ${item.nombre}`, "error");
      return;
    }
  }

  const total = calcularTotalCarrito();

  // Payload de venta según tu esquema de Swagger
  const ventaPayload = {
    fechaVenta: new Date().toISOString(),
    total: total,
    idCliente: 1,          // Cambia esto cuando tengas cliente real
    idUsuario: 1,          // Id del usuario logueado
    estado: "COMPLETADA",
  };

  try {
    // 1. Crear la venta principal
    const nuevaVenta = await api.post(VENTAS_PATH, ventaPayload);

    // 2. Crear los detalles de la venta
    for (const item of carrito) {
      //  Ajusta estos nombres a lo que te muestre Swagger
      const detallePayload = {
        idVenta: nuevaVenta.idVenta,        // o ventaId
        idProducto: item.idProd,            // o productoId
        cantidad: item.cantidad,
        precioUnitario: item.precio,
        subtotal: item.precio * item.cantidad,
      };
      await api.post(DETALLE_VENTAS_PATH, detallePayload);
    }

    carrito = [];
    renderCarrito();
    await cargarProductos();
    await cargarHistorialVentas();

    mostrarMensajeVenta("Venta registrada correctamente.", "ok");
  } catch (err) {
    console.error("Error al registrar la venta:", err);
    mostrarMensajeVenta("Error al registrar la venta.", "error");
  }
}

// EVENTOS

if (productoSelect) {
  productoSelect.addEventListener("change", actualizarInfoProducto);
}
if (btnAgregar)        btnAgregar.addEventListener("click", agregarAlCarrito);
if (btnConfirmarVenta) btnConfirmarVenta.addEventListener("click", confirmarVenta);
if (btnLimpiarCarrito) btnLimpiarCarrito.addEventListener("click", limpiarCarrito);
if (btnNuevaVenta)     btnNuevaVenta.addEventListener("click", nuevaVenta);
if (historialSearchInput) {
  historialSearchInput.addEventListener("input", filtrarHistorial);
}

// INICIALIZACIÓN

(async function init() {
  await cargarProductos();
  await cargarHistorialVentas();
  renderCarrito();
})();
