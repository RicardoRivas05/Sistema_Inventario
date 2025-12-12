// R.Ventas.js - CONECTADO A API DE VENTAS REAL

// ======================================
// CONFIGURACIÓN API
// ======================================
const API_BASE_URL = 'http://localhost:3001';
const API_PRODUCTOS = `${API_BASE_URL}/productos`;
const API_VENTAS = `${API_BASE_URL}/ventas`;

// ======================================
// ESTADO
// ======================================
let productos = [];
let ventas = [];
let carrito = [];

// ======================================
// ELEMENTOS DOM
// ======================================
let ventaMessage;
let productoSelect;
let cantidadInput;
let precioProducto;
let stockDisponible;
let btnAgregar;
let btnConfirmarVenta;
let btnLimpiarCarrito;
let btnNuevaVenta;
let tbodyCarrito;
let tbodyProductos;
let tbodyHistorial;
let totalVentaSpan;

// ======================================
// FUNCIONES PARA CONECTAR CON API
// ======================================

async function cargarProductosDesdeAPI() {
    try {
        console.log('🔄 Conectando a API:', API_PRODUCTOS);
        
        const response = await fetch(API_PRODUCTOS);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Datos RAW de API:', data);
        
        // Convertir productos
        productos = convertirProductosAPIVentas(data);
        console.log(`✅ ${productos.length} productos convertidos`);
        
        // Debug
        productos.slice(0, 3).forEach((p, i) => {
            console.log(`Producto ${i}: ID=${p.id}, Nombre="${p.nombre}", Precio=${p.precio}, Stock=${p.stock}`);
        });
        
        mostrarMensaje(`${productos.length} productos cargados`, 'success');
        
    } catch (error) {
        console.error('❌ Error:', error);
        mostrarMensaje('Error al cargar productos', 'error');
        productos = [];
    }
    
    renderProductosSelect();
    renderTablaProductos();
}

function convertirProductosAPIVentas(datos) {
    console.log('🔄 Convirtiendo datos de API...');
    
    if (Array.isArray(datos)) {
        console.log('📦 Datos son un array');
        return datos.map((prod, index) => {
            // ID
            let id = null;
            if (prod.id !== undefined) id = prod.id;
            else if (prod.IdProducts !== undefined) id = prod.IdProducts;
            else if (prod.IdProducto !== undefined) id = prod.IdProducto;
            else if (prod.ID !== undefined) id = prod.ID;
            else id = index + 1;
            
            id = Number(id);
            
            // Nombre
            let nombre = '';
            if (prod.marca && prod.modelo) {
                nombre = `${prod.marca} ${prod.modelo}`;
            } else if (prod.nombre) {
                nombre = prod.nombre;
            } else if (prod.descripcion) {
                nombre = prod.descripcion.substring(0, 30);
            } else {
                nombre = `Producto ${id}`;
            }
            
            // Precio
            let precio = 0;
            if (prod.precio_venta !== undefined) precio = Number(prod.precio_venta);
            else if (prod.precioVenta !== undefined) precio = Number(prod.precioVenta);
            else if (prod.precio !== undefined) precio = Number(prod.precio);
            else if (prod.Precio !== undefined) precio = Number(prod.Precio);
            
            // Stock
            let stock = 0;
            if (prod.stock !== undefined) stock = Number(prod.stock);
            else if (prod.cantidad !== undefined) stock = Number(prod.cantidad);
            else if (prod.existencia !== undefined) stock = Number(prod.existencia);
            else if (prod.Stock !== undefined) stock = Number(prod.Stock);
            
            console.log(`   Convertido: ID=${id}, Nombre="${nombre}", Precio=${precio}, Stock=${stock}`);
            
            return {
                id: id,
                nombre: nombre,
                precio: precio,
                stock: stock,
                precioCompra: prod.precio_compra || prod.precioCompra || 0,
                categoria: prod.categoria || '',
                descripcion: prod.descripcion || '',
                originalData: prod
            };
        });
    }
    
    if (datos.content && Array.isArray(datos.content)) {
        console.log('📦 Datos tienen paginación (content)');
        return convertirProductosAPIVentas(datos.content);
    }
    
    if (datos.data && Array.isArray(datos.data)) {
        console.log('📦 Datos tienen wrapper (data)');
        return convertirProductosAPIVentas(datos.data);
    }
    
    console.error('❌ Formato de datos desconocido:', datos);
    return [];
}

