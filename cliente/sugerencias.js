/* ============================================================
   CafeYa Ica - Buzón de sugerencias del cliente
   ============================================================ */
(function () {
  'use strict';

  let contenido = null;
  let calificacion = 0;
  let categoria = 'Atención';

  function render() {
    const usuario = window.Auth.usuarioActual();
    if (!usuario) return;
    const mias = window.Almacen.listar('sugerencias').filter(function (s) {
      return s.usuarioId === usuario.id;
    }).sort(function (a, b) { return new Date(b.fecha) - new Date(a.fecha); });
    const todas = window.Almacen.listar('sugerencias');
    const promedio = todas.length ? (todas.reduce(function (s, x) { return s + (Number(x.calificacion) || 0); }, 0) / todas.length).toFixed(1) : '0.0';

    contenido.innerHTML =
      '<div class="sug-grid">' +
        '<div class="card">' +
          '<div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('sugerencias') + '</div>' +
            '<div><h2>Envíanos tu sugerencia</h2><p>Tu opinión nos ayuda a mejorar cada visita</p></div></div></div>' +
          '<div class="sug-promedio">' + window.Util.svg('estrella') +
            '<div><strong>' + promedio + '</strong><span>Calificación promedio de ' + todas.length + ' sugerencia(s) en CaféYa</span></div></div>' +
          '<form id="form-sugerencia" novalidate>' +
            '<div class="form-grid">' +
              '<div class="campo"><label>Califica tu experiencia <span class="req">*</span></label>' +
                '<div class="estrellas-input" id="estrellas">' +
                  [1, 2, 3, 4, 5].map(function (n) {
                    return '<button type="button" data-estrella="' + n + '" aria-label="' + n + ' estrellas">★</button>';
                  }).join('') +
                '</div>' +
                '<span class="ayuda" id="texto-estrellas">Selecciona de 1 a 5 estrellas</span></div>' +
              '<div class="campo"><label>Categoría <span class="req">*</span></label>' +
                '<select id="sug-categoria">' +
                  ['Atención', 'Producto', 'Zona de estudio', 'Tiempo de espera', 'Pago', 'Otro'].map(function (opcion) {
                    return '<option' + (opcion === categoria ? ' selected' : '') + '>' + opcion + '</option>';
                  }).join('') + '</select></div>' +
              '<div class="campo"><label for="sug-comentario">Comentario <span class="req">*</span></label>' +
                '<textarea id="sug-comentario" maxlength="400" placeholder="Cuéntanos qué te gustó o qué podemos mejorar..."></textarea>' +
                '<span class="error"></span></div>' +
              '<button class="btn btn-primario btn-lg" type="submit">Enviar sugerencia</button>' +
            '</div>' +
          '</form>' +
          '<div class="alerta mt-2"><span class="alerta-icono">💬</span><div><strong>Tu opinión llega al panel administrativo</strong>' +
            'El equipo de marketing y atención al cliente revisa y responde las sugerencias desde el panel administrativo.</div></div>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('pedidos') + '</div>' +
            '<div><h2>Mis sugerencias</h2><p>Historial y respuestas del local</p></div></div>' +
            '<span class="badge sin-punto">' + mias.length + ' enviadas</span></div>' +
          (mias.length
            ? '<div class="sug-lista">' + mias.map(function (s) {
                return '<div class="sug-item"><div class="cabeza"><h4>' + window.Util.esc(s.categoria) + '</h4>' +
                  window.Util.badge(s.estado) + '</div>' +
                  '<div class="flex-between"><span class="small muted">' + window.Util.fechaHora(s.fecha) + '</span>' +
                    window.Util.estrella(s.calificacion) + '</div>' +
                  '<p>' + window.Util.esc(s.comentario) + '</p>' +
                  (s.respuesta ? '<div class="respuesta"><strong>Respuesta de CaféYa:</strong> ' + window.Util.esc(s.respuesta) + '</div>' : '') +
                '</div>';
              }).join('') + '</div>'
            : window.Util.vacio('Aún no enviaste sugerencias', 'Tu primera opinión aparecerá aquí con la respuesta del equipo.')) +
        '</div>' +
      '</div>';

    const estrellas = document.getElementById('estrellas');
    function pintarEstrellas() {
      Array.prototype.forEach.call(estrellas.querySelectorAll('[data-estrella]'), function (boton) {
        boton.classList.toggle('activa', Number(boton.dataset.estrella) <= calificacion);
      });
      document.getElementById('texto-estrellas').textContent = calificacion
        ? calificacion + ' de 5 estrellas seleccionadas'
        : 'Selecciona de 1 a 5 estrellas';
    }
    Array.prototype.forEach.call(estrellas.querySelectorAll('[data-estrella]'), function (boton) {
      boton.addEventListener('click', function () {
        calificacion = Number(boton.dataset.estrella);
        pintarEstrellas();
      });
    });
    pintarEstrellas();

    document.getElementById('form-sugerencia').addEventListener('submit', function (evento) {
      evento.preventDefault();
      const comentario = document.getElementById('sug-comentario').value.trim();
      const categoriaElegida = document.getElementById('sug-categoria').value;
      if (!calificacion) {
        window.Notificaciones.error('Calificación pendiente', 'Selecciona de 1 a 5 estrellas.');
        return;
      }
      if (comentario.length < 10) {
        window.Notificaciones.error('Comentario muy corto', 'Escribe al menos 10 caracteres.');
        return;
      }
      window.Almacen.crear('sugerencias', {
        usuarioId: usuario.id,
        cliente: usuario.nombre,
        correo: usuario.correo,
        calificacion: calificacion,
        categoria: categoriaElegida,
        comentario: comentario,
        estado: 'pendiente',
        respuesta: null,
        fecha: new Date().toISOString()
      });
      if (window.Notificaciones.push) {
        window.Notificaciones.push('Nueva sugerencia de ' + usuario.nombre,
          categoriaElegida + ' · ' + calificacion + ' estrellas', 'aviso');
      }
      window.Notificaciones.exito('¡Gracias por tu opinión!', 'Tu sugerencia fue registrada correctamente.');
      calificacion = 0;
      categoria = 'Otro';
      render();
      window.Shell.actualizarBadges();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenido = window.Shell.cliente({
      pagina: 'sugerencias',
      titulo: 'Buzón de sugerencias',
      subtitulo: 'Cuéntanos cómo mejorar tu experiencia'
    });
    if (!contenido) return;
    render();
  });
})();
