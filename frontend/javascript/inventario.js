// === CONFIGURACIÓN API ===
const API_BASE_URL = 'http://localhost:3001';
const API_PRODUCTOS = `${API_BASE_URL}/productos`;
const API_INVENTARIO = `${API_BASE_URL}/inventario`; // O la ruta correcta de tu API

// === ESTADO GLOBAL ===
let productos = [];
let inventario = []; // Para datos del inventario

// === VARIABLES DEL MODAL ===
let modalOverlay;
let modalClose;
let modalCancel;
let modalSave;
let modalTitle;
let productForm;
let modalMessage;

// Variables para los campos del formulario
let modalNombre;
let modalMarca;
let modalModelo;
let modalCategoria;
let modalSKU;
let modalPrecio;
let modalStock;
let modalStockMinimo;
let modalProveedor;
let modalDescripcion;
let modalUbicacion;

// Variables para el modal de vista rápida
let quickViewModal;
let btnCloseQuickView;
let btnCloseQuickViewBottom;
let quickViewTitle;
let quickViewBody;

// Variable para saber si estamos editando
let isEditing = false;
let currentProductId = null;

// === ELEMENTOS DOM ===
let productsTableBody;
let loadingRow;
let filterCategory;
let searchProduct;
let totalProductsEl;
let lowStockEl;
let totalValueEl;
let outOfStockEl;
let btnAddProduct;
let btnExport;
let btnPrint;
let lastUpdateEl;

// === FUNCIONES PARA CARGAR DATOS DESDE API ===

async function cargarProductosDesdeAPI() {
    try {
        console.log('🔄 Cargando productos desde API:', API_PRODUCTOS);
        
        // Mostrar estado de carga
        if (loadingRow) {
            loadingRow.innerHTML = `
                <td colspan="9" class="loading">
                    <i class="fas fa-spinner fa-spin"></i> Conectando con la base de datos...
                </td>
            `;
        }
        
        const response = await fetch(API_PRODUCTOS);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Respuesta de API:', data);
        
        // Transformar datos según la estructura de tu API
        productos = transformarDatosProductos(data);
        console.log(`✅ ${productos.length} productos cargados`);
        
        // Actualizar la interfaz
        mostrarProductosEnTabla();
        actualizarEstadisticas();
        actualizarFecha();
        
    } catch (error) {
        console.error('❌ Error al cargar productos:', error);
        
        // Mostrar error en la tabla
        if (loadingRow) {
            loadingRow.innerHTML = `
                <td colspan="9" class="loading" style="color: red;">
                    <i class="fas fa-exclamation-triangle"></i> 
                    Error al cargar productos: ${error.message}
                </td>
            `;
        }
        
        // Mostrar mensaje de error
        mostrarMensaje('No se pudieron cargar los productos. Verifica la conexión a la API.', 'error');
    }
}

