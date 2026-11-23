/* ============================================================
   CafeYa Ica - Registro de clientes
   ============================================================ */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('form-registro');
    const camposPassword = [document.getElementById('password'), document.getElementById('confirmar')];
    const botonVer = document.getElementById('ver-pass');
    let visible = false;

    botonVer.addEventListener('click', function () {
      visible = !visible;
      camposPassword.forEach(function (campo) { campo.type = visible ? 'text' : 'password'; });
      botonVer.textContent = visible ? 'Ocultar' : 'Ver';
    });

    form.addEventListener('submit', function (evento) {
      evento.preventDefault();
      const revision = window.Validaciones.formulario(form, {
        nombre: { etiqueta: 'El nombre', requerido: true, minLength: 3, maxLength: 70 },
        correo: { etiqueta: 'El correo', requerido: true, tipo: 'correo' },
        celular: { etiqueta: 'El celular', requerido: true, tipo: 'celular' },
        distrito: { etiqueta: 'El distrito', requerido: true },
        password: { etiqueta: 'La contraseña', requerido: true, tipo: 'password', minLength: 6 },
        confirmar: { etiqueta: 'La confirmación', requerido: true, minLength: 6 }
      });

      if (!revision.valido) {
        window.Notificaciones.error('Revisa el formulario', revision.errores[0]);
        return;
      }
      if (revision.datos.password !== revision.datos.confirmar) {
        window.Notificaciones.error('Las contraseñas no coinciden', 'Verifica ambos campos de contraseña.');
        return;
      }
      if (!window.Validaciones.unicoCorreo(revision.datos.correo)) {
        window.Notificaciones.error('Correo registrado', 'Ya existe una cuenta con ese correo electrónico.');
        return;
      }
      if (!document.getElementById('terminos').checked) {
        window.Notificaciones.error('Condiciones pendientes', 'Debes aceptar las condiciones para crear tu cuenta.');
        return;
      }

      const resultado = window.Auth.registrar({
        nombre: revision.datos.nombre,
        correo: revision.datos.correo,
        celular: revision.datos.celular,
        password: revision.datos.password,
        distrito: revision.datos.distrito,
        preferencia: form.elements.preferencia.value
      });

      if (!resultado.ok) {
        window.Notificaciones.error('No se pudo crear la cuenta', resultado.error);
        return;
      }
      window.Notificaciones.exito('¡Cuenta creada!', 'Bienvenido a CaféYa, ' + resultado.usuario.nombre + '.');
      setTimeout(function () { location.href = 'cliente.html'; }, 700);
    });
  });
})();
