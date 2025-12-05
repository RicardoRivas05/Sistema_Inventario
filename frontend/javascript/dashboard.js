/**
 * ========================================
 * DASHBOARD PRINCIPAL
 * Lógica y actualización en tiempo real
 * ========================================
 */

class Dashboard {
    
    /**
     * Constructor
     */
    constructor() {
        this.chart = null;
        this.updateInterval = null;
        this.isLoading = false;
        
        console.log('[Dashboard] Inicializando...');
        this.init();
    }

    /**
     * Inicializa el dashboard
     */
    async init() {
        try {
            // Configurar event listeners
            this.setupEventListeners();
            
            // Cargar datos iniciales
            await this.cargarDatos();
            
            // Iniciar actualización automática
            this.iniciarActualizacionAutomatica();
            
            console.log('[Dashboard] Inicialización completa');
            
        } catch (error) {
            console.error('[Dashboard] Error en inicialización:', error);
            this.mostrarError('Error al inicializar el dashboard');
        }
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Botón de actualización manual
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                console.log('[Dashboard] Actualización manual solicitada');
                this.cargarDatos();
            });
        }

        // Detectar visibilidad de la página para pausar/reanudar actualizaciones
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('[Dashboard] Página oculta - pausando actualizaciones');
                this.detenerActualizacionAutomatica();
            } else {
                console.log('[Dashboard] Página visible - reanudando actualizaciones');
                this.iniciarActualizacionAutomatica();
                this.cargarDatos();
            }
        });
    }

    /**
     * Carga todos los datos del dashboard
     */
    async cargarDatos() {
        if (this.isLoading) {
            console.log('[Dashboard] Ya hay una carga en proceso');
            return;
        }

        this.isLoading = true;
        console.log('[Dashboard] Cargando datos...');
        
        // Mostrar indicador de carga en el botón
        const refreshBtn = document.getElementById('refreshBtn');
        const refreshIcon = refreshBtn?.querySelector('i');
        if (refreshIcon) {
            refreshIcon.classList.add('fa-spin');
        }
        
        try {
            // Obtener todos los datos del backend
            const resultado = await dashboardAPI.obtenerTodosDatos();
            
            if (resultado.success) {
                // Actualizar cada sección del dashboard
                this.actualizarMetricas(resultado.data.metricas);
                this.actualizarStockBajo(resultado.data.stockAlertas);
                this.actualizarMovimientos(resultado.data.movimientos);
                this.actualizarGrafico(resultado.data.populares);
                this.actualizarUltimaActualizacion();
                
                console.log('[Dashboard] Datos cargados exitosamente');
            } else {
                console.error('[Dashboard] Error al cargar datos:', resultado.errors);
                this.mostrarError('Error al cargar algunos datos del dashboard');
            }
            
        } catch (error) {
            console.error('[Dashboard] Error crítico:', error);
            this.mostrarError('Error al conectar con el servidor');
        } finally {
            this.isLoading = false;
            
            // Quitar indicador de carga
            if (refreshIcon) {
                refreshIcon.classList.remove('fa-spin');
            }
        }
    }

    /**
     * Actualiza las métricas principales
     */
    actualizarMetricas(metricas) {
        if (!metricas) {
            console.warn('[Dashboard] No hay métricas para actualizar');
            return;
        }

        console.log('[Dashboard] Actualizando métricas:', metricas);

        // Total Productos
        this.animarNumero('totalProductos', metricas.totalProductos);

        // Valor Inventario (formateado como moneda)
        const valorFormateado = new Intl.NumberFormat('es-HN', {
            style: 'currency',
            currency: 'HNL',
            minimumFractionDigits: 2
        }).format(metricas.valorInventario);
        
        const valorElement = document.getElementById('valorInventario');
        if (valorElement) {
            valorElement.textContent = valorFormateado;
        }

        // Stock Bajo
        this.animarNumero('stockBajo', metricas.stockBajo);

        // Movimientos Hoy
        this.animarNumero('movimientosHoy', metricas.movimientosHoy);
    }

    /**
     * Actualiza la sección de productos con stock bajo
     */
    actualizarStockBajo(productos) {
        const container = document.getElementById('stockBajoContainer');
        
        if (!container) {
            console.error('[Dashboard] Container de stock bajo no encontrado');
            return;
        }

        if (!productos || productos.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-light);">
                    <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--success-color); margin-bottom: 10px;"></i>
                    <p style="font-size: 1.1rem;">No hay productos con stock bajo</p>
                    <p style="font-size: 0.9rem; margin-top: 5px;">¡Todo está bien aprovisionado!</p>
                </div>
            `;
            return;
        }

        console.log(`[Dashboard] Mostrando ${productos.length} productos con stock bajo`);

        container.innerHTML = productos.map(producto => {
            const esCritico = producto.porcentaje <= 25;
            const claseAlerta = esCritico ? 'critical' : '';
            const colorPorcentaje = esCritico ? 'var(--danger-color)' : 'var(--warning-color)';
            
            return `
                <div class="stock-item ${claseAlerta}">
                    <div class="stock-item-info">
                        <h4>${producto.nombre}</h4>
                        <p>Stock: ${producto.stockActual} / Mínimo: ${producto.stockMinimo}</p>
                    </div>
                    <div>
                        <div style="text-align: right; margin-bottom: 5px; font-weight: 600; color: ${colorPorcentaje}">
                            ${producto.porcentaje}%
                        </div>
                        <div class="stock-bar">
                            <div class="stock-bar-fill ${claseAlerta}" 
                                 style="width: ${Math.min(producto.porcentaje, 100)}%"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Actualiza la sección de movimientos recientes
     */
    actualizarMovimientos(movimientos) {
        const container = document.getElementById('movimientosContainer');
        
        if (!container) {
            console.error('[Dashboard] Container de movimientos no encontrado');
            return;
        }

        if (!movimientos || movimientos.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-light);">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 10px;"></i>
                    <p style="font-size: 1.1rem;">No hay movimientos recientes</p>
                </div>
            `;
            return;
        }

        console.log(`[Dashboard] Mostrando ${movimientos.length} movimientos`);

        container.innerHTML = movimientos.map(movimiento => {
            // Formatear fecha
            const fecha = new Date(movimiento.fecha);
            const fechaFormateada = fecha.toLocaleString('es-HN', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Determinar clase y signo según el tipo
            const tipoLower = movimiento.tipo.toLowerCase();
            const badgeClass = tipoLower;
            const signo = tipoLower === 'entrada' ? '+' : tipoLower === 'salida' ? '-' : '±';

            return `
                <div class="movement-item">
                    <div class="movement-info">
                        <h4>${movimiento.productoNombre}</h4>
                        <p>${fechaFormateada} • ${movimiento.usuario}</p>
                    </div>
                    <div style="text-align: right;">
                        <div class="movement-badge ${badgeClass}">
                            ${movimiento.tipo}
                        </div>
                        <p style="margin-top: 5px; font-weight: 600; color: var(--dark-color);">
                            ${signo}${movimiento.cantidad}
                        </p>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Actualiza el gráfico de productos populares
     */
    actualizarGrafico(productos) {
        const canvas = document.getElementById('productosChart');
        const container = document.getElementById('chartContainer');
        
        if (!canvas || !container) {
            console.error('[Dashboard] Canvas del gráfico no encontrado');
            return;
        }

        if (!productos || productos.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px; color: var(--text-light);">
                    <i class="fas fa-chart-bar" style="font-size: 3rem; margin-bottom: 10px;"></i>
                    <p style="font-size: 1.1rem;">No hay datos disponibles para el gráfico</p>
                </div>
            `;
            return;
        }

        console.log(`[Dashboard] Actualizando gráfico con ${productos.length} productos`);

        // Destruir gráfico anterior si existe
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }

        // Asegurarse de que el canvas esté presente
        if (!document.getElementById('productosChart')) {
            container.innerHTML = '<canvas id="productosChart"></canvas>';
        }

        const ctx = document.getElementById('productosChart');

        // Crear nuevo gráfico
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: productos.map(p => p.nombre),
                datasets: [{
                    label: 'Total Movimientos',
                    data: productos.map(p => p.totalMovimientos),
                    backgroundColor: 'rgba(53, 152, 219, 0.8)',
                    borderColor: 'rgba(53, 152, 219, 1)',
                    borderWidth: 2,
                    borderRadius: 8,
                    hoverBackgroundColor: 'rgba(41, 128, 185, 0.9)',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleColor: '#fff',
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyColor: '#fff',
                        bodyFont: {
                            size: 13
                        },
                        borderColor: '#3598db',
                        borderWidth: 1,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Movimientos: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                            color: '#7f8c8d',
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        }
                    },
                    x: {
                        ticks: {
                            color: '#7f8c8d',
                            maxRotation: 45,
                            minRotation: 45,
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    /**
     * Actualiza la fecha de última actualización
     */
    actualizarUltimaActualizacion() {
        const ahora = new Date();
        const formatted = ahora.toLocaleString('es-HN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const elemento = document.getElementById('lastUpdate');
        if (elemento) {
            elemento.textContent = `Última actualización: ${formatted}`;
        }
    }

    /**
     * Anima un número con efecto de conteo
     */
    animarNumero(elementId, targetValue) {
        const element = document.getElementById(elementId);
        
        if (!element) {
            console.warn(`[Dashboard] Elemento ${elementId} no encontrado`);
            return;
        }

        const currentValue = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
        const increment = (targetValue - currentValue) / 20;
        let current = currentValue;
        
        const timer = setInterval(() => {
            current += increment;
            
            if ((increment > 0 && current >= targetValue) || 
                (increment < 0 && current <= targetValue)) {
                element.textContent = targetValue;
                clearInterval(timer);
            } else {
                element.textContent = Math.round(current);
            }
        }, 30);
    }

    /**
     * Inicia la actualización automática cada 30 segundos
     */
    iniciarActualizacionAutomatica() {
        // Limpiar intervalo previo si existe
        this.detenerActualizacionAutomatica();
        
        console.log('[Dashboard] Iniciando actualización automática (cada 30s)');
        
        this.updateInterval = setInterval(() => {
            console.log('[Dashboard] Actualización automática...');
            this.cargarDatos();
        }, 30000); // 30 segundos
    }

    /**
     * Detiene la actualización automática
     */
    detenerActualizacionAutomatica() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('[Dashboard] Actualización automática detenida');
        }
    }

    /**
     * Muestra un mensaje de error
     */
    mostrarError(mensaje) {
        console.error(`[Dashboard] ${mensaje}`);
        
        // Aquí podrías implementar un sistema de notificaciones más elaborado
        alert(`⚠️ ${mensaje}\n\nPor favor, verifica:\n- Que el servidor esté corriendo\n- La configuración de la URL del API\n- La consola del navegador para más detalles`);
    }
}

// ===== INICIALIZACIÓN =====
// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Dashboard] DOM cargado, iniciando dashboard...');
    
    // Crear instancia del dashboard
    const dashboard = new Dashboard();
    
    // Detener actualizaciones al cerrar/recargar la página
    window.addEventListener('beforeunload', () => {
        console.log('[Dashboard] Cerrando página...');
        dashboard.detenerActualizacionAutomatica();
    });
    
    console.log('[Dashboard] Sistema listo');
});