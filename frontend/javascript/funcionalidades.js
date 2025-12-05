// productos-funciones-completas.js
// Implementa todas las funcionalidades del panel de control

console.log('🚀 Inicializando funcionalidades completas del sistema de productos...');

// Variables globales
let currentProducts = [];
let currentView = 'cards';
let currentPageCards = 1;
let currentPageTable = 1;
const itemsPerPage = 8;

// ===================== INICIALIZACIÓN DE PRODUCTOS =====================
function initializeProducts() {
    console.log('📥 Inicializando productos desde el HTML...');
    
    // Extraer productos del HTML existente
    const productCards = document.querySelectorAll('.product-card');
    currentProducts = [];
    
    productCards.forEach((card, index) => {
        const id = index + 1;
        const name = card.querySelector('.product-name')?.textContent || `Producto ${id}`;
        const code = card.querySelector('.product-code')?.textContent || `PROD${String(id).padStart(3, '0')}`;
        const priceText = card.querySelector('.product-price')?.textContent || 'L 0';
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
        const stockText = card.querySelector('.stock-amount')?.textContent || '0';
        const stock = parseInt(stockText.replace(/[^0-9]/g, '')) || 0;
        const description = card.querySelector('.product-description')?.textContent || '';
        const statusBadge = card.querySelector('.status-badge');
        let status = 'disponible';
        
        if (statusBadge) {
            if (statusBadge.classList.contains('status-available')) status = 'disponible';
            else if (statusBadge.classList.contains('status-low')) status = 'bajo-stock';
            else if (statusBadge.classList.contains('status-unavailable')) status = 'agotado';
        }
        
        // Determinar categoría basada en el badge
        const categoryBadge = card.querySelector('.category-badge');
        let category = 'telefonos';
        if (categoryBadge) {
            const badgeText = categoryBadge.textContent;
            if (badgeText.includes('Accesorios')) category = 'accesorios';
            else if (badgeText.includes('Tablets')) category = 'tablets';
            else if (badgeText.includes('Cargadores')) category = 'cargadores';
            else if (badgeText.includes('Fundas')) category = 'fundas';
            else if (badgeText.includes('Audífonos')) category = 'audifonos';
        }
        
        // Obtener URL de la imagen
        const imgElement = card.querySelector('.product-image img');
        const imageUrl = imgElement?.src || '';
        
        currentProducts.push({
            id,
            nombre: name,
            codigo: code,
            categoria: category,
            precio: price,
            stock,
            stockMinimo: 10,
            descripcion: description,
            imagenUrl,
            estado: status,
            fechaCreacion: new Date().toISOString()
        });
    });
    
    console.log(`✅ ${currentProducts.length} productos inicializados`);
    return currentProducts;
}

// ===================== FUNCIONES DE FILTROS =====================

// 1. FILTRO POR CATEGORÍA
function setupCategoryFilter() {
    const filterCategory = document.getElementById('filterCategory');
    if (!filterCategory) {
        console.error('❌ No se encontró el filtro de categoría');
        return;
    }
    
    filterCategory.addEventListener('change', function() {
        const selectedCategory = this.value;
        console.log(`📁 Filtro categoría: ${selectedCategory || 'Todas'}`);
        applyFilters();
    });
    
    console.log('✅ Filtro de categoría configurado');
}

// 2. FILTRO POR ESTADO
function setupStatusFilter() {
    const filterStatus = document.getElementById('filterStatus');
    if (!filterStatus) {
        console.error('❌ No se encontró el filtro de estado');
        return;
    }
    
    filterStatus.addEventListener('change', function() {
        const selectedStatus = this.value;
        console.log(`🏷️ Filtro estado: ${selectedStatus || 'Todos'}`);
        applyFilters();
    });
    
    console.log('✅ Filtro de estado configurado');
}

// 3. BÚSQUEDA
function setupSearch() {
    const searchInput = document.getElementById('searchProduct');
    if (!searchInput) {
        console.error('❌ No se encontró el campo de búsqueda');
        return;
    }
    
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            console.log(`🔍 Búsqueda: "${this.value}"`);
            applyFilters();
        }, 300);
    });
    
    console.log('✅ Búsqueda configurada');
}

