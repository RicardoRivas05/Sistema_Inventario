// inventario.js
// Datos de ejemplo para la tabla
const sampleProducts = [
    {
        id: 1,
        name: "iPhone 13 Pro",
        category: "Teléfonos",
        stock: 15,
        minStock: 10,
        price: 999.99,
        status: "in-stock"
    },
    {
        id: 2,
        name: "Samsung Galaxy S22",
        category: "Teléfonos",
        stock: 8,
        minStock: 10,
        price: 899.99,
        status: "low-stock"
    },
    {
        id: 3,
        name: "AirPods Pro",
        category: "Accesorios",
        stock: 25,
        minStock: 15,
        price: 249.99,
        status: "in-stock"
    },
    {
        id: 4,
        name: "iPad Air",
        category: "Tablets",
        stock: 5,
        minStock: 8,
        price: 599.99,
        status: "low-stock"
    },
    {
        id: 5,
        name: "Cargador USB-C 65W",
        category: "Cargadores",
        stock: 0,
        minStock: 20,
        price: 39.99,
        status: "out-of-stock"
    },
    {
        id: 6,
        name: "Funda iPhone 14",
        category: "Fundas",
        stock: 30,
        minStock: 25,
        price: 29.99,
        status: "in-stock"
    },
    {
        id: 7,
        name: "Google Pixel 7",
        category: "Teléfonos",
        stock: 12,
        minStock: 10,
        price: 699.99,
        status: "in-stock"
    },
    {
        id: 8,
        name: "Cable Lightning",
        category: "Accesorios",
        stock: 7,
        minStock: 15,
        price: 19.99,
        status: "low-stock"
    },
    {
        id: 9,
        name: "Smartwatch Galaxy 5",
        category: "Accesorios",
        stock: 3,
        minStock: 5,
        price: 299.99,
        status: "low-stock"
    },
    {
        id: 10,
        name: "Tablet Samsung S7",
        category: "Tablets",
        stock: 18,
        minStock: 12,
        price: 449.99,
        status: "in-stock"
    }
];

// Variables globales
let currentProducts = [...sampleProducts];

// Función para formatear fecha
function formatDate(date = new Date()) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('es-ES', options);
}

// Función para cargar productos en la tabla
function loadProducts(products) {
    const tableBody = document.getElementById('productsTableBody');
    const totalProducts = document.getElementById('totalProducts');
    const lowStock = document.getElementById('lowStock');
    const totalValue = document.getElementById('totalValue');
    const outOfStock = document.getElementById('outOfStock');
    const productsCount = document.getElementById('productsCount');
    const lastUpdate = document.getElementById('lastUpdate');
    
    tableBody.innerHTML = '';
    
    let totalValueSum = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    
    products.forEach(product => {
        const value = product.stock * product.price;
        totalValueSum += value;
        
        if (product.stock === 0) outOfStockCount++;
        if (product.stock < product.minStock && product.stock > 0) lowStockCount++;
        
        const row = document.createElement('tr');
        
        // Determinar clase de estado
        let statusClass = 'status-in-stock';
        let statusText = 'En Stock';
        
        if (product.stock === 0) {
            statusClass = 'status-out-of-stock';
            statusText = 'Agotado';
        } else if (product.stock < product.minStock) {
            statusClass = 'status-low-stock';
            statusText = 'Stock Bajo';
        }
        
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.stock}</td>
            <td>${product.minStock}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>$${value.toFixed(2)}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-edit" data-id="${product.id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-action btn-delete" data-id="${product.id}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Actualizar estadísticas
    totalProducts.textContent = products.length;
    lowStock.textContent = lowStockCount;
    totalValue.textContent = `$${totalValueSum.toFixed(2)}`;
    outOfStock.textContent = outOfStockCount;
    productsCount.textContent = `${products.length} Productos`;
    lastUpdate.textContent = formatDate();
    
    // Agregar event listeners a los botones de acción
    addActionListeners();
}

// Función para agregar event listeners a los botones de acción
function addActionListeners() {
    // Botones de editar
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            editProduct(productId);
        });
    });
    
    // Botones de eliminar
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            deleteProduct(productId);
        });
    });
}

// Funciones para filtros
function filterProducts() {
    const searchInput = document.getElementById('searchProduct');
    const categoryFilter = document.getElementById('filterCategory');
    
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    
    const filtered = sampleProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                             product.category.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || product.category === category;
        
        return matchesSearch && matchesCategory;
    });
    
    currentProducts = filtered;
    loadProducts(filtered);
}

// Función para agregar producto
function addProduct() {
    // Aquí implementarías la lógica para mostrar un modal de agregar producto
    alert('Función para agregar producto - Implementar modal');
    // Ejemplo de cómo agregar un nuevo producto:
    /*
    const newProduct = {
        id: sampleProducts.length + 1,
        name: "Nuevo Producto",
        category: "Accesorios",
        stock: 10,
        minStock: 5,
        price: 99.99,
        status: "in-stock"
    };
    
    sampleProducts.push(newProduct);
    currentProducts.push(newProduct);
    loadProducts(currentProducts);
    */
}

// Función para editar producto
function editProduct(id) {
    const product = sampleProducts.find(p => p.id === id);
    if (product) {
        alert(`Editando producto: ${product.name}\nID: ${id}`);
        // Aquí implementarías la lógica para mostrar un modal de edición
    }
}

// Función para eliminar producto
function deleteProduct(id) {
    if (confirm(`¿Estás seguro de eliminar el producto ID: ${id}?`)) {
        // Encontrar índice del producto
        const index = sampleProducts.findIndex(p => p.id === id);
        if (index !== -1) {
            sampleProducts.splice(index, 1);
            
            // Actualizar currentProducts también
            const currentIndex = currentProducts.findIndex(p => p.id === id);
            if (currentIndex !== -1) {
                currentProducts.splice(currentIndex, 1);
            }
            
            alert(`Producto ${id} eliminado`);
            loadProducts(currentProducts);
        }
    }
}

// Función para exportar a CSV
function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Encabezados
    csvContent += "ID,Producto,Categoría,Stock Actual,Stock Mínimo,Precio Unitario,Valor Total,Estado\n";
    
    // Datos
    currentProducts.forEach(product => {
        const value = product.stock * product.price;
        let estado = 'En Stock';
        if (product.stock === 0) estado = 'Agotado';
        else if (product.stock < product.minStock) estado = 'Stock Bajo';
        
        csvContent += `${product.id},"${product.name}",${product.category},${product.stock},${product.minStock},${product.price},${value},${estado}\n`;
    });
    
    // Crear enlace de descarga
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventario_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Exportando datos a CSV...');
}

// Función para imprimir reporte
function printReport() {
    window.print();
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const searchInput = document.getElementById('searchProduct');
    const categoryFilter = document.getElementById('filterCategory');
    const btnAddProduct = document.getElementById('btnAddProduct');
    const btnExport = document.getElementById('btnExport');
    const btnPrint = document.getElementById('btnPrint');
    
    // Cargar datos iniciales
    loadProducts(sampleProducts);
    
    // Event listeners
    searchInput.addEventListener('input', filterProducts);
    categoryFilter.addEventListener('change', filterProducts);
    btnAddProduct.addEventListener('click', addProduct);
    btnExport.addEventListener('click', exportToCSV);
    btnPrint.addEventListener('click', printReport);
    
    // Actualizar hora periódicamente (opcional)
    setInterval(() => {
        document.getElementById('lastUpdate').textContent = formatDate();
    }, 60000); // Cada minuto
});