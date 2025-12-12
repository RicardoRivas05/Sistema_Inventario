// ==============================
// MÓDULO USUARIOS - CONECTADO A LOOPBACK
// ==============================

// Path del controlador en LoopBack
const USUARIOS_PATH = "/usuarios";

// Clave de roles en localStorage (siguen viniendo del módulo Roles)
const LS_ROLES_KEY_U = "megacels_roles";

// Cargar roles guardados (definidos en Roles)
let roles = JSON.parse(localStorage.getItem(LS_ROLES_KEY_U));
if (!Array.isArray(roles)) {
  roles = [];
}

// Lista de usuarios que vienen del backend
let usuarios = [];

// REFERENCIAS A ELEMENTOS DEL DOM

const selectRol      = document.getElementById("u_rol");
const inputNombre    = document.getElementById("u_nombre");
const inputUsername  = document.getElementById("u_username");
const inputPassword  = document.getElementById("u_password");
const selectEstado   = document.getElementById("u_estado");
const inputEmail     = document.getElementById("u_email");

const btnSaveUser    = document.getElementById("btn-save-user");
const btnClearUser   = document.getElementById("btn-clear-user");
const userMsg        = document.getElementById("user-form-message");

const userSearch     = document.getElementById("user-search");
const usersTableBody = document.querySelector("#usersTable tbody");

// Elementos opcionales para resumen (solo si los agregas al HTML)
const sumTotal     = document.getElementById("sum-total");
const sumActivos   = document.getElementById("sum-activos");
const sumInactivos = document.getElementById("sum-inactivos");
const sumPorRol    = document.getElementById("sum-por-rol");
const permisosList = document.getElementById("permisos-list");

// Usuario actualmente en edición (objeto completo o null)
let usuarioEditando = null;


// HELPERS

// Devuelve el id del usuario (id o idUsuario)
function getUserId(u) {
  // AJUSTAR si tu modelo usa otro nombre
  return u.id ?? u.idUsuario;
}

function getRol(id) {
  return roles.find((r) => r.id === id);
}

function rolNombre(id) {
  return getRol(id)?.nombre || "Sin rol";
}

function setMensaje(msg, tipo = "info") {
  if (!userMsg) return;
  userMsg.textContent = msg || "";
  if (tipo === "error") {
    userMsg.style.color = "#dc2626";
  } else if (tipo === "ok") {
    userMsg.style.color = "#16a34a";
  } else {
    userMsg.style.color = "#4b5563";
  }
}

// CARGAR ROLES EN EL SELECT

function cargarRolesSelect() {
  selectRol.innerHTML = '<option value="">Seleccione un rol</option>';

  if (!roles.length) {
    const opt = document.createElement("option");
    opt.disabled = true;
    opt.textContent =
      "No hay roles registrados (cree uno en la sección Roles).";
    selectRol.appendChild(opt);
    selectRol.value = "";
    return;
  }

  roles.forEach((r) => {
    const opt = document.createElement("option");
    opt.value = r.id;
    opt.textContent = r.nombre;
    selectRol.appendChild(opt);
  });
}

// CARGAR USUARIOS DESDE EL BACKEND

async function cargarUsuarios() {
  try {
    usuarios = await api.get(USUARIOS_PATH);
  } catch (err) {
    console.error("Error cargando usuarios:", err);
    usuarios = [];
    setMensaje("No se pudieron cargar los usuarios.", "error");
  }
  renderUsuarios();
}

// RENDER TABLA DE USUARIOS