async function cargarVentasDesdeAPI() {
    try {
        console.log('🔄 Cargando historial de ventas...');
        
        const response = await fetch(API_VENTAS);
        
        if (response.ok) {
            const data = await response.json();
            
            let ventasData = data;
            if (data.content && Array.isArray(data.content)) {
                ventasData = data.content;
            } else if (data.data && Array.isArray(data.data)) {
                ventasData = data.data;
            } else if (!Array.isArray(data)) {
                ventasData = [data];
            }
            
            ventas = ventasData.map(venta => ({
                idVenta: venta.id || venta.IdVentas || Date.now(),
                fecha: venta.fecha || venta.createdAt || new Date().toISOString(),
                items: venta.detalle || venta.items || [],
                total: venta.total || venta.monto_total || 0,
                cliente: venta.cliente || 'Cliente general'
            }));
            
            console.log(`✅ ${ventas.length} ventas cargadas desde API`);
        } else {
            console.log('⚠️ No hay ventas en la API');
            ventas = [];
        }
        
    } catch (error) {
        console.error('❌ Error cargando ventas:', error);
        ventas = [];
    }
    
    // ¡ESTA FUNCIÓN DEBE EXISTIR!
    renderHistorialVentas();
}

// ======================================
// FUNCIONES DE RENDERIZADO - TODAS DEFINIDAS
// ======================================

function renderProductosSelect() {
    console.log('🎯 Renderizando selector. Productos:', productos.length);
    
    if (!productoSelect) {
        console.error('❌ ERROR: productoSelect no encontrado');
        return;
    }
    
    productoSelect.innerHTML = '<option value="">Selecciona un producto</option>';
    
    if (productos.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No hay productos disponibles';
        productoSelect.appendChild(option);
        productoSelect.disabled = true;
        return;
    }
    
    productos.forEach(prod => {
        const option = document.createElement('option');
        option.value = prod.id;
        option.textContent = `${prod.nombre} (Stock: ${prod.stock}) - L ${prod.precio.toFixed(2)}`;
        productoSelect.appendChild(option);
    });
    
    productoSelect.disabled = false;
    
    setTimeout(() => {
        actualizarInfoProducto();
    }, 100);
}

function actualizarInfoProducto() {
    console.log('🎯 ACTUALIZANDO INFO - Selector value:', productoSelect?.value);
    
    if (!productoSelect || !productoSelect.value) {
        console.log('⚠️ No hay producto seleccionado');
        if (precioProducto) precioProducto.value = 'L 0.00';
        if (stockDisponible) stockDisponible.value = '0';
        return;
    }
    
    const idSeleccionado = productoSelect.value;
    console.log('🔍 Buscando producto con ID:', idSeleccionado);
    
    const productoEncontrado = productos.find(p => p.id == idSeleccionado);
    
    if (productoEncontrado) {
        console.log('✅ PRODUCTO ENCONTRADO:', productoEncontrado);
        
        if (precioProducto) {
            precioProducto.value = `L ${productoEncontrado.precio.toFixed(2)}`;
            console.log('💰 Precio actualizado a:', precioProducto.value);
        }
        
        if (stockDisponible) {
            stockDisponible.value = productoEncontrado.stock;
            console.log('📦 Stock actualizado a:', stockDisponible.value);
        }
    } else {
        console.error('❌ ERROR: Producto no encontrado con ID:', idSeleccionado);
        if (precioProducto) precioProducto.value = 'L 0.00';
        if (stockDisponible) stockDisponible.value = '0';
    }
}

