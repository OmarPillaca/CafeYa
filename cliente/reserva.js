/* ============================================================
   CafeYa Ica - Reserva de mesas
   ============================================================ */
(function () {
  'use strict';

  let contenido = null;
  let mesaElegida = '';

  function datos() {
    return {
      fecha: document.getElementById('res-fecha').value || window.Util.hoyISO(),
      hora: document.getElementById('res-hora').value,
      personas: Number(document.getElementById('res-personas').value) || 1,
      nota: document.getElementById('res-nota').value.trim()
    };
  }

  function motivo(mesa, fecha, hora, personas) {
    if (mesa.estado === 'fuera') return 'Fuera de servicio';
    if (personas > mesa.capacidad) return 'Capacidad ' + mesa.capacidad;
    const revision = window.Reservas.disponible(mesa.id, fecha, hora);
    if (!revision.ok) return 'Reservada';
    return '';
  }

  function renderMesas() {
    const contenedor = document.getElementById('lista-mesas');
    if (!contenedor) return;
    const valores = datos();
    contenedor.innerHTML = window.Almacen.listar('mesas').map(function (mesa) {
      const impedimento = motivo(mesa, valores.fecha, valores.hora, valores.personas);
      const activa = mesa.id === mesaElegida && !impedimento;
      return '<button type="button" class="mesa-opcion' + (activa ? ' seleccionada' : '') + (impedimento ? ' no-disponible' : '') + '" ' +
        'data-mesa="' + mesa.id + '"' + (impedimento ? ' disabled' : '') + '>' +
        '<div class="flex-between"><strong>' + window.Util.esc(mesa.numero) + '</strong>' +
          window.Util.badge(mesa.estado) + '</div>' +
        '<div class="small muted">' + mesa.capacidad + ' personas · ' + window.Util.esc(mesa.zona) + '</div>' +
        '<div class="mesa-rasgos">' + (mesa.wifi ? '📶' : '') + ' ' + (mesa.enchufe ? '🔌' : '') + ' ' + (mesa.silenciosa ? '🔇' : '') + '</div>' +
        '<div class="motivo' + (impedimento ? '' : ' ok') + '">' + (impedimento || 'Disponible') + '</div>' +
      '</button>';
    }).join('');
  }

  function renderMisReservas() {
    const contenedor = document.getElementById('mis-reservas');
    if (!contenedor) return;
    const usuario = window.Auth.usuarioActual();
    const reservas = window.Reservas.porUsuario(usuario.id).filter(function (r) { return r.estado !== 'cancelada'; });
    if (!reservas.length) {
      contenedor.innerHTML = window.Util.vacio('Sin reservas activas', 'Tu primera reserva aparecerá aquí.');
      return;
    }
    contenedor.innerHTML = reservas.map(function (reserva) {
      const mesa = window.Almacen.buscar('mesas', reserva.mesaId) || {};
      const fecha = new Date(reserva.fecha + 'T12:00:00');
      return '<div class="reserva-item">' +
        '<div class="fecha-caja"><strong>' + fecha.getDate() + '</strong>' +
          '<span>' + fecha.toLocaleDateString('es-PE', { month: 'short' }).replace('.', '') + '</span></div>' +
        '<div><h4>Mesa ' + window.Util.esc(mesa.numero || '—') + ' · ' + reserva.hora + '</h4>' +
          '<p>' + reserva.personas + ' personas · ' + window.Util.esc(mesa.zona || '') + '</p>' +
          '<div style="margin-top:4px">' + window.Util.badge(reserva.estado) + '</div></div>' +
        '<div class="acciones"><button class="btn btn-sm btn-peligro" type="button" data-cancelar-reserva="' +
          reserva.id + '">Cancelar</button></div>' +
      '</div>';
    }).join('');
  }

  function construir() {
    const horas = window.Util.slots();
    const ahora = new Date();
    const minutos = ahora.getHours() * 60 + ahora.getMinutes();
    let horaInicial = horas[0];
    const futuras = horas.filter(function (hora) {
      const partes = hora.split(':');
      return (parseInt(partes[0], 10) * 60 + parseInt(partes[1], 10)) > minutos + 30;
    });
    if (futuras.length) horaInicial = futuras[0];

    contenido.innerHTML =
      '<div class="reserva-grid">' +
        '<div class="card reserva-form">' +
          '<div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('calendario') + '</div>' +
            '<div><h2>Nueva reserva</h2><p>Elige fecha, horario y mesa disponible</p></div></div></div>' +
          '<div class="form-grid">' +
            '<div class="form-grid tres">' +
              '<div class="campo"><label for="res-fecha">Fecha <span class="req">*</span></label>' +
                '<input type="date" id="res-fecha" min="' + window.Util.hoyISO() + '" value="' + window.Util.hoyISO() + '"></div>' +
              '<div class="campo"><label for="res-hora">Hora <span class="req">*</span></label>' +
                '<select id="res-hora">' + horas.map(function (hora) {
                  return '<option value="' + hora + '"' + (hora === horaInicial ? ' selected' : '') + '>' + hora + '</option>';
                }).join('') + '</select></div>' +
              '<div class="campo"><label for="res-personas">Personas <span class="req">*</span></label>' +
                '<select id="res-personas">' + [1, 2, 3, 4, 5, 6, 7, 8].map(function (n) {
                  return '<option value="' + n + '"' + (n === 2 ? ' selected' : '') + '>' + n + ' persona(s)</option>';
                }).join('') + '</select></div>' +
            '</div>' +
            '<div class="campo"><label>Mesas del local</label><div class="lista-mesas" id="lista-mesas"></div>' +
              '<span class="ayuda">Las mesas ocupadas o reservadas en ese horario no se pueden seleccionar.</span></div>' +
            '<div class="campo"><label for="res-nota">Nota para el local (opcional)</label>' +
              '<textarea id="res-nota" maxlength="150" placeholder="Ej. necesitamos enchufe, celebramos un cumpleaños..."></textarea></div>' +
            '<button class="btn btn-primario btn-block btn-lg" type="button" id="btn-reservar">Confirmar reserva</button>' +
          '</div>' +
          '<div class="alerta mt-2"><span class="alerta-icono">🪑</span><div><strong>Reserva demostrativa</strong>' +
            'La reserva queda en estado pendiente hasta que el administrador la confirme.</div></div>' +
        '</div>' +
        '<aside class="card">' +
          '<div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('reloj') + '</div>' +
            '<div><h2>Mis reservas</h2><p>Activas y pendientes</p></div></div></div>' +
          '<div id="mis-reservas"></div>' +
        '</aside>' +
      '</div>';

    renderMesas();
    renderMisReservas();

    const zonaMesas = document.getElementById('lista-mesas');
    zonaMesas.addEventListener('click', function (evento) {
      const boton = evento.target.closest('[data-mesa]');
      if (!boton) return;
      mesaElegida = boton.dataset.mesa;
      renderMesas();
    });

    ['res-fecha', 'res-hora', 'res-personas'].forEach(function (id) {
      document.getElementById(id).addEventListener('change', function () {
        if (mesaElegida) {
          const mesa = window.Almacen.buscar('mesas', mesaElegida);
          if (mesa && motivo(mesa, datos().fecha, datos().hora, datos().personas)) mesaElegida = '';
        }
        renderMesas();
      });
    });

    document.getElementById('btn-reservar').addEventListener('click', function () {
      const valores = datos();
      if (!mesaElegida) {
        window.Notificaciones.error('Mesa pendiente', 'Selecciona una mesa disponible del mapa.');
        return;
      }
      const resultado = window.Reservas.crear({
        mesaId: mesaElegida,
        fecha: valores.fecha,
        hora: valores.hora,
        personas: valores.personas,
        nota: valores.nota
      });
      if (!resultado.ok) {
        window.Notificaciones.error('No se pudo reservar', resultado.error);
        return;
      }
      mesaElegida = '';
      document.getElementById('res-nota').value = '';
      window.Notificaciones.exito('Reserva registrada',
        'Mesa ' + resultado.mesa.numero + ' · ' + window.Util.fecha(valores.fecha) + ' a las ' + valores.hora);
      renderMesas();
      renderMisReservas();
    });

    document.getElementById('mis-reservas').addEventListener('click', function (evento) {
      const boton = evento.target.closest('[data-cancelar-reserva]');
      if (!boton) return;
      window.Modal.confirmar({
        titulo: 'Cancelar reserva',
        mensaje: 'La mesa volverá a quedar disponible para ese horario. ¿Deseas continuar?',
        peligro: true,
        textoOk: 'Sí, cancelar'
      }).then(function (confirmado) {
        if (!confirmado) return;
        const resultado = window.Reservas.cancelar(boton.dataset.cancelarReserva);
        if (!resultado.ok) {
          window.Notificaciones.error('No se pudo cancelar', resultado.error);
          return;
        }
        window.Notificaciones.info('Reserva cancelada', 'La mesa fue liberada correctamente.');
        renderMesas();
        renderMisReservas();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenido = window.Shell.cliente({
      pagina: 'reserva',
      titulo: 'Reservar una mesa',
      subtitulo: 'Disponibilidad actualizada en tiempo real'
    });
    if (!contenido) return;

    const parametros = new URLSearchParams(location.search);
    const numero = parametros.get('mesa');
    if (numero) {
      const encontrada = window.Almacen.listar('mesas').find(function (m) { return m.numero === numero; });
      if (encontrada) mesaElegida = encontrada.id;
    }
    construir();
  });
})();
