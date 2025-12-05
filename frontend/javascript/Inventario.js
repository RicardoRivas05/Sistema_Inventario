let inventario = [];

// === AGREGAR PRODUCTO ===
document.getElementById("btnAgregarInventario").addEventListener("click", () => {

    const nombre = document.getElementById("nombreProducto").value.trim();
    const marca = document.getElementById("marcaProducto").value;
    const precio = document.getElementById("precioProducto").value;
    const stock = document.getElementById("stockProducto").value;

    const msg = document.getElementById("invMessage");

    if (nombre === "" || marca === "" || precio === "" || stock === "") {
        msg.textContent = "Complete todos los campos.";
        msg.style.color = "red";
        return;
    }

    inventario.push({
        nombre,
        marca,
        precio: Number(precio),
        stock: Number(stock)
    });

    msg.textContent = "Producto agregado correctamente.";
    msg.style.color = "green";

    mostrarInventario();
    limpiarCampos();
});

// === LIMPIAR CAMPOS ===
function limpiarCampos() {
    document.getElementById("nombreProducto").value = "";
    document.getElementById("marcaProducto").value = "";
    document.getElementById("precioProducto").value = "";
    document.getElementById("stockProducto").value = "";
}

// === MOSTRAR TABLA ===
function mostrarInventario() {

    const tbody = document.getElementById("tbodyInventario");
    tbody.innerHTML = "";

    inventario.forEach((p, index) => {
        const fila = `
            <tr>
                <td>${p.nombre}</td>
                <td>${p.marca}</td>
                <td>L ${p.precio.toFixed(2)}</td>
                <td>${p.stock}</td>
                <td>
                    <button class="btn-accion btn-editar" onclick="editar(${index})">Editar</button>
                    <button class="btn-accion btn-eliminar" onclick="eliminar(${index})">Eliminar</button>
                </td>
            </tr>
        `;

        tbody.innerHTML += fila;
    });
}

// === ELIMINAR ===
function eliminar(index) {
    inventario.splice(index, 1);
    mostrarInventario();
}

// === EDITAR (simple) ===
function editar(index) {
    const p = inventario[index];

    document.getElementById("nombreProducto").value = p.nombre;
    document.getElementById("marcaProducto").value = p.marca;
    document.getElementById("precioProducto").value = p.precio;
    document.getElementById("stockProducto").value = p.stock;

    eliminar(index);
}