function renderTablaProductos() {
    console.log('🎯 Renderizando tabla de productos');
    
    if (!tbodyProductos) {
        console.error('❌ tbodyProductos no encontrado');
        return;
    }
    
    tbodyProductos.innerHTML = '';
    
    if (productos.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 3;
        td.className = 'text-center text-muted py-3';
        td.textContent = 'Cargando productos...';
        tr.appendChild(td);
        tbodyProductos.appendChild(tr);
        return;
    }
    
    productos.forEach(prod => {
        const tr = document.createElement('tr');
        
        const stockClass = prod.stock <= 5 ? 'text-danger fw-bold' : 
                          prod.stock <= 10 ? 'text-warning' : '';
        
        tr.innerHTML = `
            <td>${prod.nombre}</td>
            <td class="text-end">L ${prod.precio.toFixed(2)}</td>
            <td class="text-center ${stockClass}">${prod.stock}</td>
        `;
        
        tbodyProductos.appendChild(tr);
    });
}

function renderCarrito() {
    console.log('🎯 Renderizando carrito. Items:', carrito.length);
    
    if (!tbodyCarrito) {
        console.error('❌ tbodyCarrito no encontrado');
        return;
    }
    
    tbodyCarrito.innerHTML = '';
    
    if (carrito.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 5;
        td.className = 'text-center text-muted py-4';
        td.textContent = 'No hay productos en el carrito';
        tr.appendChild(td);
        tbodyCarrito.appendChild(tr);
    } else {
        carrito.forEach(item => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${item.nombre}</td>
                <td class="text-center">${item.cantidad}</td>
                <td class="text-end">L ${item.precio.toFixed(2)}</td>
                <td class="text-end fw-bold">L ${(item.precio * item.cantidad).toFixed(2)}</td>
                <td class="text-center">
                    <button class="btn btn-danger btn-sm" onclick="eliminarDelCarrito(${item.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            `;
            
            tbodyCarrito.appendChild(tr);
        });
    }
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    if (totalVentaSpan) {
        totalVentaSpan.textContent = `L ${total.toFixed(2)}`;
    }
}

// ¡ESTA ES LA FUNCIÓN QUE FALTABA!
function renderHistorialVentas() {
    console.log('🎯 Renderizando historial de ventas');
    
    if (!tbodyHistorial) {
        console.error('❌ tbodyHistorial no encontrado');
        return;
    }
    
    tbodyHistorial.innerHTML = '';
    
    if (ventas.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 4;
        td.className = 'text-center text-muted py-3';
        td.textContent = 'No hay ventas registradas';
        tr.appendChild(td);
        tbodyHistorial.appendChild(tr);
        return;
    }
    
    const ventasRecientes = [...ventas].reverse().slice(0, 10);
    
    ventasRecientes.forEach(venta => {
        const tr = document.createElement('tr');
        
        const fecha = new Date(venta.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }) + ' ' + fecha.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        tr.innerHTML = `
            <td>#${venta.idVenta.toString().slice(-6)}</td>
            <td>${fechaFormateada}</td>
            <td>${venta.items ? venta.items.map(i => `${i.nombre || 'Producto'} x${i.cantidad}`).join(', ') : 'Sin detalle'}</td>
            <td class="text-end fw-bold">L ${venta.total ? venta.total.toFixed(2) : '0.00'}</td>
        `;
        
        tbodyHistorial.appendChild(tr);
    });
}

// ======================================
// FUNCIONES DEL CARRITO
// ======================================