function transformarDatosProductos(datos) {
    console.log('🔄 Transformando datos de API...');
    
    // Verificar diferentes estructuras posibles de la API
    let productosArray = [];
    
    if (Array.isArray(datos)) {
        productosArray = datos;
    } else if (datos.content && Array.isArray(datos.content)) {
        productosArray = datos.content;
    } else if (datos.data && Array.isArray(datos.data)) {
        productosArray = datos.data;
    } else if (datos.productos && Array.isArray(datos.productos)) {
        productosArray = datos.productos;
    } else {
        console.error('❌ Formato de datos no reconocido:', datos);
        return [];
    }
    
    // Mapear cada producto a un formato estándar
    return productosArray.map((prod, index) => {
        // ID
        let id = null;
        if (prod.id !== undefined) id = prod.id;
        else if (prod.IdProducts !== undefined) id = prod.IdProducts;
        else if (prod.IdProducto !== undefined) id = prod.IdProducto;
        else if (prod.ID !== undefined) id = prod.ID;
        else id = index + 1;
        
        // Nombre/Descripción
        let nombre = '';
        if (prod.nombre) {
            nombre = prod.nombre;
        } else if (prod.descripcion) {
            nombre = prod.descripcion.substring(0, 30) + (prod.descripcion.length > 30 ? '...' : '');
        } else if (prod.marca && prod.modelo) {
            nombre = `${prod.marca} ${prod.modelo}`;
        } else {
            nombre = `Producto ${id}`;
        }
        
        // Categoría
        let categoria = '';
        if (prod.categoria) categoria = prod.categoria;
        else if (prod.categoria_id) categoria = prod.categoria_id;
        else categoria = 'Sin categoría';
        
        // Stock
        let stockActual = 0;
        if (prod.stock !== undefined) stockActual = Number(prod.stock);
        else if (prod.cantidad !== undefined) stockActual = Number(prod.cantidad);
        else if (prod.existencia !== undefined) stockActual = Number(prod.existencia);
        else if (prod.Stock !== undefined) stockActual = Number(prod.Stock);
        
        // Stock mínimo (ajusta según tu API)
        let stockMinimo = prod.stock_minimo || prod.stockMinimo || 5;
        
        // Precio
        let precio = 0;
        if (prod.precio !== undefined) precio = Number(prod.precio);
        else if (prod.precio_venta !== undefined) precio = Number(prod.precio_venta);
        else if (prod.precioVenta !== undefined) precio = Number(prod.precioVenta);
        else if (prod.Precio !== undefined) precio = Number(prod.Precio);
        
        // Estado basado en stock
        let estado = 'Normal';
        if (stockActual <= 0) {
            estado = 'Agotado';
        } else if (stockActual <= stockMinimo) {
            estado = 'Bajo';
        } else if (stockActual > stockMinimo * 3) {
            estado = 'Excedente';
        }
        
        // Valor total
        let valorTotal = precio * stockActual;
        
        // Imagen (si está disponible en la API)
        let imagen = prod.urlImagen || prod.imagen || 'https://placehold.co/400x300?text=Producto&bg=667eea&color=fff';
        
        return {
            id: id,
            nombre: nombre,
            categoria: categoria,
            stockActual: stockActual,
            stockMinimo: stockMinimo,
            precio: precio,
            valorTotal: valorTotal,
            estado: estado,
            marca: prod.marca || '',
            modelo: prod.modelo || '',
            descripcion: prod.descripcion || '',
            proveedor: prod.proveedor || '',
            sku: prod.sku || prod.codigo || '',
            ubicacion: prod.ubicacion || '',
            imagen: imagen,
            fechaActualizacion: prod.fecha_actualizacion || prod.updatedAt || new Date().toISOString(),
            originalData: prod // Guardar datos originales
        };
    });
}

// === FUNCIONES DE RENDERIZADO ===

