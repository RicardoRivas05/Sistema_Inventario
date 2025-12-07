// ==============================
// MÓDULO ROLES - PERSISTENTE
// ==============================

const LS_ROLES_KEY = "megacels_roles";
// Carga roles guardados o inicia vacío
let roles = JSON.parse(localStorage.getItem(LS_ROLES_KEY));
if (!Array.isArray(roles)) {
  roles = []; // empezamos vacío; lo que agregues se queda
  localStorage.setItem(LS_ROLES_KEY, JSON.stringify(roles));
}
// Referencias a elementos del DOM
const tbody         = document.querySelector("#rolesTable tbody");  // cuerpo de tabla
const searchInput   = document.getElementById("role-search");  // buscador
const btnAddRole    = document.getElementById("btn-add-role");   // botón "Añadir rol"
const formContainer = document.getElementById("role-form-container"); // contenedor formulario
const formTitle     = document.getElementById("role-form-title");  // título formulario
const inputNombre   = document.getElementById("rol_nombre"); // input nombre rol
const inputDesc     = document.getElementById("rol_descripcion"); // input descripción
const permChecks    = document.querySelectorAll(".perm-check"); // checkboxes permisos
const btnSave       = document.getElementById("btn-save-role");  // botón guardar
const btnClear      = document.getElementById("btn-clear-role");   // botón limpiar
const btnCancel     = document.getElementById("btn-cancel-role");  // botón cancelar
const msg           = document.getElementById("role-form-message"); // mensaje info/error

// Rol actualmente en edición (null si es nuevo)
let rolEditando = null;

// Guarda arreglo de roles en localStorage
function saveRoles() {
  localStorage.setItem(LS_ROLES_KEY, JSON.stringify(roles));
}
// Dibuja la tabla de roles según búsqueda
function renderRoles() {
  const filtro = (searchInput?.value || "").trim().toLowerCase();
  tbody.innerHTML = "";

  roles
    .filter(r => r.nombre.toLowerCase().includes(filtro))
    .forEach(rol => {
      const permisosHtml = rol.permisos.length
        ? rol.permisos.map(p => `<span class="tag">${p}</span>`).join(" ")
        : "-";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${rol.nombre}</td>
        <td>${rol.descripcion || "-"}</td>
        <td>${permisosHtml}</td>
        <td>
          <button class="btn btn-sm btn-edit" onclick="editarRol('${rol.id}')">
            <i class="fas fa-pen"></i> Editar
          </button>
          <button class="btn btn-sm btn-delete" onclick="eliminarRol('${rol.id}')">
            <i class="fas fa-trash"></i> Borrar
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
     // Mensaje cuando no hay roles
  if (roles.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td colspan="4" style="text-align:center; font-size:11px; color:#6b7280;">
        No hay roles registrados. Usa "Añadir rol" para crear el primero.
      </td>`;
    tbody.appendChild(tr);
  }
}
// Abre formulario para nuevo rol
btnAddRole.addEventListener("click", () => {
  rolEditando = null; // no hay rol en edición
  formTitle.textContent = "Nuevo rol"; // título
  inputNombre.value = ""; // limpia campos
  inputDesc.value = "";
  permChecks.forEach(c => c.checked = false);
  msg.textContent = ""; // limpia mensaje
  formContainer.style.display = "block"; // muestra formulario
});
// Guardar (nuevo o edición)
btnSave.addEventListener("click", () => {
  msg.textContent = "";

  const nombre = inputNombre.value.trim();
  if (!nombre) {
    msg.textContent = "El nombre del rol es obligatorio.";
    return;
  }

  const descripcion = inputDesc.value.trim();
  const permisos = Array.from(permChecks)
    .filter(c => c.checked)
    .map(c => c.value); // valores: usuarios, roles, inventario, reportes
// Evita duplicar nombre de rol
  const nombreOcupado = roles.some(
    r => r.nombre.toLowerCase() === nombre.toLowerCase() &&
         (!rolEditando || r.id !== rolEditando.id)
  );
  if (nombreOcupado) {
    msg.textContent = "Ya existe un rol con ese nombre.";
    return;
  }

  if (rolEditando) {
     // Actualizar rol existente
    rolEditando.nombre = nombre;
    rolEditando.descripcion = descripcion;
    rolEditando.permisos = permisos;
  } else {
    roles.push({
      id: Date.now().toString(), // id simple basado en tiempo
      nombre,
      descripcion,
      permisos
    });
  }

  saveRoles(); // guarda en localStorage
  renderRoles(); // actualiza tabla
  msg.textContent = "Rol guardado correctamente.";
});
// Limpia solo los campos del formulario
btnClear.addEventListener("click", () => {
  inputNombre.value = "";
  inputDesc.value = "";
  permChecks.forEach(c => c.checked = false);
  msg.textContent = "";
});
// Cierra/oculta formulario sin guardar cambios
btnCancel.addEventListener("click", () => {
  formContainer.style.display = "none";
  rolEditando = null;
  msg.textContent = "";
});

// Filtra mientras escribes en buscar
searchInput?.addEventListener("input", renderRoles);
// Editar rol (expuesto en window para que funcione onclick del HTML)
window.editarRol = id => {
  const rol = roles.find(r => r.id === id);
  if (!rol) return;

  rolEditando = rol; // marca rol en edición
  formTitle.textContent = `Editar rol: ${rol.nombre}`;  // título dinámico
  inputNombre.value = rol.nombre;
  inputDesc.value = rol.descripcion || "";
  permChecks.forEach(c => c.checked = rol.permisos.includes(c.value));
  msg.textContent = "";
  formContainer.style.display = "block";  // muestra formulario
};
// Eliminar rol (expuesto en window para onclick)
window.eliminarRol = id => {
  const rol = roles.find(r => r.id === id); // quita del arreglo
  if (!rol) return;
  if (!confirm(`¿Eliminar el rol "${rol.nombre}"?`)) return;  // actualiza localStorage

  roles = roles.filter(r => r.id !== id);   // redibuja tabla
  saveRoles();
  renderRoles();
};
// Primera carga de tabla
renderRoles();