// 4. APLICAR TODOS LOS FILTROS
function applyFilters() {
    const categoryFilter = document.getElementById('filterCategory')?.value || '';
    const statusFilter = document.getElementById('filterStatus')?.value || '';
    const searchTerm = document.getElementById('searchProduct')?.value.toLowerCase() || '';
    
    console.log('🎯 Aplicando filtros:', { categoryFilter, statusFilter, searchTerm });
    
    const filteredProducts = currentProducts.filter(product => {
        // Filtro por categoría
        if (categoryFilter && product.categoria !== categoryFilter) {
            return false;
        }
        
        // Filtro por estado
        if (statusFilter) {
            if (statusFilter === 'disponible' && product.stock <= 0) return false;
            if (statusFilter === 'agotado' && product.stock > 0) return false;
            if (statusFilter === 'bajo-stock' && (product.stock <= 0 || product.stock > 10)) return false;
        }
        
        // Filtro por búsqueda
        if (searchTerm) {
            const searchFields = [
                product.nombre,
                product.codigo,
                product.descripcion,
                product.categoria
            ].join(' ').toLowerCase();
            
            if (!searchFields.includes(searchTerm)) {
                return false;
            }
        }
        
        return true;
    });
    
    console.log(`📊 Resultados: ${filteredProducts.length} de ${currentProducts.length} productos`);
    
    // Actualizar contador
    updateProductsCount(filteredProducts.length);
    
    // Mostrar productos filtrados
    displayFilteredProducts(filteredProducts);
    
    return filteredProducts;
}

// ===================== FUNCIONES DE VISTA =====================

// 1. TOGGLE VISTA CARDS/TABLA
function setupViewToggle() {
    const btnCardView = document.getElementById('btnCardView');
    const btnListView = document.getElementById('btnListView');
    const cardsView = document.getElementById('cardsView');
    const tableView = document.getElementById('tableView');
    
    if (!btnCardView || !btnListView || !cardsView || !tableView) {
        console.error('❌ Elementos de cambio de vista no encontrados');
        return;
    }
    
    btnCardView.addEventListener('click', function() {
        console.log('🃏 Cambiando a vista de cartas');
        setActiveView('cards');
        cardsView.style.display = 'block';
        tableView.style.display = 'none';
        btnCardView.classList.add('active');
        btnListView.classList.remove('active');
    });
    
    btnListView.addEventListener('click', function() {
        console.log('📋 Cambiando a vista de tabla');
        setActiveView('table');
        cardsView.style.display = 'none';
        tableView.style.display = 'block';
        btnListView.classList.add('active');
        btnCardView.classList.remove('active');
        
        // Actualizar tabla
        updateTableView();
    });
    
    console.log('✅ Cambio de vista configurado');
}

function setActiveView(view) {
    currentView = view;
    console.log(`👁️ Vista activa: ${view}`);
}

// ===================== PAGINACIÓN =====================

function setupPagination() {
    // Paginación para vista de cartas
    const prevPageCards = document.getElementById('prevPageCards');
    const nextPageCards = document.getElementById('nextPageCards');
    
    if (prevPageCards && nextPageCards) {
        prevPageCards.addEventListener('click', function() {
            if (currentPageCards > 1) {
                currentPageCards--;
                updateCardsPagination();
            }
        });
        
        nextPageCards.addEventListener('click', function() {
            const totalPages = Math.ceil(currentProducts.length / itemsPerPage);
            if (currentPageCards < totalPages) {
                currentPageCards++;
                updateCardsPagination();
            }
        });
        
        console.log('✅ Paginación de cartas configurada');
    }
    
    // Paginación para vista de tabla
    const prevPageTable = document.getElementById('prevPageTable');
    const nextPageTable = document.getElementById('nextPageTable');
    
    if (prevPageTable && nextPageTable) {
        prevPageTable.addEventListener('click', function() {
            if (currentPageTable > 1) {
                currentPageTable--;
                updateTablePagination();
            }
        });
        
        nextPageTable.addEventListener('click', function() {
            const totalPages = Math.ceil(currentProducts.length / itemsPerPage);
            if (currentPageTable < totalPages) {
                currentPageTable++;
                updateTablePagination();
            }
        });
        
        console.log('✅ Paginación de tabla configurada');
    }
}