function mostrarProductosEnTabla() {
    if (!productsTableBody) return;
    
    // Ocultar fila de carga
    if (loadingRow) {
        loadingRow.style.display = 'none';
    }
    
    // Limpiar tabla
    productsTableBody.innerHTML = '';
    
    if (productos.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="9" class="text-center py-4" style="color: #6b7280;">
                <i class="fas fa-box-open" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                No hay productos en el inventario
            </td>
        `;
        productsTableBody.appendChild(row);
        return;
    }
    
    // Aplicar filtros si existen
    let productosFiltrados = [...productos];
    
    // Filtrar por categoría
    if (filterCategory && filterCategory.value) {
        productosFiltrados = productosFiltrados.filter(p => 
            p.categoria.toLowerCase() === filterCategory.value.toLowerCase()
        );
    }
    
    // Filtrar por búsqueda
    if (searchProduct && searchProduct.value.trim()) {
        const termino = searchProduct.value.trim().toLowerCase();
        productosFiltrados = productosFiltrados.filter(p => 
            p.nombre.toLowerCase().includes(termino) ||
            p.marca.toLowerCase().includes(termino) ||
            p.modelo.toLowerCase().includes(termino) ||
            p.sku.toLowerCase().includes(termino)
        );
    }
    
    // Actualizar contador
    const counter = document.querySelector('.table-header h3');
    if (counter) {
        counter.textContent = `${productosFiltrados.length} Productos`;
    }
    
    // Renderizar cada producto
    productosFiltrados.forEach(producto => {
        const row = document.createElement('tr');
        
        // Determinar clase CSS según estado
        let estadoClass = '';
        let estadoIcon = '';
        let estadoColor = '';
        
        switch(producto.estado) {
            case 'Agotado':
                estadoClass = 'status-out-of-stock';
                estadoIcon = 'fas fa-ban';
                estadoColor = '#ef4444';
                break;
            case 'Bajo':
                estadoClass = 'status-low-stock';
                estadoIcon = 'fas fa-exclamation-triangle';
                estadoColor = '#f59e0b';
                break;
            case 'Excedente':
                estadoClass = 'status-in-stock';
                estadoIcon = 'fas fa-arrow-up';
                estadoColor = '#10b981';
                break;
            default:
                estadoClass = 'status-in-stock';
                estadoIcon = 'fas fa-check-circle';
                estadoColor = '#3b82f6';
        }
        
        row.innerHTML = `
            <td>${producto.id}</td>
            <td>
                <div class="product-name-cell">
                    <strong>${producto.nombre}</strong>
                    ${producto.marca ? `<br><small>Marca: ${producto.marca}</small>` : ''}
                    ${producto.modelo ? `<br><small>Modelo: ${producto.modelo}</small>` : ''}
                </div>
            </td>
            <td>
                <span class="category-badge">${producto.categoria}</span>
            </td>
            <td class="text-center ${producto.stockActual <= producto.stockMinimo ? 'text-danger fw-bold' : ''}">
                ${producto.stockActual}
            </td>
            <td class="text-center">${producto.stockMinimo}</td>
            <td class="text-end">L ${producto.precio.toFixed(2)}</td>
            <td class="text-end fw-bold">L ${producto.valorTotal.toFixed(2)}</td>
            <td>
                <span class="status-badge ${estadoClass}" style="background-color: ${estadoColor}20; color: ${estadoColor}; border: 1px solid ${estadoColor}40;">
                    <i class="${estadoIcon}"></i> ${producto.estado}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" onclick="verDetalleProducto(${producto.id})" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-edit" onclick="editarProducto(${producto.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="eliminarProducto(${producto.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        productsTableBody.appendChild(row);
    });
}

function actualizarEstadisticas() {
    if (productos.length === 0) {
        if (totalProductsEl) totalProductsEl.textContent = '0';
        if (lowStockEl) lowStockEl.textContent = '0';
        if (totalValueEl) totalValueEl.textContent = 'L0.00';
        if (outOfStockEl) outOfStockEl.textContent = '0';
        return;
    }
    
    // Calcular estadísticas
    const totalProductos = productos.length;
    const stockBajo = productos.filter(p => p.estado === 'Bajo').length;
    const sinStock = productos.filter(p => p.estado === 'Agotado').length;
    const valorTotalInventario = productos.reduce((sum, p) => sum + p.valorTotal, 0);
    
    // Actualizar UI
    if (totalProductsEl) totalProductsEl.textContent = totalProductos;
    if (lowStockEl) lowStockEl.textContent = stockBajo;
    if (outOfStockEl) outOfStockEl.textContent = sinStock;
    if (totalValueEl) totalValueEl.textContent = `L${valorTotalInventario.toFixed(2)}`;
}

function actualizarFecha() {
    if (lastUpdateEl) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        lastUpdateEl.textContent = now.toLocaleDateString('es-ES', options);
    }
}

// === FUNCIONES DEL MODAL ===

function inicializarModal() {
    console.log('🎯 Inicializando modal...');
    
    // Obtener referencias a elementos del modal principal
    modalOverlay = document.getElementById('productModal');
    modalClose = document.getElementById('modalClose');
    modalCancel = document.getElementById('modalCancel');
    modalSave = document.getElementById('modalSave');
    modalTitle = document.getElementById('modalTitle');
    productForm = document.getElementById('productForm');
    modalMessage = document.getElementById('modalMessage');
    
    // Obtener referencias a los campos del formulario
    modalNombre = document.getElementById('modalNombre');
    modalMarca = document.getElementById('modalMarca');
    modalModelo = document.getElementById('modalModelo');
    modalCategoria = document.getElementById('modalCategoria');
    modalSKU = document.getElementById('modalSKU');
    modalPrecio = document.getElementById('modalPrecio');
    modalStock = document.getElementById('modalStock');
    modalStockMinimo = document.getElementById('modalStockMinimo');
    modalProveedor = document.getElementById('modalProveedor');
    modalDescripcion = document.getElementById('modalDescripcion');
    modalUbicacion = document.getElementById('modalUbicacion');
    
    // Obtener referencias al modal de vista rápida
    quickViewModal = document.getElementById('quickViewModal');
    btnCloseQuickView = document.getElementById('btnCloseQuickView');
    btnCloseQuickViewBottom = document.getElementById('btnCloseQuickViewBottom');
    quickViewTitle = document.getElementById('quickViewTitle');
    quickViewBody = document.getElementById('quickViewBody');
    
    // Configurar event listeners del modal principal
    if (modalClose) {
        modalClose.addEventListener('click', cerrarModal);
    }
    
    if (modalCancel) {
        modalCancel.addEventListener('click', cerrarModal);
    }
    
    if (modalSave) {
        modalSave.addEventListener('click', guardarProducto);
    }
    
    // Cerrar modal al hacer clic fuera
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                cerrarModal();
            }
        });
    }
    
    // Configurar event listeners del modal de vista rápida
    if (btnCloseQuickView) {
        btnCloseQuickView.addEventListener('click', cerrarQuickView);
    }
    
    if (btnCloseQuickViewBottom) {
        btnCloseQuickViewBottom.addEventListener('click', cerrarQuickView);
    }
    
    if (quickViewModal) {
        quickViewModal.addEventListener('click', (e) => {
            if (e.target === quickViewModal) {
                cerrarQuickView();
            }
        });
    }
    
    // Prevenir envío del formulario por defecto
    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            guardarProducto();
        });
    }
    
    console.log('✅ Modal inicializado');
}

