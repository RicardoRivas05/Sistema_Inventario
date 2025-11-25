document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('foto_perfil');
    const fileNameDisplay = document.getElementById('file-name-display');
    const avatarPreview = document.getElementById('avatar-preview'); 

   
    // **OPCIONAL:** Validación de Contraseñas (Recomendado)
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm_password').value;

            if (password !== confirmPassword) {
                alert('Las contraseñas no coinciden. Por favor, verifícalas.');
                event.preventDefault(); 
            }
        });
    }
});