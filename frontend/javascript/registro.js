document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm_password').value;

            // Validación de contraseña
            if (password !== confirmPassword) {
                alert('Las contraseñas no coinciden. Por favor, verifícalas.');
                return;
            }

            const data = {
                nombre: document.getElementById('nombre_completo').value.trim(),
                usuario: document.getElementById('username').value.trim(),
                password: password,
                rol: document.getElementById('rol').value,
                correo: document.getElementById('correo').value.trim() 
            };

            // Validación de campos obligatorios
            if (!data.nombre || !data.usuario || !data.password || !data.rol || !data.correo) {
                alert('Todos los campos son obligatorios, incluyendo correo.');
                return;
            }

            try {
                // Envío al endpoint POST /usuarios
                const response = await fetch('http://localhost:3000/usuarios', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Usuario registrado exitosamente!');
                    window.location.href = '../Html/Login.html';
                } else {
                    alert('Error al registrar: ' + (result.error || 'Error desconocido'));
                }
            } catch (error) {
                alert('Error de conexión: ' + error.message);
            }
        });
    }
});