function abrirModalAgregar() {
    console.log('📝 Abriendo modal para agregar producto');
    
    isEditing = false;
    currentProductId = null;
    
    // Configurar título
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-plus"></i> Agregar Producto';
    }
    
    // Limpiar formulario
    limpiarFormulario();
    
    // Mostrar modal
    if (modalOverlay) {
        modalOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevenir scroll
    }
    
    // Enfocar primer campo
    setTimeout(() => {
        if (modalNombre) modalNombre.focus();
    }, 100);
}

function abrirModalEditar(producto) {
    console.log('✏️ Abriendo modal para editar producto:', producto);
    
    isEditing = true;
    currentProductId = producto.id;
    
    // Configurar título
    if (modalTitle) {
        modalTitle.innerHTML = `<i class="fas fa-edit"></i> Editar Producto: ${producto.nombre.substring(0, 30)}${producto.nombre.length > 30 ? '...' : ''}`;
    }
    
    // Llenar formulario con datos del producto
    if (modalNombre) modalNombre.value = producto.nombre || '';
    if (modalMarca) modalMarca.value = producto.marca || '';
    if (modalModelo) modalModelo.value = producto.modelo || '';
    if (modalCategoria) modalCategoria.value = producto.categoria || '';
    if (modalSKU) modalSKU.value = producto.sku || '';
    if (modalPrecio) modalPrecio.value = producto.precio || '';
    if (modalStock) modalStock.value = producto.stockActual || 0;
    if (modalStockMinimo) modalStockMinimo.value = producto.stockMinimo || 5;
    if (modalProveedor) modalProveedor.value = producto.proveedor || '';
    if (modalDescripcion) modalDescripcion.value = producto.descripcion || '';
    if (modalUbicacion) modalUbicacion.value = producto.ubicacion || '';
    
    // Mostrar modal
    if (modalOverlay) {
        modalOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// === FUNCIONES DEL MODAL DE VISTA RÁPIDA ===

async function verDetalleProducto(id) {
    try {
        const producto = productos.find(p => p.id === id);
        if (!producto) {
            mostrarMensaje('Producto no encontrado', 'error');
            return;
        }
        
        // Configurar título
        if (quickViewTitle) {
            quickViewTitle.textContent = producto.nombre;
        }
        
        // Determinar estado
        let stockClass = 'in-stock';
        let statusText = 'Normal';
        let statusIcon = 'fa-check-circle';
        
        if (producto.estado === 'Agotado') {
            stockClass = 'out-of-stock';
            statusText = 'Agotado';
            statusIcon = 'fa-times-circle';
        } else if (producto.estado === 'Bajo') {
            stockClass = 'low-stock';
            statusText = 'Stock Bajo';
            statusIcon = 'fa-exclamation-triangle';
        }
        
        // Crear contenido del modal
        if (quickViewBody) {
            quickViewBody.innerHTML = `
                <div class="quick-view-product">
                    <div class="quick-view-image">
                        <img src="${producto.imagen}" alt="${producto.nombre}">
                    </div>
                    <div class="quick-view-details">
                        <h4>${producto.nombre}</h4>
                        <p>${producto.descripcion || 'Sin descripción disponible'}</p>
                        
                        <div class="quick-view-meta">
                            <div class="meta-item">
                                <h5>ID Producto</h5>
                                <p>${producto.id}</p>
                            </div>
                            <div class="meta-item">
                                <h5>Categoría</h5>
                                <p>${producto.categoria}</p>
                            </div>
                            <div class="meta-item">
                                <h5>Marca</h5>
                                <p>${producto.marca || 'No especificada'}</p>
                            </div>
                            <div class="meta-item">
                                <h5>Modelo</h5>
                                <p>${producto.modelo || 'No especificado'}</p>
                            </div>
                            <div class="meta-item">
                                <h5>Precio Unitario</h5>
                                <p class="price">L ${producto.precio.toFixed(2)}</p>
                            </div>
                            <div class="meta-item">
                                <h5>Valor Total</h5>
                                <p class="price">L ${producto.valorTotal.toFixed(2)}</p>
                            </div>
                            <div class="meta-item">
                                <h5>Stock Actual</h5>
                                <p class="stock ${stockClass}">
                                    <i class="fas fa-box"></i> ${producto.stockActual} unidades
                                </p>
                            </div>
                            <div class="meta-item">
                                <h5>Stock Mínimo</h5>
                                <p>${producto.stockMinimo} unidades</p>
                            </div>
                        </div>
                        
                        <div class="meta-item">
                            <h5>Estado</h5>
                            <span class="status-badge ${stockClass}">
                                <i class="fas ${statusIcon}"></i> ${statusText}
                            </span>
                        </div>
                        
                        ${producto.sku ? `<div class="meta-item">
                            <h5>SKU / Código</h5>
                            <p>${producto.sku}</p>
                        </div>` : ''}
                        
                        ${producto.proveedor ? `<div class="meta-item">
                            <h5>Proveedor</h5>
                            <p>${producto.proveedor}</p>
                        </div>` : ''}
                        
                        ${producto.ubicacion ? `<div class="meta-item">
                            <h5>Ubicación</h5>
                            <p>${producto.ubicacion}</p>
                        </div>` : ''}
                        
                        <div class="quick-view-actions">
                            <button class="btn btn-primary" onclick="editarProducto(${producto.id}); cerrarQuickView();">
                                <i class="fas fa-edit"></i> Editar Producto
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Mostrar modal
        if (quickViewModal) {
            quickViewModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
        
    } catch (error) {
        console.error('Error obteniendo detalles del producto:', error);
        mostrarMensaje('Error al cargar detalles del producto', 'warning');
    }
}

function cerrarQuickView() {
    console.log('❌ Cerrando vista rápida');
    
    if (quickViewModal) {
        quickViewModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restaurar scroll
    }
}

function cerrarModal() {
    console.log('❌ Cerrando modal');
    
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restaurar scroll
    }
    
    // Ocultar mensaje
    if (modalMessage) {
        modalMessage.style.display = 'none';
        modalMessage.className = 'form-message';
    }
}

function limpiarFormulario() {
    console.log('🧹 Limpiando formulario');
    
    if (modalNombre) modalNombre.value = '';
    if (modalMarca) modalMarca.value = '';
    if (modalModelo) modalModelo.value = '';
    if (modalCategoria) modalCategoria.value = '';
    if (modalSKU) modalSKU.value = '';
    if (modalPrecio) modalPrecio.value = '';
    if (modalStock) modalStock.value = '';
    if (modalStockMinimo) modalStockMinimo.value = '5';
    if (modalProveedor) modalProveedor.value = '';
    if (modalDescripcion) modalDescripcion.value = '';
    if (modalUbicacion) modalUbicacion.value = '';
    
    if (productForm) {
        productForm.reset();
    }
}

async function guardarProducto() {
    console.log('💾 Guardando producto...');
    
    // Validar campos obligatorios
    if (!modalNombre || !modalNombre.value.trim()) {
        mostrarMensajeModal('El nombre del producto es obligatorio', 'error');
        if (modalNombre) modalNombre.focus();
        return;
    }
    
    if (!modalMarca || !modalMarca.value) {
        mostrarMensajeModal('La marca es obligatoria', 'error');
        if (modalMarca) modalMarca.focus();
        return;
    }
    
    if (!modalCategoria || !modalCategoria.value) {
        mostrarMensajeModal('La categoría es obligatoria', 'error');
        if (modalCategoria) modalCategoria.focus();
        return;
    }
    
    if (!modalPrecio || modalPrecio.value <= 0) {
        mostrarMensajeModal('El precio debe ser mayor a 0', 'error');
        if (modalPrecio) modalPrecio.focus();
        return;
    }
    
    if (!modalStock || modalStock.value < 0) {
        mostrarMensajeModal('El stock no puede ser negativo', 'error');
        if (modalStock) modalStock.focus();
        return;
    }
    
    if (!modalStockMinimo || modalStockMinimo.value < 0) {
        mostrarMensajeModal('El stock mínimo no puede ser negativo', 'error');
        if (modalStockMinimo) modalStockMinimo.focus();
        return;
    }
    
    // Preparar datos del producto
    const productoData = {
        nombre: modalNombre.value.trim(),
        marca: modalMarca.value,
        modelo: modalModelo.value.trim(),
        categoria: modalCategoria.value,
        sku: modalSKU.value.trim(),
        precio: parseFloat(modalPrecio.value),
        stock: parseInt(modalStock.value),
        stock_minimo: parseInt(modalStockMinimo.value),
        proveedor: modalProveedor.value.trim(),
        descripcion: modalDescripcion.value.trim(),
        ubicacion: modalUbicacion.value.trim()
    };
    
    console.log('📦 Datos del producto:', productoData);
    
    try {
        mostrarMensajeModal('Guardando producto...', 'info');
        
        if (isEditing && currentProductId) {
            // Actualizar producto existente
            await actualizarProductoAPI(currentProductId, productoData);
        } else {
            // Crear nuevo producto
            await crearProductoAPI(productoData);
        }
        
    } catch (error) {
        console.error('❌ Error al guardar producto:', error);
        mostrarMensajeModal(`Error al guardar: ${error.message}`, 'error');
    }
}

async function crearProductoAPI(productoData) {
    try {
        console.log('🔄 Creando producto en API...');
        
        const response = await fetch(API_PRODUCTOS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productoData)
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Error HTTP ${response.status}: ${errorData}`);
        }
        
        const nuevoProducto = await response.json();
        console.log('✅ Producto creado:', nuevoProducto);
        
        // Mostrar mensaje de éxito
        mostrarMensajeModal('✅ Producto creado exitosamente', 'success');
        
        // Recargar productos después de un breve delay
        setTimeout(async () => {
            await cargarProductosDesdeAPI();
            cerrarModal();
        }, 1500);
        
    } catch (error) {
        console.error('❌ Error creando producto:', error);
        throw error;
    }
}

async function actualizarProductoAPI(id, productoData) {
    try {
        console.log(`🔄 Actualizando producto ${id} en API...`);
        
        const response = await fetch(`${API_PRODUCTOS}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productoData)
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Error HTTP ${response.status}: ${errorData}`);
        }
        
        const productoActualizado = await response.json();
        console.log('✅ Producto actualizado:', productoActualizado);
        
        // Mostrar mensaje de éxito
        mostrarMensajeModal('✅ Producto actualizado exitosamente', 'success');
        
        // Recargar productos después de un breve delay
        setTimeout(async () => {
            await cargarProductosDesdeAPI();
            cerrarModal();
        }, 1500);
        
    } catch (error) {
        console.error('❌ Error actualizando producto:', error);
        throw error;
    }
}

