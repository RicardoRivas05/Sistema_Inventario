// ======================================
// CONFIGURACIÓN LOCALSTORAGE
// ======================================

// 👇 Usa aquí la MISMA clave que use tu módulo de Inventario
const LS_PRODUCTOS = "megacels_productos"; // cámbiala si tu inventario usa otra

// Clave para el historial de ventas
const LS_VENTAS = "megacels_ventas";

// ======================================
// ESTADO EN MEMORIA
// ======================================

let productos = [];  // inventario
let ventas = [];     // historial de ventas
let carrito = [];    // detalle de la venta actual

// ======================================
// REFERENCIAS AL DOM
// ======================================

// Formulario de venta
const productoSelect = document.getElementById("productoSelect");
const precioProducto = document.getElementById("precioProducto");
const stockDisponible = document.getElementById("stockDisponible");
const cantidadInput = document.getElementById("cantidadInput");

// Tablas
const tbodyCarrito = document.getElementById("tbodyCarrito");
const tbodyProductos = document.getElementById("tbodyProductos");
const tbodyHistorial = document.getElementById("tbodyHistorial");

// Footer de venta
const totalVentaSpan = document.getElementById("totalVenta");
const ventaMessage = document.getElementById("venta-message");

// Botones
const btnAgregar = document.getElementById("btnAgregar");
const btnConfirmarVenta = document.getElementById("btnConfirmarVenta");
const btnLimpiarCarrito = document.getElementById("btnLimpiarCarrito");
const btnNuevaVenta = document.getElementById("btn-nueva-venta");

// Buscador de historial
const historialSearchInput = document.getElementById("historial-search");

// ======================================
// UTILIDADES
// ======================================

function mostrarMensajeVenta(texto, tipo = "info") {
    if (!ventaMessage) return;
    ventaMessage.textContent = texto || "";

    if (tipo === "error") {
        ventaMessage.style.color = "#dc2626"; // rojo
    } else if (tipo === "ok") {
        ventaMessage.style.color = "#16a34a"; // verde
    } else {
        ventaMessage.style.color = "#f97316"; // naranja
    }
}

function guardarProductos() {
    localStorage.setItem(LS_PRODUCTOS, JSON.stringify(productos));
}

function guardarVentas() {
    localStorage.setItem(LS_VENTAS, JSON.stringify(ventas));
}

// ======================================
// CARGA INICIAL DE DATOS
// ======================================

function inicializarDatos() {
    // 👉 Solo lee productos, NO crea ninguno
    const productosLS = localStorage.getItem(LS_PRODUCTOS);
    if (productosLS) {
        productos = JSON.parse(productosLS);
    } else {
        productos = []; // sin productos hasta que inventario los cree
    }

    const ventasLS = localStorage.getItem(LS_VENTAS);
    if (ventasLS) {
        ventas = JSON.parse(ventasLS);
    } else {
        ventas = [];
        guardarVentas();
    }
}

// ======================================
// RENDER: SELECT DE PRODUCTOS
// ======================================

function renderProductosSelect() {
    if (!productoSelect) return;

    productoSelect.innerHTML = "";

    // ⚠ Si no hay productos, desactivamos el formulario
    if (productos.length === 0) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Sin productos en inventario";
        productoSelect.appendChild(option);

        productoSelect.disabled = true;
        if (btnAgregar) btnAgregar.disabled = true;
        if (btnConfirmarVenta) btnConfirmarVenta.disabled = true;

        if (precioProducto) precioProducto.value = "L 0.00";
        if (stockDisponible) stockDisponible.value = "0";

        mostrarMensajeVenta("No hay productos cargados. Regístralos primero en Inventario.", "info");
        return;
    }

    // Si hay productos, habilitamos todo
    productoSelect.disabled = false;
    if (btnAgregar) btnAgregar.disabled = false;
    if (btnConfirmarVenta) btnConfirmarVenta.disabled = false;

    productos.forEach(prod => {
        const option = document.createElement("option");
        option.value = String(prod.id);
        option.textContent = prod.nombre;
        productoSelect.appendChild(option);
    });

    actualizarInfoProducto();
}

function actualizarInfoProducto() {
    if (!productoSelect || productoSelect.disabled) {
        if (precioProducto) precioProducto.value = "L 0.00";
        if (stockDisponible) stockDisponible.value = "0";
        return;
    }

    const id = parseInt(productoSelect.value, 10);
    const prod = productos.find(p => p.id === id);

    if (prod) {
        if (precioProducto) precioProducto.value = `L ${prod.precio.toFixed(2)}`;
        if (stockDisponible) stockDisponible.value = String(prod.stock);
    } else {
        if (precioProducto) precioProducto.value = "L 0.00";
        if (stockDisponible) stockDisponible.value = "0";
    }
}

// ======================================
// CARRITO: AGREGAR / ELIMINAR / RENDER
// ======================================

function agregarAlCarrito() {
    mostrarMensajeVenta("");

    if (!productoSelect || productoSelect.disabled) {
        mostrarMensajeVenta("No hay productos en inventario para vender.", "error");
        return;
    }

    const id = parseInt(productoSelect.value, 10);
    const prod = productos.find(p => p.id === id);
    const cantidad = parseInt(cantidadInput.value, 10);

    if (!prod) {
        mostrarMensajeVenta("Selecciona un producto válido.", "error");
        return;
    }

    if (isNaN(cantidad) || cantidad <= 0) {
        mostrarMensajeVenta("Ingresa una cantidad válida.", "error");
        return;
    }

    if (cantidad > prod.stock) {
        mostrarMensajeVenta("La cantidad supera el stock disponible.", "error");
        return;
    }

    const itemExistente = carrito.find(item => item.id === id);

    if (itemExistente) {
        if (itemExistente.cantidad + cantidad > prod.stock) {
            mostrarMensajeVenta("La cantidad total excede el stock.", "error");
            return;
        }
        itemExistente.cantidad += cantidad;
    } else {
        carrito.push({
            id: prod.id,
            nombre: prod.nombre,
            precio: prod.precio,
            cantidad: cantidad
        });
    }

    renderCarrito();
    mostrarMensajeVenta("Producto agregado al carrito.", "ok");
}