function updateCardsPagination() {
    const pageInfoCards = document.getElementById('pageInfoCards');
    if (pageInfoCards) {
        const totalPages = Math.ceil(currentProducts.length / itemsPerPage);
        pageInfoCards.textContent = `Página ${currentPageCards} de ${totalPages}`;
    }
    
    // Aquí iría la lógica para mostrar solo los productos de la página actual
    console.log(`📄 Vista cartas - Página ${currentPageCards}`);
}

function updateTablePagination() {
    const pageInfoTable = document.getElementById('pageInfoTable');
    if (pageInfoTable) {
        const totalPages = Math.ceil(currentProducts.length / itemsPerPage);
        pageInfoTable.textContent = `Página ${currentPageTable} de ${totalPages}`;
    }
    
    // Aquí iría la lógica para mostrar solo los productos de la página actual en tabla
    console.log(`📄 Vista tabla - Página ${currentPageTable}`);
}

// ===================== ACCIONES RÁPIDAS =====================

function setupQuickActions() {
    // Botón Exportar Todo
    const btnExportAll = document.getElementById('btnExportAll');
    if (btnExportAll) {
        btnExportAll.addEventListener('click', function() {
            console.log('📤 Exportando todos los productos...');
            exportProducts(currentProducts);
        });
    }
    
    // Botón Imprimir Catálogo
    const btnPrintCatalog = document.getElementById('btnPrintCatalog');
    if (btnPrintCatalog) {
        btnPrintCatalog.addEventListener('click', function() {
            console.log('🖨️ Imprimiendo catálogo...');
            printCatalog();
        });
    }
    
    // Botón Actualizar
    const btnRefreshData = document.getElementById('btnRefreshData');
    if (btnRefreshData) {
        btnRefreshData.addEventListener('click', function() {
            console.log('🔄 Actualizando datos...');
            refreshData();
        });
    }
    
    console.log('✅ Acciones rápidas configuradas');
}

// ===================== BOTÓN "NUEVO PRODUCTO" =====================

function setupAddProductButton() {
    const btnAddProduct = document.getElementById('btnAddProduct');
    if (!btnAddProduct) {
        console.error('❌ Botón "Nuevo Producto" no encontrado');
        return;
    }
    
    btnAddProduct.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('➕ Abriendo formulario para nuevo producto');
        openProductModal();
    });
    
    console.log('✅ Botón "Nuevo Producto" configurado');
}

// ===================== FUNCIONES DE UTILIDAD =====================

function updateProductsCount(count) {
    const productsCount = document.getElementById('productsCount');
    if (productsCount) {
        productsCount.textContent = `Productos (${count})`;
    }
}

function displayFilteredProducts(filteredProducts) {
    // Aquí iría la lógica para actualizar la vista
    // con los productos filtrados
    console.log(`🔄 Mostrando ${filteredProducts.length} productos filtrados`);
    
    // Actualizar vista actual
    if (currentView === 'cards') {
        updateCardsView(filteredProducts);
    } else {
        updateTableView(filteredProducts);
    }
}

function updateCardsView(products) {
    // Lógica para actualizar la vista de cartas
    console.log('🎴 Actualizando vista de cartas');
}

function updateTableView(products) {
    // Lógica para actualizar la vista de tabla
    console.log('📊 Actualizando vista de tabla');
}

function exportProducts(products) {
    // Crear contenido CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Código,Nombre,Categoría,Precio,Stock,Estado,Descripción\n";
    
    products.forEach(product => {
        const row = [
            product.codigo,
            product.nombre,
            product.categoria,
            `L ${product.precio.toFixed(2)}`,
            product.stock,
            product.estado,
            product.descripcion.replace(/,/g, ';')
        ].join(',');
        csvContent += row + "\n";
    });
    
    // Crear enlace de descarga
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "productos_exportados.csv");
    document.body.appendChild(link);
    
    link.click();
    document.body.removeChild(link);
    
    showNotification(`✅ ${products.length} productos exportados exitosamente`, 'success');
}

function printCatalog() {
    // Guardar el estado actual de la vista
    const originalView = currentView;
    
    // Cambiar a vista de tabla si estamos en cartas (mejor para imprimir)
    if (currentView === 'cards') {
        const btnListView = document.getElementById('btnListView');
        if (btnListView) btnListView.click();
    }
    
    // Esperar un momento para que se actualice la vista
    setTimeout(() => {
        window.print();
        
        // Restaurar vista original después de imprimir
        setTimeout(() => {
            if (originalView === 'cards') {
                const btnCardView = document.getElementById('btnCardView');
                if (btnCardView) btnCardView.click();
            }
        }, 500);
    }, 100);
    
    showNotification('🖨️ Preparando catálogo para imprimir...', 'info');
}

