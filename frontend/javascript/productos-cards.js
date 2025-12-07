// productos-cards.js - VERSIÓN SIMPLIFICADA Y CORREGIDA
console.log('📦 Inicializando sistema de productos...');

// Variables globales
let currentProducts = [];
let currentView = 'cards';

// ===================== FUNCIÓN AGREGAR PRODUCTO (CORREGIDA) =====================
function addProduct() {
    console.log('➕ Botón "Agregar Producto" clickeado');
    
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const productForm = document.getElementById('productForm');
    
    console.log('🔍 Buscando elementos del modal:', {
        modal: !!modal,
        modalTitle: !!modalTitle,
        productForm: !!productForm
    });
    
    if (modal && modalTitle && productForm) {
        console.log('✅ Elementos del modal encontrados');
        
        // Configurar modal para nuevo producto
        modalTitle.textContent = 'Nuevo Producto';
        
        // Limpiar formulario
        productForm.reset();
        document.getElementById('productId').value = '';
        
        // Generar código automático
        const productCount = currentProducts.length + 1;
        const newCode = `PROD${String(productCount).padStart(3, '0')}`;
        document.getElementById('productCode').value = newCode;
        
        console.log(`📝 Código generado: ${newCode}`);
        
        // Setear valores por defecto
        document.getElementById('initialStock').value = 10;
        document.getElementById('minStock').value = 5;
        document.getElementById('purchasePrice').value = 0;
        document.getElementById('salePrice').value = 0;
        document.getElementById('productStatus').value = 'activo';
        
        // Mostrar modal
        console.log('🪟 Mostrando modal...');
        modal.classList.add('show');
        modal.style.display = 'flex'; // Asegurar que se muestre
        
        showNotification('➕ Formulario para nuevo producto abierto', 'info');
    } else {
        console.error('❌ ERROR: No se encontraron elementos del modal');
        showNotification('❌ Error: No se pudo abrir el formulario', 'error');
        
        // Debug: mostrar qué elementos no se encontraron
        if (!modal) console.error('❌ No se encontró el elemento #productModal');
        if (!modalTitle) console.error('❌ No se encontró el elemento #modalTitle');
        if (!productForm) console.error('❌ No se encontró el elemento #productForm');
    }
}

// ===================== FUNCIÓN CERRAR MODAL =====================
function closeModal(modalId = 'productModal') {
    console.log(`❌ Cerrando modal: ${modalId}`);
    
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

// ===================== FUNCIÓN GUARDAR PRODUCTO =====================
function setupFormSubmit() {
    console.log('⚙️ Configurando formulario de producto...');
    
    const productForm = document.getElementById('productForm');
    
    if (productForm) {
        console.log('✅ Formulario encontrado');
        
        // Remover event listeners anteriores para evitar duplicados
        const newForm = productForm.cloneNode(true);
        productForm.parentNode.replaceChild(newForm, productForm);
        
        // Agregar event listener al nuevo formulario
        newForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('📝 Formulario enviado');
            
            const productId = document.getElementById('productId').value;
            const isEditing = !!productId;
            
            // Obtener valores del formulario
            const productData = {
                id: productId || Date.now(),
                nombre: document.getElementById('productName').value,
                codigo: document.getElementById('productCode').value,
                categoria: document.getElementById('productCategory').value,
                precioCompra: parseFloat(document.getElementById('purchasePrice').value) || 0,
                precioVenta: parseFloat(document.getElementById('salePrice').value) || 0,
                precio: parseFloat(document.getElementById('salePrice').value) || 0,
                stock: parseInt(document.getElementById('initialStock').value) || 0,
                stockMinimo: parseInt(document.getElementById('minStock').value) || 10,
                descripcion: document.getElementById('productDescription').value,
                imagenUrl: document.getElementById('productImage').value,
                estado: document.getElementById('productStatus').value,
                marca: document.getElementById('productName').value.split(' ')[0] || '',
                fechaCreacion: new Date().toISOString()
            };
            
            console.log('📊 Datos del producto:', productData);
            
            if (isEditing) {
                // Actualizar producto existente
                const index = currentProducts.findIndex(p => p.id == productId);
                if (index !== -1) {
                    currentProducts[index] = { ...currentProducts[index], ...productData };
                    showNotification(`✅ Producto actualizado: ${productData.nombre}`, 'success');
                }
            } else {
                // Agregar nuevo producto
                currentProducts.push(productData);
                showNotification(`✅ Producto agregado: ${productData.nombre}`, 'success');
            }
            
            // Cerrar modal
            closeModal('productModal');
            
            // Recargar vista (para simplificar, solo mostramos en consola)
            console.log(`📦 Total de productos: ${currentProducts.length}`);
            console.log('📋 Lista de productos:', currentProducts);
            
            // Aquí deberías recargar la vista de productos
            // loadProductsView();
        });
        
        console.log('✅ Event listener del formulario configurado');
    } else {
        console.error('❌ No se encontró el formulario #productForm');
    }
}

