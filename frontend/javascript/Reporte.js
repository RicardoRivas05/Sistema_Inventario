// Datos de ejemplo
let datosVentasMes = {
    labels: ['Enero','Febrero','Marzo','Abril','Mayo'],
    datasets: [{
        label: 'Ventas ($)',
        data: [5000,7000,4000,9000,6000],
        borderColor: 'rgba(54,162,235,1)',
        backgroundColor: 'rgba(54,162,235,0.3)',
        tension: 0.3,
        fill: true
    }]
};

let datosProductosTop = {
    labels: ['iPhone 15', 'Samsung S23', 'Xiaomi 14', 'Motorola Edge', 'Nokia 3310'],
    datasets: [{
        label: 'Cantidad Vendida',
        data: [120,90,75,50,30],
        backgroundColor: [
            'rgba(255,99,132,0.6)',
            'rgba(54,162,235,0.6)',
            'rgba(255,206,86,0.6)',
            'rgba(75,192,192,0.6)',
            'rgba(153,102,255,0.6)'
        ]
    }]
};

let datosVentasMarca = {
    labels: ['Apple', 'Samsung', 'Xiaomi', 'Motorola', 'Nokia'],
    datasets: [{
        label: 'Ventas ($)',
        data: [12000,10000,7000,4000,2000],
        backgroundColor: 'rgba(255,159,64,0.6)'
    }]
};

let datosStock = {
    labels: ['iPhone 15', 'Samsung S23', 'Xiaomi 14', 'Motorola Edge', 'Nokia 3310'],
    datasets: [{
        label: 'Stock',
        data: [25,40,60,30,80],
        backgroundColor: 'rgba(75,192,192,0.6)'
    }]
};

// Crear gráficos
const ventasMesChart = new Chart(document.getElementById('ventasMes'), {
    type: 'line',
    data: datosVentasMes,
    options: { responsive: true }
});

const productosTopChart = new Chart(document.getElementById('productosTop'), {
    type: 'bar',
    data: datosProductosTop,
    options: { responsive: true }
});

const ventasMarcaChart = new Chart(document.getElementById('ventasMarca'), {
    type: 'pie',
    data: datosVentasMarca,
    options: { responsive: true }
});

const stockChart = new Chart(document.getElementById('stock'), {
    type: 'bar',
    data: datosStock,
    options: { responsive: true }
});

// Filtros simulados
document.getElementById('filtroMes').addEventListener('change', (e) => {
    const mes = e.target.value;
    alert('Filtrando por mes: ' + mes);
});

document.getElementById('filtroMarca').addEventListener('change', (e) => {
    const marca = e.target.value;
    alert('Filtrando por marca: ' + marca);
});
