/* ============================================================
   CafeYa Ica - Administración de reservas
   ============================================================ */
(function () {
  'use strict';

  let contenido = null;
  const filtros = { estado: 'todos', fecha: '' };

  function renderTabla() {
    const zona = document.getElementById('tabla-reservas');
    if (!zona) return;
    let lista = window.Reservas.listar();
    if (filtros.estado !== 'todos') lista = lista.filter(function (r) { return r.estado === filtros.estado; });
    if (filtros.fecha) lista = lista.filter(function (r) { return r.fecha === filtros.fecha; });

    zona.innerHTML = window.AdminUI.tabla({
      datos: lista,
      vacioTitulo: 'Sin reservas',
      vacioTexto: 'No hay reservas con los filtros seleccionados.',
      columnas: [
        { titulo: 'Cliente', render: function (r) { return window.AdminUI.persona(r.cliente, r.celular || r.correo || '', 'azul'); } },
        { titulo: 'Mesa', render: function (r) {
          const mesa = window.Almacen.buscar('mesas', r.mesaId) || {};
          return '<span class="reserva-mesa">🪑 ' + window.Util.esc(mesa.numero || r.numeroMesa || '—') + '</span>' +
            '<div class="small muted">' + window.Util.esc(mesa.zona || '') + '</div>';
        } },
        { titulo: 'Fecha y hora', render: function (r) {
          return '<div class="reserva-fecha"><strong>' + window.Util.fecha(r.fecha) + '</strong>' + r.hora + ' · ' + r.personas + ' pers.</div>';
        } },
        { titulo: 'Nota', render: function (r) { return '<span class="small">' + window.Util.esc(r.nota || '—') + '</span>'; } },
        { titulo: 'Estado', render: function (r) { return window.Util.badge(r.estado); } },
        { titulo: 'Acciones', render: function (r) {
          let html = '<div class="acciones-fila">' +
            '<button type="button" class="btn btn-sm btn-claro" data-ver="' + r.id + '">Ver</button>';
          if (r.estado === 'pendiente') html += '<button type="button" class="btn btn-sm btn-teal" data-confirmar="' + r.id + '">Confirmar</button>';
          if (r.estado === 'pendiente' || r.estado === 'confirmada') {
            html += '<button type="button" class="btn btn-sm btn-peligro" data-cancelar="' + r.id + '">Cancelar</button>';
          }
          if (r.estado === 'confirmada') html += '<button type="button" class="btn btn-sm btn-azul" data-finalizar="' + r.id + '">Finalizar</button>';
          return html + '</div>';
        } }
      ]
    });
  }

  function verReserva(id) {
    const reserva = window.Reservas.porId(id);
    const mesa = window.Almacen.buscar('mesas', reserva.mesaId) || {};
    window.Modal.abrir({
      titulo: 'Reserva ' + window.Util.fecha(reserva.fecha),
      subtitulo: reserva.hora + ' · ' + reserva.personas + ' personas',
      emoji: '📅',
      cuerpo: window.Modal.detalleFilas([
        ['Cliente', reserva.cliente],
        ['Celular', reserva.celular || '—'],
        ['Correo', reserva.correo || '—'],
        ['Mesa', mesa.numero + ' · ' + mesa.zona],
        ['Capacidad', mesa.capacidad + ' personas'],
        ['Características', [mesa.wifi ? 'Wi-Fi' : '', mesa.enchufe ? 'Enchufe' : '', mesa.silenciosa ? 'Silenciosa' : ''].filter(Boolean).join(', ') || '—'],
        ['Nota', reserva.nota || 'Sin nota'],
        ['Estado', window.Util.etiqueta(reserva.estado)],
        ['Registrada', window.Util.fechaHora(reserva.creadoEn)]
      ]),
      acciones: '<button class="btn btn-primario" type="button" data-cerrar>Cerrar</button>'
    });
  }

  function cambiar(id, estado) {
    const resultado = window.Reservas.cambiarEstado(id, estado);
    if (!resultado.ok) {
      window.Notificaciones.error('No se pudo actualizar', resultado.error);
      return;
    }
    window.Notificaciones.exito('Reserva actualizada', 'Estado: ' + window.Util.etiqueta(estado));
    renderTabla();
    window.Shell.actualizarBadges();
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenido = window.AdminUI.montar({
      pagina: 'reservas-admin',
      titulo: 'Reservas',
      subtitulo: 'Confirma y administra las reservas de mesas'
    });
    if (!contenido) return;

    const est = window.Reservas.estadisticas();
    contenido.innerHTML =
      '<div class="grid grid-4">' +
        window.AdminUI.stat(est.total, 'Reservas registradas', 'calendario', '') +
        window.AdminUI.stat(est.pendientes, 'Pendientes de confirmar', 'reloj', 'terracota') +
        window.AdminUI.stat(est.confirmadas, 'Reservas confirmadas', 'check', 'menta') +
        window.AdminUI.stat(est.hoy, 'Reservas para hoy', 'mesas', 'azul') +
      '</div>' +
      '<div class="card mt-2">' +
        '<div class="panel-filtros">' +
          '<select id="r-estado"><option value="todos">Todos los estados</option>' +
            ['pendiente', 'confirmada', 'cancelada', 'finalizada'].map(function (estado) {
              return '<option value="' + estado + '">' + window.Util.etiqueta(estado) + '</option>';
            }).join('') + '</select>' +
          '<input type="date" id="r-fecha" aria-label="Filtrar por fecha">' +
          '<button type="button" class="btn btn-claro btn-sm" id="r-limpiar">Limpiar filtros</button>' +
        '</div>' +
        '<div id="tabla-reservas"></div>' +
      '</div>' +
      '<div class="reservas-nota mt-2"><span>ℹ️</span><div>Al confirmar una reserva para hoy, la mesa se marca como <strong>reservada</strong>. ' +
        'Al cancelarla, la mesa vuelve a estar libre si no tiene otras reservas activas.</div></div>';

    document.getElementById('r-estado').addEventListener('change', function (e) {
      filtros.estado = e.target.value; renderTabla();
    });
    document.getElementById('r-fecha').addEventListener('change', function (e) {
      filtros.fecha = e.target.value; renderTabla();
    });
    document.getElementById('r-limpiar').addEventListener('click', function () {
      filtros.estado = 'todos'; filtros.fecha = '';
      document.getElementById('r-estado').value = 'todos';
      document.getElementById('r-fecha').value = '';
      renderTabla();
    });

    contenido.addEventListener('click', function (evento) {
      const ver = evento.target.closest('[data-ver]');
      if (ver) { verReserva(ver.dataset.ver); return; }
      const confirmar = evento.target.closest('[data-confirmar]');
      if (confirmar) { cambiar(confirmar.dataset.confirmar, 'confirmada'); return; }
      const finalizar = evento.target.closest('[data-finalizar]');
      if (finalizar) { cambiar(finalizar.dataset.finalizar, 'finalizada'); return; }
      const cancelar = evento.target.closest('[data-cancelar]');
      if (cancelar) {
        window.Modal.confirmar({
          titulo: 'Cancelar reserva',
          mensaje: 'La mesa quedará disponible para ese horario.',
          peligro: true,
          textoOk: 'Sí, cancelar reserva'
        }).then(function (confirmado) {
          if (!confirmado) return;
          cambiar(cancelar.dataset.cancelar, 'cancelada');
        });
      }
    });

    renderTabla();
    window.Almacen.alCambiar(window.Util.debounce(renderTabla, 500));
  });
})();