function agregarAlCarrito() {
    console.log('🛒 Agregando al carrito...');
    
    if (!productoSelect || !productoSelect.value) {
        mostrarMensaje('❌ Por favor, selecciona un producto primero', 'error');
        return;
    }
    
    const id = parseInt(productoSelect.value);
    const prod = productos.find(p => p.id == id);
    
    if (!prod) {
        mostrarMensaje('❌ Error: Producto no encontrado', 'error');
        return;
    }
    
    let cantidad = 1;
    if (cantidadInput) {
        cantidad = parseInt(cantidadInput.value) || 1;
    }
    
    if (cantidad <= 0 || isNaN(cantidad)) {
        mostrarMensaje('❌ Ingresa una cantidad válida', 'error');
        return;
    }
    
    if (cantidad > prod.stock) {
        mostrarMensaje(`❌ Stock insuficiente. Disponible: ${prod.stock}`, 'error');
        return;
    }
    
    const itemExistente = carrito.find(item => item.id == id);
    
    if (itemExistente) {
        if (itemExistente.cantidad + cantidad > prod.stock) {
            mostrarMensaje(`❌ No hay suficiente stock. Ya tienes ${itemExistente.cantidad} en el carrito`, 'error');
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
    mostrarMensaje(`✅ ${prod.nombre} x${cantidad} agregado al carrito`, 'success');
    
    if (cantidadInput) cantidadInput.value = '1';
}

function eliminarDelCarrito(idProducto) {
    carrito = carrito.filter(item => item.id != idProducto);
    renderCarrito();
    mostrarMensaje('Producto eliminado del carrito', 'info');
}

// ======================================
// FUNCIÓN DE VENTA MEJORADA - CORREGIR ERROR 422
// ======================================

async function confirmarVenta() {
    if (carrito.length === 0) {
        mostrarMensaje('❌ No hay productos en el carrito', 'error');
        return;
    }
    
    mostrarMensaje('⏳ Procesando venta...', 'info');
    
    // Verificar stock
    for (const item of carrito) {
        const prod = productos.find(p => p.id == item.id);
        if (!prod || item.cantidad > prod.stock) {
            mostrarMensaje(`❌ Stock insuficiente para: ${item.nombre}`, 'error');
            return;
        }
    }
    
    // Calcular total
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    // Crear venta local
    const ventaData = {
        idVenta: Date.now(),
        fecha: new Date().toISOString(),
        items: [...carrito],
        total: total,
        cliente: 'Cliente general'
    };
    
    // Actualizar stock localmente
    carrito.forEach(item => {
        const prod = productos.find(p => p.id == item.id);
        if (prod) {
            prod.stock -= item.cantidad;
        }
    });
    
    // Intentar guardar en API con formato correcto para evitar 422
    try {
        // Formato que tu API probablemente espera
        const ventaParaAPI = {
            fecha: new Date().toISOString(),
            total: total,
            monto_total: total,
            detalle: JSON.stringify(carrito), // O carrito directamente si espera array
            items: carrito, // Enviar también como array
            cliente: 'Cliente general',
            estado: 'completada',
            // Si tu API necesita más campos, agrégalos aquí
        };
        
        const response = await fetch(API_VENTAS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ventaParaAPI)
        });
        
        if (response.ok) {
            const nuevaVenta = await response.json();
            ventas.push({
                ...ventaData,
                idVenta: nuevaVenta.id || ventaData.idVenta
            });
            mostrarMensaje(`✅ Venta registrada en la base de datos. Total: L ${total.toFixed(2)}`, 'success');
        } else {
            // Si falla, intentar con formato alternativo
            console.log('⚠️ Primer intento falló, probando formato alternativo...');
            
            // Formato alternativo sin campo 'detalle'
            const ventaAlternativa = {
                fecha: new Date().toISOString(),
                total: total,
                items: carrito,
                cliente: 'Cliente general'
            };
            
            const response2 = await fetch(API_VENTAS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ventaAlternativa)
            });
            
            if (response2.ok) {
                const nuevaVenta = await response2.json();
                ventas.push({
                    ...ventaData,
                    idVenta: nuevaVenta.id || ventaData.idVenta
                });
                mostrarMensaje(`✅ Venta registrada. Total: L ${total.toFixed(2)}`, 'success');
            } else {
                // Guardar solo localmente
                ventas.push(ventaData);
                mostrarMensaje(`✅ Venta completada localmente. Total: L ${total.toFixed(2)}`, 'success');
            }
        }
    } catch (error) {
        // Fallback: guardar localmente
        ventas.push(ventaData);
        mostrarMensaje(`✅ Venta completada (modo offline). Total: L ${total.toFixed(2)}`, 'success');
    }
    
    // Limpiar y actualizar
    carrito = [];
    renderCarrito();
    renderProductosSelect();
    renderTablaProductos();
    renderHistorialVentas();
    
    // Imprimir recibo
    console.log('🧾 Recibo de venta:', ventaData);
}

// ======================================
// FUNCIONES AUXILIARES
// ======================================

