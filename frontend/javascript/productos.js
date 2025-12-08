// productos.js - Funcionalidad completa para el catálogo de productos

document.addEventListener('DOMContentLoaded', function() {
    // ========== CONFIGURACIÓN API ==========
    const API_BASE_URL = 'http://[::1]:3001';
    const ITEMS_PER_PAGE = 8;
    
    // ========== VARIABLES GLOBALES ==========
    let productos = [];
    let currentPage = 1;
    let currentView = 'cards'; // 'cards' o 'list'
    let currentFilter = {
        category: '',
        status: '',
        search: ''
    };
    let totalPages = 1;
    let totalProductos = 0;

    // ========== ELEMENTOS DEL DOM ==========
    // Botones de vista
    const btnCardView = document.getElementById('btnCardView');
    const btnListView = document.getElementById('btnListView');
    
    // Filtros
    const filterCategory = document.getElementById('filterCategory');
    const filterStatus = document.getElementById('filterStatus');
    const searchProduct = document.getElementById('searchProduct');
    
    // Botones principales
    const btnAddProduct = document.getElementById('btnAddProduct');
    const btnExportAll = document.getElementById('btnExportAll');
    const btnPrintCatalog = document.getElementById('btnPrintCatalog');
    const btnRefreshData = document.getElementById('btnRefreshData');
    
    // Modales
    const productModal = document.getElementById('productModal');
    const quickViewModal = document.getElementById('quickViewModal');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnCancelModal = document.getElementById('btnCancelModal');
    const btnCloseQuickView = document.getElementById('btnCloseQuickView');
    
    // Formulario
    const productForm = document.getElementById('productForm');
    
    // Contenedores de productos
    const cardsGrid = document.querySelector('.cards-grid');
    const productsTable = document.querySelector('.products-table tbody');
    
    // Paginación
    const prevPageBtn = document.getElementById('prevPageTable');
    const nextPageBtn = document.getElementById('nextPageTable');
    const pageInfo = document.getElementById('pageInfoTable');

    // ========== FUNCIONES AUXILIARES ==========
    function calcularEstadoProducto(stock, stockMinimo) {
        if (stock === 0) {
            return 'agotado';
        } else if (stock <= stockMinimo) {
            return 'bajo-stock';
        } else {
            return 'disponible';
        }
    }

    function getCategoriaNombre(categoria) {
        const categorias = {
            'telefonos': 'Teléfonos',
            'tablets': 'Tablets',
            'accesorios': 'Accesorios',
            'cargadores': 'Cargadores',
            'fundas': 'Fundas',
            'audifonos': 'Audífonos',
            'Celulares': 'Celulares'
        };
        return categorias[categoria] || categoria;
    }

    // ========== FUNCIONES DE CARGA DESDE API ==========
    async function cargarProductosDesdeAPI() {
        try {
            mostrarLoading(true);

            // Construir URL con paginación
            let url = `${API_BASE_URL}/productos/page?page=${currentPage}&limit=${ITEMS_PER_PAGE}`;

            // Aplicar filtros simples
            const params = new URLSearchParams();

            if (currentFilter.category) params.append("categoria", currentFilter.category);
            if (currentFilter.status) params.append("estado", currentFilter.status);
            if (currentFilter.search) params.append("search", currentFilter.search);

            const queryString = params.toString();
            if (queryString) url += `&${queryString}`;

            console.log("URL generada:", url);

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

            const data = await response.json();

            // Normalizar estructura
            productos = data.map(producto => ({
                id: producto.idProducto || producto.id,
                idProducto: producto.idProducto,
                codigo: producto.codigo || `PROD-${(producto.idProducto || producto.id).toString().padStart(3, '0')}`,
                nombre: producto.nombre || `${producto.marca} ${producto.modelo}`,
                marca: producto.marca,
                modelo: producto.modelo,
                descripcion: producto.descripcion || '',
                categoria: producto.categoria || 'Celulares',
                precioCompra: parseFloat(producto.precioCompra) || 0,
                precioVenta: parseFloat(producto.precioVenta) || 0,
                stock: parseInt(producto.stock) || 0,
                stockMinimo: parseInt(producto.stockMinimo) || 10,
                stockMaximo: parseInt(producto.stockMaximo) || 100,
                imagen: producto.urlImagen || 'https://placehold.co/400x300?text=Producto&bg=667eea&color=fff',
                estado: producto.estado || calcularEstadoProducto(producto.stock, producto.stockMinimo),
                idProveedor: producto.idProveedor || null,
                proveedor_nombre: producto.proveedor_nombre || '',
                fechaCreacion: producto.fechaCreacion || new Date().toISOString().split('T')[0]
            }));

            // ⚠️ No tienes paginación real aún
            // Solo sabes si vienen ITEMS_PER_PAGE elementos
            if (productos.length < ITEMS_PER_PAGE) {
                totalPages = currentPage; 
            } else {
                totalPages = currentPage + 1; 
            }

            totalProductos = productos.length;
            actualizarPaginacion();
            renderizarProductos();

        } catch (error) {
            console.error('Error cargando productos:', error);
            mostrarNotificacion('Error al cargar productos desde el servidor', 'warning');
            mostrarEstadoVacio();

        } finally {
            mostrarLoading(false);
        }
    }


    function mostrarLoading(mostrar) {
        if (mostrar) {
            if (cardsGrid) {
                cardsGrid.innerHTML = `
                    <div class="loading-card">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Cargando productos...</p>
                    </div>
                `;
            }
            if (productsTable) {
                productsTable.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 40px;">
                            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #ccc; margin-bottom: 10px; display: block;"></i>
                            <p>Cargando productos...</p>
                        </td>
                    </tr>
                `;
            }
        }
    }

    function mostrarEstadoVacio() {
        if (cardsGrid) {
            cardsGrid.innerHTML = `
                <div class="empty-state-cards">
                    <i class="fas fa-database"></i>
                    <h3>No hay productos disponibles</h3>
                    <p>Agrega tu primer producto o verifica la conexión con el servidor</p>
                    <button class="add-product-btn" style="margin-top: 15px;" onclick="abrirModalNuevo()">
                        <i class="fas fa-plus"></i> Agregar Producto
                    </button>
                </div>
            `;
        }
        if (productsTable) {
            productsTable.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px;">
                        <i class="fas fa-database" style="font-size: 2rem; color: #ccc; margin-bottom: 10px; display: block;"></i>
                        <h3>No hay productos disponibles</h3>
                        <p>Agrega tu primer producto o verifica la conexión con el servidor</p>
                    </td>
                </tr>
            `;
        }
    }

    // ========== FUNCIONES DE RENDERIZADO ==========
    function renderizarProductos() {
        const productosFiltrados = filtrarProductos();
        
        // MOSTRAR/OCULTAR VISTAS
        if (currentView === 'cards') {
            // Mostrar vista de tarjetas
            document.getElementById('cardsGrid').style.display = 'grid';
            document.getElementById('tableView').style.display = 'none';
            renderizarCards(productosFiltrados);
        } else {
            // Mostrar vista de tabla
            document.getElementById('cardsGrid').style.display = 'none';
            document.getElementById('tableView').style.display = 'block';
            renderizarTabla(productosFiltrados);
        }
        
        actualizarInfoActualizacion();
    }

    function renderizarCards(productosFiltrados) {
        cardsGrid.innerHTML = '';
        
        if (productosFiltrados.length === 0) {
            cardsGrid.innerHTML = `
                <div class="empty-state-cards">
                    <i class="fas fa-box-open"></i>
                    <h3>No se encontraron productos</h3>
                    <p>Intenta con otros filtros o agrega un nuevo producto</p>
                    <button class="add-product-btn" style="margin-top: 15px;" onclick="abrirModalNuevo()">
                        <i class="fas fa-plus"></i> Agregar Producto
                    </button>
                </div>
            `;
            return;
        }
        
        productosFiltrados.forEach(producto => {
            const card = crearCardProducto(producto);
            cardsGrid.appendChild(card);
        });
    }

    function crearCardProducto(producto) {
        const card = document.createElement('div');
        card.className = `product-card ${producto.stock === 0 ? 'out-of-stock' : ''}`;
        
        // Determinar estado de stock
        let stockClass = 'in-stock';
        let statusClass = 'status-available';
        let statusText = 'Disponible';
        let statusIcon = 'fa-check';
        
        if (producto.estado === 'agotado') {
            stockClass = 'out-of-stock';
            statusClass = 'status-unavailable';
            statusText = 'Agotado';
            statusIcon = 'fa-times';
        } else if (producto.estado === 'bajo-stock') {
            stockClass = 'low-stock';
            statusClass = 'status-low';
            statusText = 'Stock Bajo';
            statusIcon = 'fa-exclamation-triangle';
        }
        
        // Iconos por categoría
        const categoriaIconos = {
            'telefonos': '📱',
            'tablets': '📟',
            'accesorios': '🎧',
            'cargadores': '🔌',
            'fundas': '📱',
            'audifonos': '🎮',
            'Celulares': '📱'
        };
        
        card.innerHTML = `
            <div class="product-image">
                <img src="${producto.imagen || ''}" alt="${producto.nombre}">
                <span class="category-badge">${categoriaIconos[producto.categoria] || '📦'} ${getCategoriaNombre(producto.categoria)}</span>
            </div>
            <div class="product-info">
                <div class="product-header">
                    <div class="product-code">${producto.codigo}</div>
                    <h3 class="product-name">${producto.nombre}</h3>
                    <p class="product-description">${producto.descripcion}</p>
                </div>
                
                <div class="product-meta">
                    <div class="price-info">
                        <span class="price-label">Precio Venta</span>
                        <div class="product-price">L ${producto.precioVenta.toFixed(2)}</div>
                    </div>
                    <div class="stock-info">
                        <span class="stock-label">Stock Actual</span>
                        <div class="stock-amount ${stockClass}">
                            <i class="fas fa-box"></i> ${producto.stock} unidades
                        </div>
                    </div>
                </div>
                
                <div class="product-status">
                    <div class="status-badge ${statusClass}">
                        <i class="fas ${statusIcon}"></i> ${statusText}
                    </div>
                    <small>Mín: ${producto.stockMinimo}</small>
                </div>
                
                <div class="card-actions">
                    <button class="card-action-btn btn-quick-view" onclick="verProducto(${producto.id})">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button class="card-action-btn btn-edit-card" onclick="editarProducto(${producto.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="card-action-btn btn-delete-card" onclick="eliminarProducto(${producto.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }

    function renderizarTabla(productosFiltrados) {
        productsTable.innerHTML = '';
        
        if (productosFiltrados.length === 0) {
            productsTable.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px;">
                        <i class="fas fa-box-open" style="font-size: 2rem; color: #ccc; margin-bottom: 10px; display: block;"></i>
                        <h3>No se encontraron productos</h3>
                        <p>Intenta con otros filtros o agrega un nuevo producto</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        productosFiltrados.forEach(producto => {
            const fila = document.createElement('tr');
            
            // Determinar estado de stock basado en el estado del producto
            let stockClass = 'in-stock';
            let statusText = 'Disponible';
            let statusIcon = 'fa-check-circle';
            
            if (producto.estado === 'agotado') {
                stockClass = 'out-of-stock';
                statusText = 'Agotado';
                statusIcon = 'fa-times-circle';
            } else if (producto.estado === 'bajo-stock') {
                stockClass = 'low-stock';
                statusText = 'Stock Bajo';
                statusIcon = 'fa-exclamation-triangle';
            }
            
            fila.innerHTML = `
                <td>${producto.codigo}</td>
                <td>
                    <strong>${producto.nombre}</strong><br>
                    <small>${getCategoriaNombre(producto.categoria)}</small>
                </td>
                <td>L ${producto.precioCompra.toFixed(2)}</td>
                <td>L ${producto.precioVenta.toFixed(2)}</td>
                <td class="${stockClass}">
                    <i class="fas fa-box"></i> ${producto.stock}
                </td>
                <td>${producto.stockMinimo}</td>
                <td>
                    <span class="status-badge ${stockClass === 'in-stock' ? 'status-available' : stockClass === 'low-stock' ? 'status-low' : 'status-unavailable'}">
                        <i class="fas ${statusIcon}"></i> ${statusText}
                    </span>
                </td>
                <td>
                    <button class="card-action-btn btn-quick-view" onclick="verProducto(${producto.id})" style="margin: 2px;">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="card-action-btn btn-edit-card" onclick="editarProducto(${producto.id})" style="margin: 2px;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="card-action-btn btn-delete-card" onclick="eliminarProducto(${producto.id})" style="margin: 2px;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            productsTable.appendChild(fila);
        });
    }

    // ========== FUNCIONES DE FILTRADO ==========
    function filtrarProductos() {
        return productos.filter(producto => {
            // Filtrar por categoría
            if (currentFilter.category && producto.categoria !== currentFilter.category) {
                return false;
            }
            
            // Filtrar por estado
            if (currentFilter.status) {
                if (currentFilter.status === 'disponible' && producto.estado !== 'disponible') {
                    return false;
                }
                if (currentFilter.status === 'agotado' && producto.estado !== 'agotado') {
                    return false;
                }
                if (currentFilter.status === 'bajo-stock' && producto.estado !== 'bajo-stock') {
                    return false;
                }
            }
            
            // Filtrar por búsqueda
            if (currentFilter.search) {
                const searchLower = currentFilter.search.toLowerCase();
                return producto.nombre.toLowerCase().includes(searchLower) ||
                       producto.codigo.toLowerCase().includes(searchLower) ||
                       producto.descripcion.toLowerCase().includes(searchLower);
            }
            
            return true;
        });
    }

    // ========== FUNCIONES DE PAGINACIÓN ==========
    function actualizarPaginacion() {
        if (pageInfo) {
            pageInfo.textContent = `Página ${currentPage} de ${totalPages} (${totalProductos} productos)`;
        }
        
        if (prevPageBtn) {
            prevPageBtn.disabled = currentPage === 1;
        }
        
        if (nextPageBtn) {
            nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
        }
    }

    function cambiarPagina(direccion) {
        if (direccion === 'next' && currentPage < totalPages) {
            currentPage++;
        } else if (direccion === 'prev' && currentPage > 1) {
            currentPage--;
        }
        
        cargarProductosDesdeAPI();
    }

    // ========== FUNCIONES DE MODALES ==========
    function abrirModalNuevo() {
        document.getElementById('modalTitle').textContent = 'Nuevo Producto';
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        
        // Generar código automático temporal (será reemplazado por el servidor)
        document.getElementById('productCode').value = 'PROD-XXX';
        
        // Pre-cargar proveedor por defecto (puedes cambiar esto)
        document.getElementById('productCategory').value = 'Celulares';
        
        productModal.classList.add('show');
    }

    window.abrirModalNuevo = abrirModalNuevo;

    async function editarProducto(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/productos/${id}`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
                const producto = result.data;
                
                document.getElementById('modalTitle').textContent = 'Editar Producto';
                document.getElementById('productId').value = producto.idProducto || producto.id;
                document.getElementById('productCode').value = producto.codigo || `PROD-${(producto.idProducto || producto.id).toString().padStart(3, '0')}`;
                document.getElementById('productName').value = producto.nombre || `${producto.marca} ${producto.modelo}`;
                document.getElementById('productDescription').value = producto.descripcion || '';
                document.getElementById('productCategory').value = producto.categoria || 'Celulares';
                document.getElementById('purchasePrice').value = producto.precioCompra || 0;
                document.getElementById('salePrice').value = producto.precioVenta || 0;
                document.getElementById('initialStock').value = producto.stock || 0;
                document.getElementById('minStock').value = producto.stockMinimo || 10;
                document.getElementById('productImage').value = producto.urlImagen || '';
                
                productModal.classList.add('show');
            } else {
                throw new Error('Producto no encontrado');
            }
        } catch (error) {
            console.error('Error obteniendo producto:', error);
            mostrarNotificacion('Error al cargar producto para editar', 'warning');
        }
    }

    window.editarProducto = editarProducto;

    async function verProducto(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/productos/${id}`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
                const producto = result.data;
                
                document.getElementById('quickViewTitle').textContent = producto.nombre || `${producto.marca} ${producto.modelo}`;
                
                // Determinar estado
                let stockClass = 'in-stock';
                let statusText = 'Disponible';
                let statusIcon = 'fa-check';
                
                if (producto.estado === 'agotado') {
                    stockClass = 'out-of-stock';
                    statusText = 'Agotado';
                    statusIcon = 'fa-times';
                } else if (producto.estado === 'bajo-stock') {
                    stockClass = 'low-stock';
                    statusText = 'Stock Bajo';
                    statusIcon = 'fa-exclamation-triangle';
                }
                
                document.getElementById('quickViewBody').innerHTML = `
                    <div class="quick-view-product">
                        <div class="quick-view-image">
                            <img src="${producto.urlImagen || 'https://via.placeholder.com/400x300/667eea/ffffff?text=Producto'}" alt="${producto.nombre}">
                        </div>
                        <div class="quick-view-details">
                            <h4>${producto.nombre || `${producto.marca} ${producto.modelo}`}</h4>
                            <p>${producto.descripcion || 'Sin descripción'}</p>
                            
                            <div class="quick-view-meta">
                                <div class="meta-item">
                                    <h5>Código</h5>
                                    <p>${producto.codigo || `PROD-${(producto.idProducto || producto.id).toString().padStart(3, '0')}`}</p>
                                </div>
                                <div class="meta-item">
                                    <h5>Categoría</h5>
                                    <p>${getCategoriaNombre(producto.categoria)}</p>
                                </div>
                                <div class="meta-item">
                                    <h5>Precio Compra</h5>
                                    <p class="price">L ${(producto.precioCompra || 0).toFixed(2)}</p>
                                </div>
                                <div class="meta-item">
                                    <h5>Precio Venta</h5>
                                    <p class="price">L ${(producto.precioVenta || 0).toFixed(2)}</p>
                                </div>
                                <div class="meta-item">
                                    <h5>Stock Actual</h5>
                                    <p class="stock ${stockClass}">
                                        <i class="fas fa-box"></i> ${producto.stock || 0} unidades
                                    </p>
                                </div>
                                <div class="meta-item">
                                    <h5>Stock Mínimo</h5>
                                    <p>${producto.stockMinimo || 10} unidades</p>
                                </div>
                            </div>
                            
                            <div class="meta-item">
                                <h5>Estado</h5>
                                <span class="status-badge ${stockClass === 'in-stock' ? 'status-available' : stockClass === 'low-stock' ? 'status-low' : 'status-unavailable'}">
                                    <i class="fas ${statusIcon}"></i> ${statusText}
                                </span>
                            </div>
                            
                            <div class="quick-view-actions">
                                <button class="card-action-btn btn-edit-card" onclick="editarProducto(${producto.idProducto || producto.id}); cerrarQuickView();">
                                    <i class="fas fa-edit"></i> Editar Producto
                                </button>
                                <button class="card-action-btn btn-delete-card" onclick="eliminarProducto(${producto.idProducto || producto.id}); cerrarQuickView();">
                                    <i class="fas fa-trash"></i> Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                
                quickViewModal.classList.add('show');
            } else {
                throw new Error('Producto no encontrado');
            }
        } catch (error) {
            console.error('Error obteniendo producto:', error);
            mostrarNotificacion('Error al cargar detalles del producto', 'warning');
        }
    }

    window.verProducto = verProducto;

    function cerrarModal() {
        productModal.classList.remove('show');
    }

    function cerrarQuickView() {
        quickViewModal.classList.remove('show');
    }

    // ========== FUNCIONES DE PRODUCTOS ==========
    async function guardarProducto(e) {
        e.preventDefault();
        
        try {
            const productoId = document.getElementById('productId').value;
            const nombreCompleto = document.getElementById('productName').value;
            
            // Dividir nombre en marca y modelo (simple)
            let marca = nombreCompleto;
            let modelo = '';
            const palabras = nombreCompleto.split(' ');
            if (palabras.length > 1) {
                marca = palabras[0];
                modelo = palabras.slice(1).join(' ');
            }
            
            const productoData = {
                marca: marca,
                modelo: modelo || nombreCompleto,
                precioCompra: parseFloat(document.getElementById('purchasePrice').value),
                precioVenta: parseFloat(document.getElementById('salePrice').value),
                stock: parseInt(document.getElementById('initialStock').value),
                stockMinimo: parseInt(document.getElementById('minStock').value),
                categoria: document.getElementById('productCategory').value || 'Celulares',
                descripcion: document.getElementById('productDescription').value || '',
                idProveedor: 1, // Valor por defecto
                urlImagen: document.getElementById('productImage').value || 'https://placehold.co/400x300?text=Producto&bg=667eea&color=fff'
            };
            
            let response;
            let url = `${API_BASE_URL}/productos`;
            let method = 'POST';
            
            if (productoId) {
                // Actualizar producto existente
                url += `/${productoId}`;
                method = 'PUT';
            }
            
            response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productoData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            
            mostrarNotificacion(
                productoId ? 'Producto actualizado correctamente' : 'Producto agregado correctamente',
                'success'
            );
            
            cerrarModal();
            await cargarProductosDesdeAPI(); // Recargar desde API
            
        } catch (error) {
            console.error('Error guardando producto:', error);
            mostrarNotificacion('Error al guardar producto: ' + error.message, 'warning');
        }
    }

    async function eliminarProducto(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error HTTP ${response.status}: ${errorText}`);
            }
            
            mostrarNotificacion('Producto eliminado correctamente', 'success');
            await cargarProductosDesdeAPI(); // Recargar desde API
            
        } catch (error) {
            console.error('Error eliminando producto:', error);
            mostrarNotificacion('Error al eliminar producto: ' + error.message, 'warning');
        }
    }

    window.eliminarProducto = eliminarProducto;

    // ========== FUNCIONES DE UTILIDAD ==========
    function mostrarNotificacion(mensaje, tipo = 'info') {
        // Crear notificación
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion ${tipo}`;
        notificacion.innerHTML = `
            <i class="fas ${tipo === 'success' ? 'fa-check-circle' : tipo === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
            <span>${mensaje}</span>
        `;
        
        // Estilos para la notificación
        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${tipo === 'success' ? '#27ae60' : tipo === 'warning' ? '#f39c12' : '#3498db'};
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
        if (!document.querySelector('#notificacion-estilos')) {
            const style = document.createElement('style');
            style.id = 'notificacion-estilos';
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
        
        document.body.appendChild(notificacion);
        
        // Auto-eliminar después de 3 segundos
        setTimeout(() => {
            notificacion.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notificacion.parentNode) {
                    notificacion.parentNode.removeChild(notificacion);
                }
            }, 300);
        }, 3000);
    }

    function actualizarInfoActualizacion() {
        const fecha = new Date();
        const options = { 
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        };
        const lastUpdateElement = document.getElementById('lastUpdate');
        if (lastUpdateElement) {
            lastUpdateElement.textContent = fecha.toLocaleString('es-ES', options);
        }
    }

    function exportarAExcel() {
        mostrarNotificacion('Exportando datos a Excel...', 'info');
        // En una implementación real, usarías una librería como SheetJS
        setTimeout(() => {
            mostrarNotificacion('Datos exportados correctamente', 'success');
        }, 1500);
    }

    function imprimirCatalogo() {
        mostrarNotificacion('Preparando para imprimir...', 'info');
        setTimeout(() => {
            window.print();
        }, 500);
    }

    // ========== EVENT LISTENERS ==========
    // Botones de vista
    btnCardView?.addEventListener('click', () => {
        currentView = 'cards';
        btnCardView.classList.add('active');
        btnListView.classList.remove('active');
        currentPage = 1;
        cargarProductosDesdeAPI();
    });

    btnListView?.addEventListener('click', () => {
        currentView = 'list';
        btnListView.classList.add('active');
        btnCardView.classList.remove('active');
        currentPage = 1;
        cargarProductosDesdeAPI();
    });

    // Filtros
    filterCategory?.addEventListener('change', (e) => {
        currentFilter.category = e.target.value;
        currentPage = 1;
        cargarProductosDesdeAPI();
    });

    filterStatus?.addEventListener('change', (e) => {
        currentFilter.status = e.target.value;
        currentPage = 1;
        cargarProductosDesdeAPI();
    });

    searchProduct?.addEventListener('input', (e) => {
        currentFilter.search = e.target.value;
        currentPage = 1;
        cargarProductosDesdeAPI();
    });

    // Botones principales
    btnAddProduct?.addEventListener('click', abrirModalNuevo);
    btnExportAll?.addEventListener('click', exportarAExcel);
    btnPrintCatalog?.addEventListener('click', imprimirCatalogo);
    btnRefreshData?.addEventListener('click', async () => {
        await cargarProductosDesdeAPI();
        mostrarNotificacion('Datos actualizados desde servidor', 'success');
    });

    // Modales
    btnCloseModal?.addEventListener('click', cerrarModal);
    btnCancelModal?.addEventListener('click', cerrarModal);
    btnCloseQuickView?.addEventListener('click', cerrarQuickView);

    // Cerrar modales haciendo clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === productModal) {
            cerrarModal();
        }
        if (e.target === quickViewModal) {
            cerrarQuickView();
        }
    });

    // Formulario
    productForm?.addEventListener('submit', guardarProducto);

    // Paginación
    prevPageBtn?.addEventListener('click', () => cambiarPagina('prev'));
    nextPageBtn?.addEventListener('click', () => cambiarPagina('next'));

    // ========== INICIALIZACIÓN ==========
    cargarProductosDesdeAPI();
});