/* ============================================================
   CafeYa Ica - Inicio de sesión de clientes
   ============================================================ */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('form-login');
    const campoCorreo = document.getElementById('correo');
    const campoPassword = document.getElementById('password');
    const recordar = document.getElementById('recordar');

    function destinoPorRol(usuario) {
      if (['administrador', 'gerencia', 'marketing', 'operaciones'].indexOf(usuario.rol) > -1) {
        return '../administrador/dashboard.html';
      }
      if (usuario.rol === 'cocina') return '../cocina/cocina.html';
      return 'cliente.html';
    }

    function resolverDestino(usuario) {
      const parametro = new URLSearchParams(location.search).get('next');
      if (parametro) {
        const limpio = decodeURIComponent(parametro);
        if (limpio && limpio.indexOf('..') === -1 && limpio.indexOf('://') === -1 && limpio.indexOf('/') === -1) {
          return limpio;
        }
      }
      return destinoPorRol(usuario);
    }

    function entrar(correo, password, persistente) {
      const resultado = window.Auth.login(correo, password, persistente);
      if (!resultado.ok) {
        window.Notificaciones.error('No se pudo iniciar sesión', resultado.error);
        return;
      }
      window.Notificaciones.exito('Bienvenido a CaféYa', resultado.usuario.nombre);
      const destino = resolverDestino(resultado.usuario);
      setTimeout(function () { location.href = destino; }, 550);
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

    document.getElementById('ver-pass').addEventListener('click', function () {
      campoPassword.type = campoPassword.type === 'password' ? 'text' : 'password';
      this.textContent = campoPassword.type === 'password' ? 'Ver' : 'Ocultar';
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-demo]'), function (boton) {
      boton.addEventListener('click', function () {
        const partes = boton.dataset.demo.split('|');
        campoCorreo.value = partes[0];
        campoPassword.value = partes[1];
        entrar(partes[0], partes[1], true);
      });
    });

    document.getElementById('btn-demo').addEventListener('click', function () {
      campoCorreo.value = 'cliente@cafeya.pe';
      campoPassword.value = '123456';
      entrar('cliente@cafeya.pe', '123456', true);
    });

    /* ---------- Recuperación de contraseña demostrativa ---------- */
    const estado = { correo: '', codigo: '' };

    function pasoCorreo() {
      window.Modal.abrir({
        titulo: 'Recuperar contraseña',
        subtitulo: 'Simulación demostrativa, no se envía correos reales',
        emoji: '🔑',
        cuerpo: '<div class="form-grid">' +
          '<div class="campo"><label for="rec-correo">Correo registrado</label>' +
          '<input type="email" id="rec-correo" placeholder="tucorreo@ejemplo.com"><span class="error"></span></div>' +
          '<div class="alerta"><span class="alerta-icono">🔒</span><div><strong>Modo demostración</strong>' +
          'El código de verificación se mostrará en pantalla para continuar con la presentación.</div></div></div>',
        acciones: '<button class="btn btn-claro" type="button" data-cerrar>Cancelar</button>' +
          '<button class="btn btn-primario" type="button" id="rec-continuar">Enviar código</button>'
      });
      document.getElementById('rec-continuar').addEventListener('click', function () {
        const valor = document.getElementById('rec-correo').value.trim();
        if (!window.Validaciones.correo(valor)) {
          window.Notificaciones.error('Correo inválido', 'Ingresa un correo electrónico válido.');
          return;
        }
        const resultado = window.Auth.recuperar(valor);
        if (!resultado.ok) {
          window.Notificaciones.error('Cuenta no encontrada', resultado.error);
          return;
        }
        estado.correo = valor;
        estado.codigo = resultado.codigo;
        pasoCodigo(resultado.codigo);
      });
    }

    function pasoCodigo(codigo) {
      window.Modal.abrir({
        titulo: 'Verifica tu código',
        subtitulo: 'Código generado para ' + estado.correo,
        emoji: '📩',
        cuerpo: '<p class="muted small">Este es el código demostrativo de recuperación:</p>' +
          '<div class="auth-codigo">' + codigo + '</div>' +
          '<div class="campo"><label for="rec-codigo">Ingresa el código</label>' +
          '<input type="text" id="rec-codigo" maxlength="6" inputmode="numeric" placeholder="000000"><span class="error"></span></div>',
        acciones: '<button class="btn btn-claro" type="button" data-cerrar>Cancelar</button>' +
          '<button class="btn btn-primario" type="button" id="rec-verificar">Verificar</button>'
      });
      document.getElementById('rec-verificar').addEventListener('click', function () {
        const valor = document.getElementById('rec-codigo').value.trim();
        const revision = window.Auth.verificarCodigo(estado.correo, valor);
        if (!revision.ok) {
          window.Notificaciones.error('Código inválido', revision.error);
          return;
        }
        pasoPassword();
      });
    }

    function pasoPassword() {
      window.Modal.abrir({
        titulo: 'Define tu nueva contraseña',
        subtitulo: 'La contraseña se actualizará en el almacenamiento local',
        emoji: '🛡️',
        cuerpo: '<div class="form-grid">' +
          '<div class="campo"><label for="rec-nueva">Nueva contraseña</label>' +
          '<input type="password" id="rec-nueva" placeholder="Mínimo 6 caracteres"><span class="error"></span></div>' +
          '<div class="campo"><label for="rec-repetir">Repetir contraseña</label>' +
          '<input type="password" id="rec-repetir" placeholder="Repite la contraseña"><span class="error"></span></div></div>',
        acciones: '<button class="btn btn-claro" type="button" data-cerrar>Cancelar</button>' +
          '<button class="btn btn-primario" type="button" id="rec-cambiar">Guardar contraseña</button>'
      });
      document.getElementById('rec-cambiar').addEventListener('click', function () {
        const nueva = document.getElementById('rec-nueva').value;
        const repetir = document.getElementById('rec-repetir').value;
        if (nueva.length < 6) {
          window.Notificaciones.error('Contraseña débil', 'Debe tener al menos 6 caracteres.');
          return;
        }
        if (nueva !== repetir) {
          window.Notificaciones.error('No coinciden', 'Las contraseñas ingresadas no coinciden.');
          return;
        }
        window.Auth.cambiarPassword(estado.correo, nueva);
        window.Modal.cerrar();
        campoCorreo.value = estado.correo;
        window.Notificaciones.exito('Contraseña actualizada', 'Ya puedes iniciar sesión con tu nueva contraseña.');
      });
    }

    document.getElementById('btn-recuperar').addEventListener('click', pasoCorreo);
  });
})();