function eliminarDelCarrito(idProducto) {
    carrito = carrito.filter(item => item.id !== idProducto);
    renderCarrito();
}

function calcularTotalCarrito() {
    return carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
}

function renderCarrito() {
    if (!tbodyCarrito) return;

    tbodyCarrito.innerHTML = "";

    carrito.forEach(item => {
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
        btnEliminar.addEventListener("click", () => eliminarDelCarrito(item.id));
        tdAccion.appendChild(btnEliminar);

        tr.appendChild(tdNombre);
        tr.appendChild(tdCantidad);
        tr.appendChild(tdPrecio);
        tr.appendChild(tdSubtotal);
        tr.appendChild(tdAccion);

        tbodyCarrito.appendChild(tr);
    });

    const total = calcularTotalCarrito();
    if (totalVentaSpan) {
        totalVentaSpan.textContent = `L ${total.toFixed(2)}`;
    }
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

// ======================================
// INVENTARIO: TABLA DE PRODUCTOS
// ======================================

function renderTablaProductos() {
    if (!tbodyProductos) return;

    tbodyProductos.innerHTML = "";

    if (productos.length === 0) {
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

    productos.forEach(prod => {
        const tr = document.createElement("tr");

        const tdNombre = document.createElement("td");
        tdNombre.textContent = prod.nombre;

        const tdPrecio = document.createElement("td");
        tdPrecio.textContent = `L ${prod.precio.toFixed(2)}`;

        const tdStock = document.createElement("td");
        tdStock.textContent = String(prod.stock);

        tr.appendChild(tdNombre);
        tr.appendChild(tdPrecio);
        tr.appendChild(tdStock);

        tbodyProductos.appendChild(tr);
    });
}

// ======================================
// HISTORIAL DE VENTAS
// ======================================

function renderHistorialVentas(lista = null) {
    if (!tbodyHistorial) return;

    const origen = Array.isArray(lista) ? lista : ventas;

    tbodyHistorial.innerHTML = "";

    if (origen.length === 0) {
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

    origen.forEach(venta => {
        const tr = document.createElement("tr");

        const tdId = document.createElement("td");
        tdId.textContent = String(venta.idVenta);

        const tdFecha = document.createElement("td");
        tdFecha.textContent = venta.fecha;

        const tdDetalle = document.createElement("td");
        tdDetalle.textContent = venta.items
            .map(i => `${i.nombre} (x${i.cantidad})`)
            .join(", ");

        const tdTotal = document.createElement("td");
        tdTotal.textContent = `L ${venta.total.toFixed(2)}`;

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

    const filtradas = ventas.filter(v => {
        const idStr = String(v.idVenta).toLowerCase();
        const fechaStr = String(v.fecha).toLowerCase();
        return idStr.includes(q) || fechaStr.includes(q);
    });

    renderHistorialVentas(filtradas);
}

// ======================================
// CONFIRMAR VENTA
// ======================================

function confirmarVenta() {
    mostrarMensajeVenta("");

    if (carrito.length === 0) {
        mostrarMensajeVenta("No hay productos en el carrito.", "error");
        return;
    }

    // Verificar stock actual
    for (const item of carrito) {
        const prod = productos.find(p => p.id === item.id);
        if (!prod || item.cantidad > prod.stock) {
            mostrarMensajeVenta(`Stock insuficiente para: ${item.nombre}`, "error");
            return;
        }
    }

    // Descontar stock
    carrito.forEach(item => {
        const prod = productos.find(p => p.id === item.id);
        if (prod) prod.stock -= item.cantidad;
    });
    guardarProductos();
    renderTablaProductos();

    const total = calcularTotalCarrito();
    const venta = {
        idVenta: Date.now(),
        fecha: new Date().toLocaleString(),
        items: JSON.parse(JSON.stringify(carrito)),
        total: total
    };

    ventas.push(venta);
    guardarVentas();
    renderHistorialVentas();

    carrito = [];
    renderCarrito();

    mostrarMensajeVenta("Venta registrada correctamente.", "ok");
}

// ======================================
// EVENTOS
// ======================================

if (productoSelect) {
    productoSelect.addEventListener("change", actualizarInfoProducto);
}
if (btnAgregar) btnAgregar.addEventListener("click", agregarAlCarrito);
if (btnConfirmarVenta) btnConfirmarVenta.addEventListener("click", confirmarVenta);
if (btnLimpiarCarrito) btnLimpiarCarrito.addEventListener("click", limpiarCarrito);
if (btnNuevaVenta) btnNuevaVenta.addEventListener("click", nuevaVenta);
if (historialSearchInput) {
    historialSearchInput.addEventListener("input", filtrarHistorial);
}

// ======================================
// INICIALIZACIÓN
// ======================================

(function init() {
    inicializarDatos();
    renderProductosSelect();
    renderTablaProductos();
    renderHistorialVentas();
    renderCarrito();
})();
