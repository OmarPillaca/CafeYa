/* ============================================================
   CafeYa Ica - Administración de mesas y QR
   ============================================================ */
(function () {
  'use strict';

  let contenido = null;
  const ESTADOS_MESA = ['libre', 'ocupada', 'reservada', 'fuera'];

  function render() {
    const mesas = window.Almacen.listar('mesas').slice().sort(function (a, b) {
      return String(a.numero).localeCompare(String(b.numero));
    });
    const conteo = { libre: 0, ocupada: 0, reservada: 0, fuera: 0 };
    mesas.forEach(function (m) { conteo[m.estado] = (conteo[m.estado] || 0) + 1; });

    contenido.innerHTML =
      '<div class="mesas-admin-resumen">' +
        '<span><strong>' + mesas.length + '</strong> mesas en total</span>' +
        '<span><strong>' + conteo.libre + '</strong> libres</span>' +
        '<span><strong>' + conteo.ocupada + '</strong> ocupadas</span>' +
        '<span><strong>' + conteo.reservada + '</strong> reservadas</span>' +
        '<span><strong>' + conteo.fuera + '</strong> fuera de servicio</span>' +
      '</div>' +
      '<div class="card">' +
        '<div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('mesas') + '</div>' +
          '<div><h2>Mapa de mesas</h2><p>Capacidad, características, disponibilidad y QR</p></div></div>' +
          '<button type="button" class="btn btn-primario btn-sm" id="btn-nueva-mesa">+ Nueva mesa</button></div>' +
        '<div class="mesas-admin-grid">' + mesas.map(tarjeta).join('') + '</div>' +
      '</div>' +
      '<div class="alerta mt-2"><span class="alerta-icono">📱</span><div><strong>Códigos QR</strong>' +
        'Cada mesa tiene un QR demostrativo que abre el menú con el número de mesa identificado. Puedes descargarlo desde el botón QR.</div></div>';

    document.getElementById('btn-nueva-mesa').addEventListener('click', function () { formulario(null); });

    contenido.addEventListener('change', function (evento) {
      const selector = evento.target.closest('[data-estado]');
      if (!selector) return;
      window.Almacen.actualizar('mesas', selector.dataset.estado, { estado: selector.value });
      window.Notificaciones.info('Estado actualizado', 'La mesa quedó ' + window.Util.etiqueta(selector.value) + '.');
      render();
    });

    contenido.addEventListener('click', function (evento) {
      const editar = evento.target.closest('[data-editar]');
      if (editar) { formulario(window.Almacen.buscar('mesas', editar.dataset.editar)); return; }
      const qr = evento.target.closest('[data-qr]');
      if (qr) { verQR(window.Almacen.buscar('mesas', qr.dataset.qr)); return; }
      const eliminar = evento.target.closest('[data-eliminar]');
      if (eliminar) {
        const mesa = window.Almacen.buscar('mesas', eliminar.dataset.eliminar);
        const reservas = window.Reservas.listar().filter(function (r) {
          return r.mesaId === mesa.id && (r.estado === 'pendiente' || r.estado === 'confirmada');
        });
        if (reservas.length) {
          window.Notificaciones.error('Mesa con reservas', 'Cancela las reservas activas antes de eliminar la mesa.');
          return;
        }
        window.Modal.confirmar({
          titulo: 'Eliminar mesa',
          mensaje: 'Se eliminará la mesa ' + mesa.numero + ' y su código QR.',
          peligro: true,
          textoOk: 'Sí, eliminar'
        }).then(function (confirmado) {
          if (!confirmado) return;
          window.Almacen.eliminar('mesas', mesa.id);
          render();
          window.Notificaciones.exito('Mesa eliminada', mesa.numero);
        });
      }
    });
  }

  function tarjeta(mesa) {
    return '<article class="mesa-admin-card ' + mesa.estado + '">' +
      '<div class="flex-between"><span class="numero">' + window.Util.esc(mesa.numero) + '</span>' +
        window.Util.badge(mesa.estado) + '</div>' +
      '<div class="datos">' + mesa.capacidad + ' personas · ' + window.Util.esc(mesa.zona) + '</div>' +
      '<div class="mesa-rasgos">' + (mesa.wifi ? '📶' : '') + ' ' + (mesa.enchufe ? '🔌' : '') + ' ' + (mesa.silenciosa ? '🔇' : '') + '</div>' +
      '<select data-estado="' + mesa.id + '" aria-label="Cambiar estado de la mesa">' +
        ESTADOS_MESA.map(function (estado) {
          return '<option value="' + estado + '"' + (mesa.estado === estado ? ' selected' : '') + '>' + window.Util.etiqueta(estado) + '</option>';
        }).join('') + '</select>' +
      '<div class="acciones-fila">' +
        '<button type="button" class="btn btn-claro" data-qr="' + mesa.id + '">QR</button>' +
        '<button type="button" class="btn btn-claro" data-editar="' + mesa.id + '">Editar</button>' +
        '<button type="button" class="btn btn-peligro" data-eliminar="' + mesa.id + '">Eliminar</button>' +
      '</div></article>';
  }

  function qrUrl(mesa) {
    const enlace = new URL('../cliente/menu.html?mesa=' + encodeURIComponent(mesa.numero), location.href).href;
    return 'https://api.qrserver.com/v1/create-qr-code/?size=230x230&margin=6&data=' + encodeURIComponent(enlace);
  }

  function verQR(mesa) {
    const caja = window.Modal.abrir({
      titulo: 'QR de la mesa ' + mesa.numero,
      subtitulo: 'Menú digital con mesa identificada',
      emoji: '📱',
      cuerpo: '<div class="mesa-qr" style="text-align:center;background:#F8F9FD;border:1px dashed var(--borde);border-radius:14px;padding:16px">' +
        '<img src="' + qrUrl(mesa) + '" alt="QR mesa ' + mesa.numero + '" style="width:200px;height:200px;margin:0 auto 10px;background:#fff;padding:6px;border-radius:8px" ' +
        'onerror="this.onerror=null;this.src=\'' + window.Util.placeholder('📱') + '\'">' +
        '<p class="small muted">Al escanear se abre <strong>cliente/menu.html?mesa=' + window.Util.esc(mesa.numero) + '</strong></p></div>',
      acciones: '<button class="btn btn-claro" type="button" data-cerrar>Cerrar</button>' +
        '<button class="btn btn-primario" type="button" id="btn-descargar">Descargar QR</button>'
    });
    caja.querySelector('#btn-descargar').addEventListener('click', function () {
      const imagen = new Image();
      imagen.crossOrigin = 'anonymous';
      imagen.onload = function () {
        try {
          const lienzo = document.createElement('canvas');
          lienzo.width = 640;
          lienzo.height = 780;
          const ctx = lienzo.getContext('2d');
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, 640, 780);
          ctx.fillStyle = '#1F2461';
          ctx.fillRect(0, 0, 640, 100);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 32px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('CaféYa Ica', 320, 48);
          ctx.fillStyle = '#8FE3D4';
          ctx.font = '16px sans-serif';
          ctx.fillText('MESA ' + mesa.numero, 320, 76);
          ctx.drawImage(imagen, 90, 140, 460, 460);
          ctx.fillStyle = '#222222';
          ctx.font = 'bold 26px sans-serif';
          ctx.fillText('Mesa ' + mesa.numero + ' · ' + mesa.zona, 320, 650);
          ctx.fillStyle = '#555555';
          ctx.font = '16px sans-serif';
          ctx.fillText('Escanea para abrir el menú y pedir desde tu mesa', 320, 684);
          ctx.fillStyle = '#9AA0B5';
          ctx.font = '13px sans-serif';
          ctx.fillText('Código QR demostrativo · Proyecto académico', 320, 740);
          const enlace = document.createElement('a');
          enlace.download = 'cafeya-qr-' + mesa.numero + '.png';
          enlace.href = lienzo.toDataURL('image/png');
          enlace.click();
          window.Notificaciones.exito('QR descargado', 'cafeya-qr-' + mesa.numero + '.png');
        } catch (error) {
          window.Notificaciones.aviso('Descarga no disponible', 'Abre la imagen del QR en una nueva pestaña para guardarla.');
        }
      };
      imagen.onerror = function () {
        window.Notificaciones.aviso('QR generado en línea', 'La descarga requiere conexión. Puedes presentar el código en pantalla.');
      };
      imagen.src = qrUrl(mesa);
    });
  }

  function formulario(mesa) {
    const esNueva = !mesa;
    const datos = mesa || { numero: '', capacidad: 2, zona: 'Salón', wifi: true, enchufe: false, silenciosa: false, estado: 'libre', descripcion: '' };
    const caja = window.Modal.abrir({
      titulo: esNueva ? 'Nueva mesa' : 'Editar mesa ' + datos.numero,
      subtitulo: 'Capacidad y características de la mesa',
      emoji: '🪑',
      cuerpo:
        '<div class="form-grid">' +
          '<div class="form-grid dos">' +
            '<div class="campo"><label for="ma-numero">Número / código <span class="req">*</span></label>' +
              '<input id="ma-numero" value="' + window.Util.esc(datos.numero) + '" maxlength="8" placeholder="M13"></div>' +
            '<div class="campo"><label for="ma-capacidad">Capacidad <span class="req">*</span></label>' +
              '<input type="number" id="ma-capacidad" min="1" max="20" value="' + datos.capacidad + '"></div>' +
          '</div>' +
          '<div class="form-grid dos">' +
            '<div class="campo"><label for="ma-zona">Zona</label>' +
              '<select id="ma-zona">' + ['Salón', 'Ventana', 'Terraza', 'Zona estudio', 'Barra'].map(function (zona) {
                return '<option' + (datos.zona === zona ? ' selected' : '') + '>' + zona + '</option>';
              }).join('') + '</select></div>' +
            '<div class="campo"><label for="ma-estado">Disponibilidad</label>' +
              '<select id="ma-estado">' + ESTADOS_MESA.map(function (estado) {
                return '<option value="' + estado + '"' + (datos.estado === estado ? ' selected' : '') + '>' + window.Util.etiqueta(estado) + '</option>';
              }).join('') + '</select></div>' +
          '</div>' +
          '<div class="campo"><label for="ma-descripcion">Descripción</label>' +
            '<input id="ma-descripcion" value="' + window.Util.esc(datos.descripcion || '') + '" maxlength="90"></div>' +
          '<div>' +
            '<label class="check"><input type="checkbox" id="ma-wifi"' + (datos.wifi ? ' checked' : '') + '> Wi-Fi disponible</label>' +
            '<label class="check"><input type="checkbox" id="ma-enchufe"' + (datos.enchufe ? ' checked' : '') + '> Enchufe individual</label>' +
            '<label class="check"><input type="checkbox" id="ma-silenciosa"' + (datos.silenciosa ? ' checked' : '') + '> Zona silenciosa</label>' +
          '</div>' +
        '</div>',
      acciones: '<button class="btn btn-claro" type="button" data-cerrar>Cancelar</button>' +
        '<button class="btn btn-primario" type="button" id="ma-guardar">Guardar mesa</button>'
    });
    caja.querySelector('#ma-guardar').addEventListener('click', function () {
      const numero = caja.querySelector('#ma-numero').value.trim().toUpperCase();
      const capacidad = Number(caja.querySelector('#ma-capacidad').value);
      if (numero.length < 2) { window.Notificaciones.error('Número inválido', 'Ingresa un número o código de mesa.'); return; }
      if (!capacidad || capacidad < 1) { window.Notificaciones.error('Capacidad inválida', 'La capacidad debe ser mayor a cero.'); return; }
      const cambios = {
        numero: numero,
        capacidad: capacidad,
        zona: caja.querySelector('#ma-zona').value,
        estado: caja.querySelector('#ma-estado').value,
        descripcion: caja.querySelector('#ma-descripcion').value.trim(),
        wifi: caja.querySelector('#ma-wifi').checked,
        enchufe: caja.querySelector('#ma-enchufe').checked,
        silenciosa: caja.querySelector('#ma-silenciosa').checked
      };
      if (esNueva) window.Almacen.crear('mesas', cambios);
      else window.Almacen.actualizar('mesas', datos.id, cambios);
      window.Modal.cerrar();
      window.Notificaciones.exito(esNueva ? 'Mesa creada' : 'Mesa actualizada', 'Mesa ' + numero);
      render();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenido = window.AdminUI.montar({
      pagina: 'mesas-admin',
      titulo: 'Mesas y QR',
      subtitulo: 'Ocupación, características y códigos QR'
    });
    if (!contenido) return;
    render();
    window.Almacen.alCambiar(window.Util.debounce(render, 500));
  });
})();
