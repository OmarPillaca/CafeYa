/* ============================================================
   CafeYa Ica - Administración de sugerencias
   ============================================================ */
(function () {
  'use strict';

  let contenido = null;
  const filtros = { estado: 'todos', calificacion: 'todas', busqueda: '' };

  function estrellas(valor) {
    let html = '<span class="estrellas">';
    for (let i = 1; i <= 5; i++) html += '<span class="' + (i <= valor ? '' : 'vacia') + '">★</span>';
    return html + '</span>';
  }

  function renderTabla() {
    const zona = document.getElementById('tabla-sugerencias');
    if (!zona) return;
    let lista = window.Almacen.listar('sugerencias').slice().sort(function (a, b) {
      return String(b.creadoEn).localeCompare(String(a.creadoEn));
    });
    if (filtros.estado !== 'todos') lista = lista.filter(function (s) { return (s.estado || 'pendiente') === filtros.estado; });
    if (filtros.calificacion !== 'todas') lista = lista.filter(function (s) { return Number(s.calificacion) === Number(filtros.calificacion); });
    lista = window.AdminUI.filtrar(lista, filtros.busqueda, ['cliente', 'comentario', 'categoria']);

    zona.innerHTML = window.AdminUI.tabla({
      datos: lista,
      vacioTitulo: 'Sin sugerencias',
      vacioTexto: 'No hay sugerencias que coincidan con los filtros.',
      columnas: [
        { titulo: 'Cliente', render: function (s) { return window.AdminUI.persona(s.cliente, window.Util.fechaHora(s.creadoEn), 'azul'); } },
        { titulo: 'Tipo', render: function (s) { return '<span class="sugerencia-tipo">' + window.Util.esc(s.categoria || 'General') + '</span>'; } },
        { titulo: 'Calificación', render: function (s) { return estrellas(Number(s.calificacion) || 0) + '<div class="small muted">' + (s.calificacion || 0) + '/5</div>'; } },
        { titulo: 'Comentario', render: function (s) {
          return '<div class="sugerencia-comentario"><strong>' + window.Util.esc(s.asunto || 'Sugerencia') + '</strong>' +
            window.Util.esc(s.comentario).slice(0, 110) + (s.comentario.length > 110 ? '…' : '') + '</div>';
        } },
        { titulo: 'Estado', render: function (s) { return window.Util.badge(s.estado === 'atendida' ? 'aprobado' : 'pendiente', s.estado === 'atendida' ? 'Atendida' : 'Pendiente'); } },
        { titulo: 'Acciones', render: function (s) {
          return '<div class="acciones-fila">' +
            '<button type="button" class="btn btn-sm btn-claro" data-ver="' + s.id + '">Abrir</button>' +
            (s.estado === 'atendida'
              ? '<button type="button" class="btn btn-sm btn-claro" data-pendiente="' + s.id + '">Reabrir</button>'
              : '<button type="button" class="btn btn-sm btn-teal" data-atender="' + s.id + '">Atender</button>') + '</div>';
        } }
      ]
    });
  }

  function abrirSugerencia(id) {
    const s = window.Almacen.buscar('sugerencias', id);
    const caja = window.Modal.abrir({
      titulo: 'Sugerencia de ' + s.cliente,
      subtitulo: window.Util.fechaHora(s.creadoEn) + ' · ' + (s.categoria || 'General'),
      emoji: '💬',
      cuerpo:
        '<div class="flex-between mb-1">' + estrellas(Number(s.calificacion) || 0) +
          window.Util.badge(s.estado === 'atendida' ? 'aprobado' : 'pendiente', s.estado === 'atendida' ? 'Atendida' : 'Pendiente') + '</div>' +
        '<p style="font-size:13.5px;color:var(--texto);line-height:1.65;background:#F8F9FD;border-radius:10px;padding:12px 14px">' +
          window.Util.esc(s.comentario) + '</p>' +
        (s.respuesta ? '<div class="sugerencia-respuesta"><strong>Respuesta registrada</strong>' + window.Util.esc(s.respuesta) + '</div>' : '') +
        '<div class="campo mt-2"><label for="su-respuesta">Respuesta del equipo</label>' +
          '<textarea id="su-respuesta" rows="3" maxlength="300" placeholder="Escribe la respuesta que se mostrará al cliente...">' +
          window.Util.esc(s.respuesta || '') + '</textarea></div>',
      acciones: '<button class="btn btn-claro" type="button" data-cerrar>Cerrar</button>' +
        '<button class="btn btn-primario" type="button" id="su-guardar">Guardar y marcar atendida</button>'
    });
    caja.querySelector('#su-guardar').addEventListener('click', function () {
      const respuesta = caja.querySelector('#su-respuesta').value.trim();
      if (respuesta.length < 5) {
        window.Notificaciones.error('Respuesta incompleta', 'Escribe una respuesta de al menos 5 caracteres.');
        return;
      }
      window.Almacen.actualizar('sugerencias', s.id, {
        respuesta: respuesta,
        estado: 'atendida',
        atendidoEn: new Date().toISOString()
      });
      window.Modal.cerrar();
      window.Notificaciones.exito('Sugerencia atendida', 'La respuesta quedó registrada.');
      renderTabla();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenido = window.AdminUI.montar({
      pagina: 'sugerencias-admin',
      titulo: 'Sugerencias',
      subtitulo: 'Opiniones, calificaciones y respuestas'
    });
    if (!contenido) return;

    const todas = window.Almacen.listar('sugerencias');
    const pendientes = todas.filter(function (s) { return (s.estado || 'pendiente') !== 'atendida'; }).length;
    const promedio = todas.length
      ? (todas.reduce(function (suma, s) { return suma + (Number(s.calificacion) || 0); }, 0) / todas.length).toFixed(1)
      : '0.0';

    contenido.innerHTML =
      '<div class="grid grid-4">' +
        window.AdminUI.stat(todas.length, 'Sugerencias recibidas', 'sugerencias', '') +
        window.AdminUI.stat(pendientes, 'Pendientes de atender', 'reloj', 'terracota') +
        window.AdminUI.stat(todas.length - pendientes, 'Atendidas', 'check', 'menta') +
        window.AdminUI.stat(promedio, 'Calificación promedio', 'estrella', 'azul') +
      '</div>' +
      '<div class="sugerencias-promedio mt-2"><strong>' + promedio + '</strong>' +
        estrellas(Math.round(Number(promedio))) +
        '<p>Promedio de satisfacción de ' + todas.length + ' sugerencia(s) registradas por los clientes.</p></div>' +
      '<div class="card">' +
        '<div class="panel-filtros">' +
          '<div class="buscador grow">' + window.Util.svg('buscar') +
            '<input id="su-buscar" type="search" placeholder="Buscar por cliente o comentario..."></div>' +
          '<select id="su-estado"><option value="todos">Todos los estados</option>' +
            '<option value="pendiente">Pendientes</option><option value="atendida">Atendidas</option></select>' +
          '<select id="su-calificacion"><option value="todas">Todas las calificaciones</option>' +
            [5, 4, 3, 2, 1].map(function (n) { return '<option value="' + n + '">' + n + ' estrella(s)</option>'; }).join('') + '</select>' +
        '</div>' +
        '<div id="tabla-sugerencias"></div>' +
      '</div>';

    document.getElementById('su-buscar').addEventListener('input', window.Util.debounce(function (e) {
      filtros.busqueda = e.target.value; renderTabla();
    }, 220));
    document.getElementById('su-estado').addEventListener('change', function (e) {
      filtros.estado = e.target.value; renderTabla();
    });
    document.getElementById('su-calificacion').addEventListener('change', function (e) {
      filtros.calificacion = e.target.value; renderTabla();
    });

    contenido.addEventListener('click', function (evento) {
      const ver = evento.target.closest('[data-ver]');
      if (ver) { abrirSugerencia(ver.dataset.ver); return; }
      const atender = evento.target.closest('[data-atender]');
      if (atender) { abrirSugerencia(atender.dataset.atender); return; }
      const pendiente = evento.target.closest('[data-pendiente]');
      if (pendiente) {
        window.Almacen.actualizar('sugerencias', pendiente.dataset.pendiente, { estado: 'pendiente' });
        window.Notificaciones.info('Sugerencia reabierta', 'Volvió a la bandeja de pendientes.');
        renderTabla();
      }
    });

    renderTabla();
    window.Almacen.alCambiar(window.Util.debounce(renderTabla, 500));
  });
})();