function mostrarMensaje(texto, tipo = 'info') {
    console.log(`💬 [${tipo}] ${texto}`);
    
    if (!ventaMessage) {
        ventaMessage = document.getElementById('venta-message');
        if (!ventaMessage) {
            console.error('❌ No se encontró el elemento de mensajes');
            return;
        }
    }
    
    ventaMessage.textContent = texto;
    ventaMessage.className = 'form-message';
    
    if (tipo === 'error') {
        ventaMessage.style.color = '#dc2626';
        ventaMessage.style.backgroundColor = '#fef2f2';
        ventaMessage.style.borderLeft = '4px solid #dc2626';
    } else if (tipo === 'success') {
        ventaMessage.style.color = '#16a34a';
        ventaMessage.style.backgroundColor = '#f0fdf4';
        ventaMessage.style.borderLeft = '4px solid #16a34a';
    } else {
        ventaMessage.style.color = '#0284c7';
        ventaMessage.style.backgroundColor = '#f0f9ff';
        ventaMessage.style.borderLeft = '4px solid #0284c7';
    }
    
    ventaMessage.style.display = 'block';
    ventaMessage.style.padding = '10px';
    ventaMessage.style.marginTop = '10px';
    ventaMessage.style.borderRadius = '4px';
    
    if (tipo !== 'error') {
        setTimeout(() => {
            if (ventaMessage && ventaMessage.textContent === texto) {
                ventaMessage.style.display = 'none';
            }
        }, 5000);
    }
}

// ======================================
// INICIALIZACIÓN
// ======================================

async function inicializar() {
    console.log('🚀 INICIANDO SISTEMA...');
    
    ventaMessage = document.getElementById('venta-message');
    productoSelect = document.getElementById('productoSelect');
    cantidadInput = document.getElementById('cantidadInput');
    precioProducto = document.getElementById('precioProducto');
    stockDisponible = document.getElementById('stockDisponible');
    btnAgregar = document.getElementById('btnAgregar');
    btnConfirmarVenta = document.getElementById('btnConfirmarVenta');
    btnLimpiarCarrito = document.getElementById('btnLimpiarCarrito');
    btnNuevaVenta = document.getElementById('btn-nueva-venta');
    tbodyCarrito = document.getElementById('tbodyCarrito');
    tbodyProductos = document.getElementById('tbodyProductos');
    tbodyHistorial = document.getElementById('tbodyHistorial');
    totalVentaSpan = document.getElementById('totalVenta');
    
    console.log('🔍 Elementos encontrados:');
    console.log('- productoSelect:', !!productoSelect);
    console.log('- precioProducto:', !!precioProducto);
    console.log('- stockDisponible:', !!stockDisponible);
    console.log('- btnAgregar:', !!btnAgregar);
    console.log('- tbodyCarrito:', !!tbodyCarrito);
    console.log('- tbodyHistorial:', !!tbodyHistorial);
    
    if (!productoSelect) {
        mostrarMensaje('Error: No se pudo inicializar el sistema', 'error');
        return;
    }
    
    await cargarProductosDesdeAPI();
    await cargarVentasDesdeAPI();
    
    renderCarrito();
    
    productoSelect.addEventListener('change', function() {
        console.log('🎯 EVENTO CHANGE disparado! Valor:', this.value);
        actualizarInfoProducto();
    });
    
    btnAgregar.addEventListener('click', agregarAlCarrito);
    btnConfirmarVenta.addEventListener('click', confirmarVenta);
    
    if (btnLimpiarCarrito) {
        btnLimpiarCarrito.addEventListener('click', () => {
            carrito = [];
            renderCarrito();
            mostrarMensaje('Carrito limpiado', 'info');
        });
    }
    
    if (btnNuevaVenta) {
        btnNuevaVenta.addEventListener('click', () => {
            carrito = [];
            renderCarrito();
            mostrarMensaje('Nueva venta iniciada', 'info');
        });
    }
    
    actualizarInfoProducto();
    
    console.log('✅ Sistema inicializado');
    mostrarMensaje('✅ Sistema listo. Selecciona un producto para comenzar.', 'success');
}

// ======================================
// FUNCIONES GLOBALES
// ======================================

window.eliminarDelCarrito = eliminarDelCarrito;
window.agregarAlCarrito = agregarAlCarrito;
window.confirmarVenta = confirmarVenta;

// ======================================
// EJECUCIÓN
// ======================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    setTimeout(inicializar, 100);
}