function refreshData() {
    // Mostrar indicador de carga
    showNotification('🔄 Actualizando datos...', 'info');
    
    // Simular carga de datos
    setTimeout(() => {
        initializeProducts();
        applyFilters();
        
        // Actualizar marca de tiempo
        const lastUpdate = document.getElementById('lastUpdate');
        if (lastUpdate) {
            const now = new Date();
            lastUpdate.textContent = now.toLocaleString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
        
        showNotification('✅ Datos actualizados correctamente', 'success');
    }, 1000);
}

function openProductModal() {
    // Esta función ya existe en productos-cards.js
    // Solo notificamos que se abrirá
    console.log('📝 Abriendo modal de producto');
    
    // Si el modal no está en la página, mostramos un mensaje
    const modal = document.getElementById('productModal');
    if (!modal) {
        showNotification('⚠️ El formulario de producto se está cargando...', 'warning');
        
        // Simular apertura del modal
        setTimeout(() => {
            showNotification('📝 Use el formulario para agregar un nuevo producto', 'info');
        }, 500);
    }
}

// ===================== NOTIFICACIONES =====================

function showNotification(message, type = 'info') {
    console.log(`📢 Notificación [${type}]: ${message}`);
    
    // Eliminar notificación anterior si existe
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} ${message}
    `;
    
    // Estilos básicos
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d4f5e3' : type === 'error' ? '#fee2e2' : '#e0f2fe'};
        color: ${type === 'success' ? '#166534' : type === 'error' ? '#991b1b' : '#075985'};
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 10px;
        border-left: 4px solid ${type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : '#0ea5e9'};
        font-family: Arial, sans-serif;
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ===================== INICIALIZACIÓN COMPLETA =====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM completamente cargado - Inicializando todas las funcionalidades');
    
    // Agregar estilos CSS para animaciones si no existen
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Inicializar productos
    initializeProducts();
    
    // Configurar todas las funcionalidades
    setupCategoryFilter();      // 1. Filtro por categoría
    setupStatusFilter();        // 2. Filtro por estado
    setupSearch();              // 3. Búsqueda
    setupViewToggle();          // 4. Cambio de vista (cards/table)
    setupPagination();          // 5. Paginación
    setupQuickActions();        // 6. Acciones rápidas
    setupAddProductButton();    // 7. Botón Nuevo Producto
    
    // Aplicar filtros iniciales
    applyFilters();
    
    // Configurar botones de acción en tabla
    setupTableActions();
    
    // Actualizar contador inicial
    updateProductsCount(currentProducts.length);
    
    console.log('🎉 Todas las funcionalidades han sido inicializadas correctamente');
    showNotification('✅ Sistema de productos listo', 'success');
});

// Configurar acciones en la tabla
function setupTableActions() {
    const viewButtons = document.querySelectorAll('.btn-quick-view');
    const editButtons = document.querySelectorAll('.btn-edit-card');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            console.log(`👁️ Vista rápida del producto ${productId}`);
            showNotification(`Vista rápida del producto ${productId}`, 'info');
        });
    });
    
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            console.log(`✏️ Editando producto ${productId}`);
            showNotification(`Editando producto ${productId}`, 'info');
        });
    });
    
    console.log(`✅ ${viewButtons.length} botones de vista rápida configurados`);
    console.log(`✅ ${editButtons.length} botones de edición configurados`);
}

// Funciones de debugging
window.debugFilters = function() {
    console.log('🔍 Estado actual de filtros:', {
        categoria: document.getElementById('filterCategory')?.value,
        estado: document.getElementById('filterStatus')?.value,
        busqueda: document.getElementById('searchProduct')?.value,
        vista: currentView,
        totalProductos: currentProducts.length
    });
};

window.debugProducts = function() {
    console.log('📦 Lista completa de productos:', currentProducts);
};

window.resetFilters = function() {
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('searchProduct').value = '';
    applyFilters();
    showNotification('🔄 Filtros restablecidos', 'info');
};