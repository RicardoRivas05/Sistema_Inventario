document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('foto_perfil');
    const fileNameDisplay = document.getElementById('file-name-display');
    const avatarPreview = document.getElementById('avatar-preview'); // Obtenemos la etiqueta <img>

    // Función principal para la previsualización de la imagen
    function readURL(input) {
        if (input.files && input.files[0]) {
            // 1. Muestra el nombre del archivo
            fileNameDisplay.textContent = input.files[0].name;
            
            // 2. Lee el archivo como una URL
            const reader = new FileReader();

            reader.onload = function(e) {
                // Cuando la lectura termina, establece la fuente del <img>
                avatarPreview.src = e.target.result;
            };

            // Inicia la lectura del archivo (convierte el archivo a una URL de datos)
            reader.readAsDataURL(input.files[0]);
        } else {
            // Si se cancela la selección, vuelve a los valores por defecto
            fileNameDisplay.textContent = 'Ningún archivo seleccionado';
            // Vuelve a la imagen de avatar por defecto (ajusta la ruta si es necesario)
            avatarPreview.src = 'img/default-avatar.png'; 
        }
    }

    // Escucha el evento 'change' en el input de archivo
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            readURL(this);
        });
    }

    // **OPCIONAL:** Validación de Contraseñas (Recomendado)
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm_password').value;

            if (password !== confirmPassword) {
                alert('Las contraseñas no coinciden. Por favor, verifícalas.');
                event.preventDefault(); // Detiene el envío del formulario
            }
        });
    }
});