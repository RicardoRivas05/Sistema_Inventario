document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();


            if (!username || !password) {
                alert('Por favor, ingresa usuario y contraseña.');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/auth/login', { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    console.log('Login exitoso:', data);
                    
                    localStorage.setItem('user', JSON.stringify(data));
                    
                    // Redirección basada en rol
                    if (data.rol === 'administrador') {
                        window.location.href = '../Html/Dashboard.html'; 
                    } else if (data.rol === 'cliente') {
                        window.location.href = '../Html/Productos.html'; 
                    } else {
                        alert('Rol no reconocido. Contacta al administrador.');
                    }
                } else {
                    const errorMessage = data.error?.message || data.error || 'Error desconocido';
                    alert('Credenciales inválidas: ' + errorMessage);
                }
            } catch (error) {
                console.error('Error de conexión:', error);
                alert('Error de conexión. Verifica tu red.');
            }
        });
    }

    const createUserBtn = document.querySelector('.btn-crear-usuario');
    if (createUserBtn) {
        createUserBtn.addEventListener('click', function() {
            window.location.href = '../Html/Registro.html';
        });
    }
});