// ==============================
// MÓDULO USUARIOS - PERSISTENTE Y CONECTADO A ROLES
// ==============================

// Claves de localStorage
const LS_ROLES_KEY_U = "megacels_roles";
const LS_USERS_KEY   = "megacels_usuarios";

// Cargar roles guardados (definidos en Roles)
let roles = JSON.parse(localStorage.getItem(LS_ROLES_KEY_U));
if (!Array.isArray(roles)) {
  roles = []; // si no hay roles, el select lo dirá
}
// Cargar usuarios guardados
let usuarios = JSON.parse(localStorage.getItem(LS_USERS_KEY));
if (!Array.isArray(usuarios)) {
  usuarios = []; // empiezas vacío
}

// Referencias a inputs/formulario
const selectRol      = document.getElementById("u_rol"); // select rol
const inputNombre    = document.getElementById("u_nombre"); // nombre completo
const inputUsername  = document.getElementById("u_username"); // usuario
const inputPassword  = document.getElementById("u_password"); // contraseña
const selectEstado   = document.getElementById("u_estado"); // estado
const inputEmail     = document.getElementById("u_email"); // correo

const btnSaveUser    = document.getElementById("btn-save-user"); // guardar / actualizar
const btnClearUser   = document.getElementById("btn-clear-user"); // limpiar formulario
const userMsg        = document.getElementById("user-form-message");// texto de validación
// Tabla y búsqueda
const userSearch     = document.getElementById("user-search");
const usersTableBody = document.querySelector("#usersTable tbody");

// Resumen // Opcionales (solo si existen en HTML)
const sumTotal     = document.getElementById("sum-total");
const sumActivos   = document.getElementById("sum-activos");
const sumInactivos = document.getElementById("sum-inactivos");
const sumPorRol    = document.getElementById("sum-por-rol");
const permisosList = document.getElementById("permisos-list");

// Usuario actualmente en edición (null = nuevo)
let usuarioEditando = null;

// Helpers

// Guarda usuarios en localStorage
function saveUsers() {
  localStorage.setItem(LS_USERS_KEY, JSON.stringify(usuarios));
}
// Devuelve rol por id
function getRol(id) {
  return roles.find(r => r.id === id);
}
// Devuelve nombre del rol o "Sin rol"
function rolNombre(id) {
  return getRol(id)?.nombre || "Sin rol";
}

// Cargar roles en el select

function cargarRolesSelect() {
  selectRol.innerHTML = '<option value="">Seleccione un rol</option>';
  // Si no hay roles definidos
  if (!roles.length) {
    const opt = document.createElement("option");
    opt.disabled = true;
    opt.textContent = "No hay roles registrados (cree uno en la sección Roles).";
    selectRol.appendChild(opt);
    selectRol.value = "";
    return;
  }
   // Agrega opciones desde localStorage
  roles.forEach(r => {
    const opt = document.createElement("option");
    opt.value = r.id;
    opt.textContent = r.nombre;
    selectRol.appendChild(opt);
  });
}

// Render tabla de usuarios