function renderUsuarios() {
  const filtro = (userSearch?.value || "").trim().toLowerCase();
  usersTableBody.innerHTML = "";

  usuarios
    .filter((u) => {
      // AJUSTAR nombres de campos si tu modelo usa otros
      const nombre   = String(u.nombre ?? u.nombreCompleto ?? "").toLowerCase();
      const username = String(u.username ?? u.usuario ?? "").toLowerCase();
      return (
        nombre.includes(filtro) ||
        username.includes(filtro)
      );
    })
    .forEach((u) => {
      const id = getUserId(u);
      const nombre   = u.nombre ?? u.nombreCompleto ?? "";
      const username = u.username ?? u.usuario ?? "";
      const rolId    = u.rolId ?? u.idRol ?? u.idRole;
      const estado   = u.estado ?? "activo";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${nombre}</td>
        <td>${username}</td>
        <td>${rolNombre(rolId)}</td>
        <td>
          <span class="badge-estado ${
            estado === "activo" ? "badge-activo" : "badge-inactivo"
          }">
            ${estado}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-edit"   onclick="editarUsuario('${id}')">
            <i class="fas fa-pen"></i> Editar
          </button>
          <button class="btn btn-sm btn-toggle" onclick="toggleEstado('${id}')">
            <i class="fas fa-power-off"></i>
          </button>
          <button class="btn btn-sm btn-delete" onclick="eliminarUsuario('${id}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      usersTableBody.appendChild(tr);
    });

  if (!usuarios.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td colspan="5" style="text-align:center; font-size:11px; color:#6b7280;">
        No hay usuarios registrados.
      </td>`;
    usersTableBody.appendChild(tr);
  }

  renderResumen();
  actualizarPermisosRol();
}

// VALIDACIÓN FORMULARIO

function validarUsuario() {
  if (
    !inputNombre.value.trim() ||
    !inputUsername.value.trim() ||
    !selectRol.value
  ) {
    setMensaje("Completa los campos obligatorios (*).", "error");
    return false;
  }

  if (!usuarioEditando) {
    const pass = (inputPassword.value || "").trim();
    if (pass.length < 6) {
      setMensaje("La contraseña debe tener al menos 6 caracteres.", "error");
      return false;
    }
  }

  return true;
}

// CREAR / ACTUALIZAR USUARIO (BACKEND)

btnSaveUser.addEventListener("click", async () => {
  setMensaje("");

  if (!validarUsuario()) return;

  //  AJUSTAR nombres de campos según tu modelo LoopBack
  const baseData = {
    nombre:   inputNombre.value.trim(),
    username: inputUsername.value.trim(),
    rolId:    selectRol.value,
    estado:   selectEstado.value,
    email:    inputEmail.value.trim() || null,
  };

  // Password solo se envía si se escribe algo
  const pass = (inputPassword.value || "").trim();
  if (pass) {
    baseData.password = pass;
  }

  try {
    if (usuarioEditando) {
      // UPDATE (PATCH /usuarios/{id})
      const id = getUserId(usuarioEditando);
      await api.patch(`${USUARIOS_PATH}/${id}`, baseData);
      setMensaje("Usuario actualizado correctamente.", "ok");
    } else {
      // CREATE (POST /usuarios)
      await api.post(USUARIOS_PATH, baseData);
      setMensaje("Usuario agregado correctamente.", "ok");
    }

    // Refrescamos lista desde el backend
    usuarioEditando = null;
    inputPassword.value = "";
    await cargarUsuarios();
  } catch (err) {
    console.error("Error guardando usuario:", err);
    setMensaje("Error al guardar el usuario.", "error");
  }
});

// LIMPIAR FORMULARIO

btnClearUser.addEventListener("click", () => {
  usuarioEditando     = null;
  inputNombre.value   = "";
  inputUsername.value = "";
  inputPassword.value = "";
  selectRol.value     = "";
  selectEstado.value  = "activo";
  inputEmail.value    = "";
  setMensaje("");
  actualizarPermisosRol();
});

// BÚSQUEDA EN TIEMPO REAL

userSearch?.addEventListener("input", renderUsuarios);

// ACCIONES DE LA TABLA (EDITAR / ESTADO / ELIMINAR)

window.editarUsuario = (id) => {
  const u = usuarios.find((x) => String(getUserId(x)) === String(id));
  if (!u) return;

  usuarioEditando       = u;
  inputNombre.value     = u.nombre ?? u.nombreCompleto ?? "";
  inputUsername.value   = u.username ?? u.usuario ?? "";
  inputPassword.value   = ""; // nunca mostramos la pass
  selectRol.value       = u.rolId ?? u.idRol ?? u.idRole ?? "";
  selectEstado.value    = u.estado ?? "activo";
  inputEmail.value      = u.email || "";
  setMensaje(`Editando usuario: ${inputUsername.value}`, "info");
  actualizarPermisosRol();
};

window.toggleEstado = async (id) => {
  const u = usuarios.find((x) => String(getUserId(x)) === String(id));
  if (!u) return;

  const nuevoEstado = (u.estado ?? "activo") === "activo" ? "inactivo" : "activo";

  try {
    await api.patch(`${USUARIOS_PATH}/${id}`, { estado: nuevoEstado });
    await cargarUsuarios();
  } catch (err) {
    console.error("Error cambiando estado:", err);
    setMensaje("No se pudo cambiar el estado del usuario.", "error");
  }
};

window.eliminarUsuario = async (id) => {
  const u = usuarios.find((x) => String(getUserId(x)) === String(id));
  if (!u) return;

  if (!confirm(`¿Eliminar usuario "${u.username ?? u.usuario}"?`)) return;

  try {
    await api.delete(`${USUARIOS_PATH}/${id}`);
    await cargarUsuarios();
    setMensaje("Usuario eliminado.", "ok");
  } catch (err) {
    console.error("Error eliminando usuario:", err);
    setMensaje("No se pudo eliminar el usuario.", "error");
  }
};


// RESUMEN (OPCIONAL)

function renderResumen() {
  const total   = usuarios.length;
  const activos = usuarios.filter((u) => (u.estado ?? "activo") === "activo").length;
  const inact   = total - activos;

  const porRol = usuarios.reduce((acc, u) => {
    const rolId  = u.rolId ?? u.idRol ?? u.idRole;
    const nombre = rolNombre(rolId);
    acc[nombre] = (acc[nombre] || 0) + 1;
    return acc;
  }, {});

  const texto = Object.keys(porRol).length
    ? Object.entries(porRol)
        .map(([r, c]) => `${r}: ${c}`)
        .join(" · ")
    : "—";

  if (sumTotal)     sumTotal.textContent = total;
  if (sumActivos)   sumActivos.textContent = activos;
  if (sumInactivos) sumInactivos.textContent = inact;
  if (sumPorRol)    sumPorRol.textContent = texto;
}

// PERMISOS DEL ROL SELECCIONADO (MISMO LOCALSTORAGE DE ROLES)

function actualizarPermisosRol() {
  if (!permisosList) return;
  permisosList.innerHTML = "";
  const rol = getRol(selectRol.value);
  if (!rol || !Array.isArray(rol.permisos)) return;
  rol.permisos.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = p;
    permisosList.appendChild(li);
  });
}

selectRol.addEventListener("change", actualizarPermisosRol);

// INICIALIZACIÓN

(async function init() {
  cargarRolesSelect();
  await cargarUsuarios();
})();