// ===================== FUNCIÓN PARA NOTIFICACIONES =====================
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
    
    // Estilos básicos para la notificación
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

// ===================== INICIALIZACIÓN =====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM completamente cargado');
    
    // Agregar estilos CSS para animaciones
    const style = document.createElement('style');
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
        
        /* Estilos para el modal si no están en el CSS */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            align-items: center;
            justify-content: center;
        }
        
        .modal.show {
            display: flex !important;
        }
        
        .modal-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
        }
    `;
    document.head.appendChild(style);
    
    // Configurar botón "Agregar Producto"
    const btnAddProduct = document.getElementById('btnAddProduct');
    console.log('🔍 Buscando botón "Agregar Producto":', !!btnAddProduct);
    
    if (btnAddProduct) {
        console.log('✅ Botón "Agregar Producto" encontrado');
        
        // Remover event listeners anteriores
        const newBtn = btnAddProduct.cloneNode(true);
        btnAddProduct.parentNode.replaceChild(newBtn, btnAddProduct);
        
        // Agregar event listener CORREGIDO
        newBtn.addEventListener('click', function(e) {
            console.log('🖱️ Click en botón "Agregar Producto" detectado');
            e.preventDefault();
            e.stopPropagation();
            addProduct();
        });
        
        // También agregar como función global para debugging
        window.debugAddProduct = addProduct;
        console.log('✅ Función addProduct disponible globalmente como window.debugAddProduct');
        
        // Probar inmediatamente
        console.log('🧪 Probando funcionalidad del botón...');
        console.log('👉 Intenta hacer clic en "Agregar Producto" o ejecuta en consola: debugAddProduct()');
        
    } else {
        console.error('❌ ERROR: No se encontró el botón #btnAddProduct');
        console.log('🔎 Revisa que en tu HTML exista: <button id="btnAddProduct">');
    }
    
    // Configurar formulario
    setupFormSubmit();
    
    // Configurar botones de cerrar modal
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnCancelModal = document.getElementById('btnCancelModal');
    
    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal('productModal');
        });
    }
    
    if (btnCancelModal) {
        btnCancelModal.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal('productModal');
        });
    }
    
    // Cerrar modal al hacer clic fuera
    const productModal = document.getElementById('productModal');
    if (productModal) {
        productModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal('productModal');
            }
        });
    }
    
    // Cargar productos iniciales (simplificado)
    function loadInitialProducts() {
        console.log('📥 Cargando productos iniciales...');
        // Para simplificar, usamos un array vacío
        currentProducts = [];
        console.log(`✅ ${currentProducts.length} productos cargados`);
    }
    
    loadInitialProducts();
    
    // Mensaje final
    console.log('🎉 Sistema de productos inicializado correctamente');
    console.log('🔧 Para debugging, abre la consola (F12) y verifica:');
    console.log('   1. Que no haya errores en rojo');
    console.log('   2. Que el botón tenga el evento click');
    console.log('   3. Que el modal exista en el DOM');
    
    // Forzar visibilidad del botón para debugging
    if (btnAddProduct) {
        btnAddProduct.style.border = '2px solid #4CAF50';
        btnAddProduct.style.backgroundColor = '#4CAF50';
        btnAddProduct.style.color = 'white';
        btnAddProduct.title = '¡Haz clic aquí para agregar producto!';
    }
});

// Función auxiliar para debugging desde la consola
window.debugModal = function() {
    const modal = document.getElementById('productModal');
    if (modal) {
        console.log('🔍 Estado del modal:', {
            exists: true,
            display: modal.style.display,
            classList: modal.classList,
            computedStyle: window.getComputedStyle(modal).display
        });
        
        // Mostrar modal para debugging
        modal.classList.add('show');
        modal.style.display = 'flex';
        
        // Crear un overlay rojo para debugging
        const debugOverlay = document.createElement('div');
        debugOverlay.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,0,0,0.1); z-index: 9999; pointer-events: none;">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.3); pointer-events: auto;">
                    <h3 style="color: red;">🔴 DEBUG MODAL</h3>
                    <p>Modal encontrado y forzado a mostrar</p>
                    <button onclick="this.parentNode.parentNode.remove()" style="padding: 10px 20px; background: red; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Cerrar Debug
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(debugOverlay);
    } else {
        console.error('❌ Modal no encontrado');
    }
};