function mostrarMensajeModal(texto, tipo = 'info') {
    console.log(`💬 Modal [${tipo}]: ${texto}`);
    
    if (!modalMessage) return;
    
    modalMessage.textContent = texto;
    modalMessage.className = `form-message ${tipo}`;
    modalMessage.style.display = 'block';
    
    // Scroll al mensaje
    modalMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Auto-ocultar mensajes de éxito/info
    if (tipo !== 'error') {
        setTimeout(() => {
            if (modalMessage.textContent === texto) {
                modalMessage.style.display = 'none';
            }
        }, 5000);
    }
}

// === FUNCIONES DE FILTRADO Y BÚSQUEDA ===

function aplicarFiltros() {
    mostrarProductosEnTabla();
}

// === FUNCIONES PARA AGREGAR/EDITAR/ELIMINAR ===

function agregarProducto() {
    abrirModalAgregar();
}

function editarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) {
        mostrarMensaje('Producto no encontrado', 'error');
        return;
    }
    
    abrirModalEditar(producto);
}

async function eliminarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) {
        mostrarMensaje('Producto no encontrado', 'error');
        return;
    }
    
    if (confirm(`¿Estás seguro de eliminar el producto "${producto.nombre}"?`)) {
        try {
            mostrarMensaje(`Eliminando producto "${producto.nombre}"...`, 'info');
            
            const response = await fetch(`${API_PRODUCTOS}/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                mostrarMensaje(`✅ Producto "${producto.nombre}" eliminado correctamente`, 'success');
                // Recargar productos
                await cargarProductosDesdeAPI();
            } else {
                throw new Error('Error al eliminar producto');
            }
        } catch (error) {
            console.error('Error eliminando producto:', error);
            mostrarMensaje(`❌ Error al eliminar producto: ${error.message}`, 'error');
        }
    }
}

// === FUNCIONES DE EXPORTACIÓN ===

function exportarCSV() {
    if (productos.length === 0) {
        mostrarMensaje('No hay datos para exportar', 'warning');
        return;
    }
    
    // Crear contenido CSV
    let csvContent = "ID,Producto,Categoría,Stock Actual,Stock Mínimo,Precio,Valor Total,Estado\n";
    
    productos.forEach(p => {
        csvContent += `${p.id},"${p.nombre}",${p.categoria},${p.stockActual},${p.stockMinimo},${p.precio},${p.valorTotal},${p.estado}\n`;
    });
    
    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `inventario_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarMensaje('Datos exportados como CSV', 'success');
}

function imprimirReporte() {
    window.print();
}

// === FUNCIONES AUXILIARES ===

function mostrarMensaje(texto, tipo = 'info') {
    console.log(`[${tipo.toUpperCase()}] ${texto}`);
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${texto}</span>
    `;
    
    // Estilos básicos para toast
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${tipo === 'success' ? '#10b981' : tipo === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// === INICIALIZACIÓN ===

async function inicializar() {
    console.log('🚀 Inicializando sistema de inventario...');
    
    // Obtener referencias a elementos DOM
    productsTableBody = document.getElementById('productsTableBody');
    loadingRow = document.getElementById('loadingRow');
    filterCategory = document.getElementById('filterCategory');
    searchProduct = document.getElementById('searchProduct');
    totalProductsEl = document.getElementById('totalProducts');
    lowStockEl = document.getElementById('lowStock');
    totalValueEl = document.getElementById('totalValue');
    outOfStockEl = document.getElementById('outOfStock');
    btnAddProduct = document.getElementById('btnAddProduct');
    btnExport = document.getElementById('btnExport');
    btnPrint = document.getElementById('btnPrint');
    lastUpdateEl = document.getElementById('lastUpdate');
    
    // Inicializar modal
    inicializarModal();
    
    // Configurar event listeners
    if (filterCategory) {
        filterCategory.addEventListener('change', aplicarFiltros);
    }
    
    if (searchProduct) {
        searchProduct.addEventListener('input', aplicarFiltros);
    }
    
    if (btnAddProduct) {
        btnAddProduct.addEventListener('click', agregarProducto);
    }
    
    if (btnExport) {
        btnExport.addEventListener('click', exportarCSV);
    }
    
    if (btnPrint) {
        btnPrint.addEventListener('click', imprimirReporte);
    }
    
    // Cargar datos iniciales
    await cargarProductosDesdeAPI();
    
    // Configurar actualización automática cada 30 segundos
    setInterval(async () => {
        console.log('🔄 Actualizando datos automáticamente...');
        await cargarProductosDesdeAPI();
    }, 30000);
    
    console.log('✅ Sistema de inventario inicializado');
}

// === MANEJADOR DE ERRORES GLOBAL ===
window.addEventListener('error', function(e) {
    console.error('❌ Error global:', e.error);
    mostrarMensaje(`Error: ${e.message}`, 'error');
});

// === INICIALIZAR CUANDO EL DOM ESTÉ LISTO ===
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    setTimeout(inicializar, 100);
}

// === FUNCIONES GLOBALES (para acceso desde HTML) ===
window.editarProducto = editarProducto;
window.eliminarProducto = eliminarProducto;
window.verDetalleProducto = verDetalleProducto;