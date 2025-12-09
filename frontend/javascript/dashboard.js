

class Dashboard {
    
    
    constructor() {
        this.updateInterval = null;
        this.isLoading = false;
        
        console.log('[Dashboard] Inicializando...');
        this.init();
    }

    
    async init() {
        try {
            
            const conectado = await dashboardAPI.verificarConexion();
            if (!conectado) {
                this.mostrarError('No se pudo conectar con el servidor. Verifica que esté corriendo en http://localhost:3000');
                return;
            }

            
            this.setupEventListeners();
            
            
            await this.cargarDatos();
            
            
            this.iniciarActualizacionAutomatica();
            
            console.log('[Dashboard] Inicialización completa');
            
        } catch (error) {
            console.error('[Dashboard] Error en inicialización:', error);
            this.mostrarError('Error al inicializar el dashboard');
        }
    }

    
    setupEventListeners() {
        
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                console.log('[Dashboard] Actualización manual solicitada');
                this.cargarDatos();
            });
        }

        
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

    
    async cargarDatos() {
        if (this.isLoading) {
            console.log('[Dashboard] Ya hay una carga en proceso');
            return;
        }

        this.isLoading = true;
        console.log('[Dashboard] Cargando datos...');
        
        
        const refreshBtn = document.getElementById('refreshBtn');
        const refreshIcon = refreshBtn?.querySelector('i');
        if (refreshIcon) {
            refreshIcon.classList.add('fa-spin');
        }
        
        try {
            
            const resultado = await dashboardAPI.obtenerTodosDatos();
            
            if (resultado.success) {
                
                this.actualizarMetricas(resultado.data.metricas);
                this.actualizarStockBajo(resultado.data.stockAlertas);
                this.actualizarMovimientos(resultado.data.movimientos);
                this.actualizarUltimaActualizacion();
                
                console.log('[Dashboard] Datos cargados exitosamente');
            } else {
                console.error('[Dashboard] Errores al cargar datos:', resultado.errors);
                
                
                if (resultado.data.metricas) {
                    this.actualizarMetricas(resultado.data.metricas);
                }
                if (resultado.data.stockAlertas) {
                    this.actualizarStockBajo(resultado.data.stockAlertas);
                }
                if (resultado.data.movimientos) {
                    this.actualizarMovimientos(resultado.data.movimientos);
                }
                
                if (resultado.errors.length > 0) {
                    console.warn('[Dashboard] Algunos datos no pudieron cargarse:', resultado.errors.join(', '));
                }
            }
            
        } catch (error) {
            console.error('[Dashboard] Error crítico:', error);
            this.mostrarError('Error al conectar con el servidor. Verifica que esté corriendo.');
        } finally {
            this.isLoading = false;
            
            
            if (refreshIcon) {
                refreshIcon.classList.remove('fa-spin');
            }
        }
    }

   
    actualizarMetricas(metricas) {
        if (!metricas) {
            console.warn('[Dashboard] No hay métricas para actualizar');
            return;
        }

        console.log('[Dashboard] Actualizando métricas:', metricas);

        
        this.animarNumero('totalProductos', metricas.totalProductos);

        
        const valorFormateado = new Intl.NumberFormat('es-HN', {
            style: 'currency',
            currency: 'HNL',
            minimumFractionDigits: 2
        }).format(metricas.valorInventario);
        
        const valorElement = document.getElementById('valorInventario');
        if (valorElement) {
            valorElement.textContent = valorFormateado;
        }

        
        this.animarNumero('stockBajo', metricas.stockBajo);

        
        this.animarNumero('movimientosHoy', metricas.movimientosHoy);
    }

    
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
            
            const fecha = new Date(movimiento.fecha);
            const fechaFormateada = fecha.toLocaleString('es-HN', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });

            
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

    
    iniciarActualizacionAutomatica() {
        
        this.detenerActualizacionAutomatica();
        
        console.log('[Dashboard] Iniciando actualización automática (cada 30s)');
        
        this.updateInterval = setInterval(() => {
            console.log('[Dashboard] Actualización automática...');
            this.cargarDatos();
        }, 30000); 
    }

    
    detenerActualizacionAutomatica() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('[Dashboard] Actualización automática detenida');
        }
    }

    
    mostrarError(mensaje) {
        console.error(`[Dashboard] ${mensaje}`);
        
        
        const notificacion = document.createElement('div');
        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notificacion.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${mensaje}</span>
            </div>
        `;
        
        document.body.appendChild(notificacion);
        
        
        setTimeout(() => {
            notificacion.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notificacion.remove(), 300);
        }, 5000);
    }
}


const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
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
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);


document.addEventListener('DOMContentLoaded', () => {
    console.log('[Dashboard] DOM cargado, iniciando dashboard...');
    

    const dashboard = new Dashboard();
    
    
    window.addEventListener('beforeunload', () => {
        console.log('[Dashboard] Cerrando página...');
        dashboard.detenerActualizacionAutomatica();
    });
    
    console.log('[Dashboard] Sistema listo');
});