/* ============================================================
   CafeYa Ica - Acceso del personal administrativo
   ============================================================ */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('form-admin');
    const password = document.getElementById('password');
    const recordar = document.getElementById('recordar');

    document.getElementById('ver-pass').addEventListener('click', function () {
      password.type = password.type === 'password' ? 'text' : 'password';
      this.textContent = password.type === 'password' ? 'Ver' : 'Ocultar';
    });

    function destino(usuario) {
      const parametro = new URLSearchParams(location.search).get('next');
      if (parametro) {
        const limpio = decodeURIComponent(parametro);
        if (limpio && limpio.indexOf('..') === -1 && limpio.indexOf('://') === -1 && limpio.indexOf('/') === -1) {
          return limpio;
        }
      }
      if (usuario.rol === 'cocina') return '../cocina/cocina.html';
      return 'dashboard.html';
    }

    function entrar(correo, clave, persistente) {
      const resultado = window.Auth.loginAdmin(correo, clave, persistente);
      if (!resultado.ok) {
        window.Notificaciones.error('Acceso denegado', resultado.error);
        return;
      }
      window.Notificaciones.exito('Bienvenido al panel', resultado.usuario.nombre + ' · ' + window.Permisos.etiquetaRol(resultado.usuario.rol));
      const destinoFinal = destino(resultado.usuario);
      setTimeout(function () { location.href = destinoFinal; }, 550);
    }

    form.addEventListener('submit', function (evento) {
      evento.preventDefault();
      const revision = window.Validaciones.formulario(form, {
        correo: { etiqueta: 'El correo', requerido: true, tipo: 'correo' },
        password: { etiqueta: 'La contraseña', requerido: true, tipo: 'password' }
      });
      if (!revision.valido) {
        window.Notificaciones.error('Revisa el formulario', revision.errores[0]);
        return;
      }
      entrar(revision.datos.correo, revision.datos.password, recordar.checked);
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-demo]'), function (boton) {
      boton.addEventListener('click', function () {
        const partes = boton.dataset.demo.split('|');
        document.getElementById('correo').value = partes[0];
        password.value = partes[1];
        entrar(partes[0], partes[1], true);
      });
    });
  });
})();
