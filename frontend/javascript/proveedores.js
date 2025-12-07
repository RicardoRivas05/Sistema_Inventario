
let proveedoresData = [];
let proveedorEditando = null;
const API_BASE_URL = 'http://localhost:3000';


async function obtenerProveedores() {
    try {
        const response = await fetch(`${API_BASE_URL}/proveedores`);
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`HTTP ${response.status}: ${error}`);
        }
        
        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error obteniendo proveedores:', error);
        return { 
            success: false, 
            error: error.message || 'Error de conexión con el servidor' 
        };
    }
}

async function obtenerProveedorPorId(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/proveedores/${id}`);
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`HTTP ${response.status}: ${error}`);
        }
        
        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error(`Error obteniendo proveedor ID ${id}:`, error);
        return { 
            success: false, 
            error: error.message || 'Error al cargar el proveedor' 
        };
    }
}

async function crearProveedor(proveedor) {
    try {
        const response = await fetch(`${API_BASE_URL}/proveedores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(proveedor)
        });
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`HTTP ${response.status}: ${error}`);
        }
        
        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error creando proveedor:', error);
        return { 
            success: false, 
            error: error.message || 'Error al crear el proveedor' 
        };
    }
}

async function actualizarProveedor(id, proveedor) {
    try {
        const response = await fetch(`${API_BASE_URL}/proveedores/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(proveedor)
        });
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`HTTP ${response.status}: ${error}`);
        }
        
        return { success: true };
    } catch (error) {
        console.error(`Error actualizando proveedor ID ${id}:`, error);
        return { 
            success: false, 
            error: error.message || 'Error al actualizar el proveedor' 
        };
    }
}

async function eliminarProveedor(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/proveedores/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`HTTP ${response.status}: ${error}`);
        }
        
        return { success: true };
    } catch (error) {
        console.error(`Error eliminando proveedor ID ${id}:`, error);
        return { 
            success: false, 
            error: error.message || 'Error al eliminar el proveedor' 
        };
    }
}


function buscarProveedores(proveedores, termino) {
    if (!termino || termino.trim() === '') return proveedores;
    
    const searchTerm = termino.toLowerCase().trim();
    
    return proveedores.filter(proveedor => {
        return (
            (proveedor.nombre && proveedor.nombre.toLowerCase().includes(searchTerm)) ||
            (proveedor.telefono && proveedor.telefono.includes(searchTerm)) ||
            (proveedor.correo && proveedor.correo.toLowerCase().includes(searchTerm)) ||
            (proveedor.direccion && proveedor.direccion.toLowerCase().includes(searchTerm))
        );
    });
}


document.addEventListener('DOMContentLoaded', () => {
    inicializarEventos();
    cargarProveedores();
});

function inicializarEventos() {
    document.getElementById('btn-nuevo-proveedor').addEventListener('click', abrirModalNuevo);
    document.getElementById('btn-cerrar-modal').addEventListener('click', cerrarModal);
    document.getElementById('btn-cancelar-form').addEventListener('click', cerrarModal);
    document.getElementById('form-proveedor').addEventListener('submit', guardarProveedor);
    document.getElementById('search-input').addEventListener('input', filtrarProveedores);
    
    document.getElementById('modal-proveedor').addEventListener('click', (e) => {
        if (e.target.id === 'modal-proveedor') {
            cerrarModal();
        }
    });
}

async function cargarProveedores() {
    mostrarCargando();
    
    const resultado = await obtenerProveedores();
    
    if (resultado.success) {
        proveedoresData = resultado.data;
        renderizarTabla(proveedoresData);
    } else {
        mostrarError('Error al cargar los proveedores: ' + resultado.error);
        mostrarSinDatos();
    }
}

function mostrarCargando() {
    const tbody = document.getElementById('tabla-proveedores-body');
    tbody.innerHTML = `
        <tr class="loading">
            <td colspan="6">
                <i class="fas fa-spinner fa-spin"></i> Cargando proveedores...
            </td>
        </tr>
    `;
}

function mostrarSinDatos() {
    const tbody = document.getElementById('tabla-proveedores-body');
    tbody.innerHTML = `
        <tr class="no-data">
            <td colspan="6">
                <i class="fas fa-inbox"></i> No hay proveedores registrados
            </td>
        </tr>
    `;
}

function renderizarTabla(proveedores) {
    const tbody = document.getElementById('tabla-proveedores-body');
    
    if (!proveedores || proveedores.length === 0) {
        mostrarSinDatos();
        return;
    }
    
    tbody.innerHTML = '';
    
    proveedores.forEach(proveedor => {
        const row = crearFilaProveedor(proveedor);
        tbody.appendChild(row);
    });
}

function crearFilaProveedor(proveedor) {
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
        <td>${proveedor.idProveedores || ''}</td>
        <td>${proveedor.nombre || ''}</td>
        <td>${proveedor.telefono || ''}</td>
        <td>${proveedor.correo || ''}</td>
        <td>${proveedor.direccion || 'N/A'}</td>
        <td>
            <button class="btn-action btn-editar" onclick="editarProveedor(${proveedor.idProveedores})" title="Editar">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-action btn-eliminar" onclick="confirmarEliminar(${proveedor.idProveedores}, '${proveedor.nombre}')" title="Eliminar">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    return tr;
}

function filtrarProveedores() {
    const termino = document.getElementById('search-input').value;
    const proveedoresFiltrados = buscarProveedores(proveedoresData, termino);
    renderizarTabla(proveedoresFiltrados);
}

function abrirModalNuevo() {
    proveedorEditando = null;
    document.getElementById('modal-title').innerHTML = '<i class="fas fa-plus-circle"></i> Agregar Proveedor';
    document.getElementById('form-proveedor').reset();
    document.getElementById('proveedor-id').value = '';
    limpiarErrores();
    mostrarModal();
}

async function editarProveedor(id) {
    mostrarModal();
    
    const resultado = await obtenerProveedorPorId(id);
    
    if (resultado.success) {
        proveedorEditando = resultado.data;
        document.getElementById('modal-title').innerHTML = '<i class="fas fa-edit"></i> Editar Proveedor';
        llenarFormulario(resultado.data);
    } else {
        cerrarModal();
        mostrarError('Error al cargar el proveedor: ' + resultado.error);
    }
}

function llenarFormulario(proveedor) {
    document.getElementById('proveedor-id').value = proveedor.idProveedores || '';
    document.getElementById('nombre').value = proveedor.nombre || '';
    document.getElementById('telefono').value = proveedor.telefono || '';
    document.getElementById('correo').value = proveedor.correo || '';
    document.getElementById('direccion').value = proveedor.direccion || '';
}

function mostrarModal() {
    document.getElementById('modal-proveedor').classList.add('show');
}

function cerrarModal() {
    document.getElementById('modal-proveedor').classList.remove('show');
    document.getElementById('form-proveedor').reset();
    limpiarErrores();
    proveedorEditando = null;
}

function validarFormulario() {
    limpiarErrores();
    let esValido = true;
    
    const nombre = document.getElementById('nombre').value.trim();
    if (nombre === '') {
        mostrarErrorCampo('nombre', 'El nombre es obligatorio');
        esValido = false;
    } else if (nombre.length < 3) {
        mostrarErrorCampo('nombre', 'El nombre debe tener al menos 3 caracteres');
        esValido = false;
    }
    
    const telefono = document.getElementById('telefono').value.trim();
    if (telefono === '') {
        mostrarErrorCampo('telefono', 'El teléfono es obligatorio');
        esValido = false;
    } else if (!/^[0-9+\-\s()]{8,20}$/.test(telefono)) {
        mostrarErrorCampo('telefono', 'El teléfono debe tener entre 8 y 20 caracteres y solo números, +, -, (), o espacios');
        esValido = false;
    }
    
    const correo = document.getElementById('correo').value.trim();
    if (correo === '') {
        mostrarErrorCampo('correo', 'El correo es obligatorio');
        esValido = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        mostrarErrorCampo('correo', 'El formato del correo no es válido');
        esValido = false;
    }
    
    return esValido;
}

function mostrarErrorCampo(campo, mensaje) {
    const input = document.getElementById(campo);
    input.classList.add('error');
    
    const formRow = input.parentElement;
    let errorMsg = formRow.nextElementSibling;
    
    if (!errorMsg || !errorMsg.classList.contains('error-message')) {
        errorMsg = document.createElement('div');
        errorMsg.classList.add('error-message');
        formRow.parentElement.insertBefore(errorMsg, formRow.nextSibling);
    }
    
    errorMsg.textContent = mensaje;
}

function limpiarErrores() {
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.error-message').forEach(el => el.remove());
}

async function guardarProveedor(e) {
    e.preventDefault();
    
    if (!validarFormulario()) {
        return;
    }
    
    const btnGuardar = e.target.querySelector('.btn-guardar');
    const btnOriginalText = btnGuardar.innerHTML;
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    
    const proveedor = {
        nombre: document.getElementById('nombre').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        correo: document.getElementById('correo').value.trim(),
        direccion: document.getElementById('direccion').value.trim()
    };
    
    const id = document.getElementById('proveedor-id').value;
    let resultado;
    
    if (id) {
        resultado = await actualizarProveedor(id, proveedor);
    } else {
        resultado = await crearProveedor(proveedor);
    }
    
    btnGuardar.disabled = false;
    btnGuardar.innerHTML = btnOriginalText;
    
    if (resultado.success) {
        cerrarModal();
        cargarProveedores();
        mostrarExito(id ? 'Proveedor actualizado correctamente' : 'Proveedor creado correctamente');
    } else {
        mostrarError('Error al guardar: ' + resultado.error);
    }
}

function confirmarEliminar(id, nombre) {
    if (confirm(`¿Está seguro de eliminar al proveedor "${nombre}"?`)) {
        eliminarProveedorPorId(id);
    }
}

async function eliminarProveedorPorId(id) {
    const resultado = await eliminarProveedor(id);
    
    if (resultado.success) {
        cargarProveedores();
        mostrarExito('Proveedor eliminado correctamente');
    } else {
        mostrarError('Error al eliminar: ' + resultado.error);
    }
}

function mostrarExito(mensaje) {
    alert('✓ ' + mensaje);
}

function mostrarError(mensaje) {
    alert('✗ ' + mensaje);
}


window.editarProveedor = editarProveedor;
window.confirmarEliminar = confirmarEliminar;