function renderUsuarios() {
  const filtro = (userSearch?.value || "").trim().toLowerCase();
  usersTableBody.innerHTML = "";

  usuarios
    .filter(u =>
      u.nombre.toLowerCase().includes(filtro) ||
      u.username.toLowerCase().includes(filtro)
    )
    .forEach(u => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.nombre}</td>
        <td>${u.username}</td>
        <td>${rolNombre(u.rolId)}</td>
        <td>
          <span class="badge-estado ${u.estado === "activo" ? "badge-activo" : "badge-inactivo"}">
            ${u.estado}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-edit"   onclick="editarUsuario(${u.id})">
            <i class="fas fa-pen"></i> Editar
          </button>
          <button class="btn btn-sm btn-toggle" onclick="toggleEstado(${u.id})">
            <i class="fas fa-power-off"></i>
          </button>
          <button class="btn btn-sm btn-delete" onclick="eliminarUsuario(${u.id})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      usersTableBody.appendChild(tr);
    });
    // Si no hay usuarios
  if (!usuarios.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td colspan="5" style="text-align:center; font-size:11px; color:#6b7280;">
        No hay usuarios registrados.
      </td>`;
    usersTableBody.appendChild(tr);
  }

  renderResumen(); // actualiza totales si existen
  actualizarPermisosRol(); // muestra permisos según rol seleccionado
}

// Validación

function validarUsuario() {
   // Campos obligatorios
  if (!inputNombre.value.trim() ||
      !inputUsername.value.trim() ||
      !selectRol.value) {
    userMsg.textContent = "Completa los campos obligatorios (*).";
    return false;
  }
  
  // Validación contraseña solo al crear
  if (!usuarioEditando) {
    const pass = (inputPassword.value || "").trim();
    if (pass.length < 6) {
      userMsg.textContent = "La contraseña debe tener al menos 6 caracteres.";
      return false;
    }
  }

  return true;
}

// Guardar / actualizar usuario

btnSaveUser.addEventListener("click", () => {
  userMsg.textContent = "";
  if (!validarUsuario()) return;

  const data = {
    nombre:   inputNombre.value.trim(),
    username: inputUsername.value.trim(),
    rolId:    selectRol.value,
    estado:   selectEstado.value,
    email:    inputEmail.value.trim()
    // Nota: podrías guardar pass hasheada si tuvieras backend
  };

  if (usuarioEditando) {
     // Actualizar usuario existente
    usuarioEditando.nombre   = data.nombre;
    usuarioEditando.username = data.username;
    usuarioEditando.rolId    = data.rolId;
    usuarioEditando.estado   = data.estado;
    usuarioEditando.email    = data.email;
    userMsg.textContent = "Usuario actualizado correctamente.";
  } else {
    // Crear nuevo usuario
    usuarios.push({ id: Date.now(), ...data }); // id simple basado en tiempo
    userMsg.textContent = "Usuario agregado correctamente.";
  }

  saveUsers(); // persistir
  renderUsuarios(); // refrescar tabla
});

// Limpiar formulario (no borra usuarios)

btnClearUser.addEventListener("click", () => {
  usuarioEditando     = null; // deja de editar
  inputNombre.value   = "";
  inputUsername.value = "";
  inputPassword.value = "";
  selectRol.value     = "";
  selectEstado.value  = "activo";
  inputEmail.value    = "";
  userMsg.textContent = "";
  actualizarPermisosRol();
});

// Buscar en vivo

userSearch?.addEventListener("input", renderUsuarios);

// Acciones desde la tabla

// Cargar datos en formulario para editar
window.editarUsuario = id => {
  const u = usuarios.find(x => x.id === id);
  if (!u) return;
  usuarioEditando       = u;
  inputNombre.value     = u.nombre;
  inputUsername.value   = u.username;
  inputPassword.value   = ""; // no se muestra
  selectRol.value       = u.rolId;
  selectEstado.value    = u.estado;
  inputEmail.value      = u.email || "";
  userMsg.textContent   = `Editando usuario: ${u.username}`;
  actualizarPermisosRol();
};

// Cambiar activo/inactivo
window.toggleEstado = id => {
  const u = usuarios.find(x => x.id === id);
  if (!u) return;
  u.estado = u.estado === "activo" ? "inactivo" : "activo";
  saveUsers();
  renderUsuarios();
};

// Eliminar usuario
window.eliminarUsuario = id => {
  const u = usuarios.find(x => x.id === id);
  if (!u) return;
  if (!confirm(`¿Eliminar usuario "${u.username}"?`)) return;
  usuarios = usuarios.filter(x => x.id !== id);
  saveUsers();
  renderUsuarios();
};

// Resumen (si hay elementos de resumen)

function renderResumen() {
  const total   = usuarios.length;
  const activos = usuarios.filter(u => u.estado === "activo").length;
  const inact   = total - activos;

  const porRol = usuarios.reduce((acc, u) => {
    const r = rolNombre(u.rolId);
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {});

  const texto = Object.keys(porRol).length
    ? Object.entries(porRol).map(([r, c]) => `${r}: ${c}`).join(" · ")
    : "—";

  if (sumTotal)     sumTotal.textContent = total;
  if (sumActivos)   sumActivos.textContent = activos;
  if (sumInactivos) sumInactivos.textContent = inact;
  if (sumPorRol)    sumPorRol.textContent = texto;
}
// Muestra permisos asociados al rol seleccionado (si existe contenedor)
function actualizarPermisosRol() {
  if (!permisosList) return;
  permisosList.innerHTML = "";
  const rol = getRol(selectRol.value);
  if (!rol) return;
  rol.permisos.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p;
    permisosList.appendChild(li);
  });
}
// Actualiza permisos al cambiar rol seleccionado
selectRol.addEventListener("change", actualizarPermisosRol);

// Inicialización

cargarRolesSelect(); // llena el combo con roles guardados
renderUsuarios(); // muestra usuarios guardados


