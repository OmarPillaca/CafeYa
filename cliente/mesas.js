/* ============================================================
   CafeYa Ica - Mapa de mesas y códigos QR demostrativos
   ============================================================ */
(function () {
  'use strict';

  const filtros = { zona: 'todas', wifi: false, enchufe: false, silenciosa: false, capacidad: 'todas' };
  let contenido = null;

  function mesas() { return window.Almacen.listar('mesas'); }

  function mesasFiltradas() {
    return mesas().filter(function (mesa) {
      if (filtros.zona !== 'todas' && mesa.zona !== filtros.zona) return false;
      if (filtros.wifi && !mesa.wifi) return false;
      if (filtros.enchufe && !mesa.enchufe) return false;
      if (filtros.silenciosa && !mesa.silenciosa) return false;
      if (filtros.capacidad !== 'todas') {
        if (filtros.capacidad === '2' && mesa.capacidad > 2) return false;
        if (filtros.capacidad === '4' && mesa.capacidad > 4) return false;
        if (filtros.capacidad === '6' && mesa.capacidad < 6) return false;
      }
      return true;
    });
  }

  function qrUrl(mesa) {
    const enlace = new URL('menu.html?mesa=' + encodeURIComponent(mesa.numero), location.href).href;
    return 'https://api.qrserver.com/v1/create-qr-code/?size=230x230&margin=6&data=' + encodeURIComponent(enlace);
  }

  function tarjetaMesa(mesa) {
    const iconos = [];
    if (mesa.wifi) iconos.push('<span title="Wi-Fi">' + window.Util.svg('wifi') + '</span>');
    if (mesa.enchufe) iconos.push('<span title="Enchufe">' + window.Util.svg('enchufe') + '</span>');
    if (mesa.silenciosa) iconos.push('<span title="Zona silenciosa">🔇</span>');
    return '<article class="mesa-card ' + mesa.estado + '" data-mesa="' + mesa.id + '">' +
      '<span class="estado-mini"></span>' +
      '<div class="numero">' + window.Util.esc(mesa.numero) + '</div>' +
      '<div class="capacidad">' + mesa.capacidad + ' personas · ' + window.Util.esc(mesa.zona) + '</div>' +
      '<div class="caracteristicas">' + iconos.join('') + '</div>' +
      '<div class="qr-hint">' + window.Util.svg('qr') + ' Ver QR de la mesa</div>' +
    '</article>';
  }

  function renderMapa() {
    const zona = document.getElementById('mapa-mesas');
    if (!zona) return;
    const lista = mesasFiltradas();
    if (!lista.length) {
      zona.innerHTML = window.Util.vacio('Sin mesas con esos filtros', 'Prueba con otras características.');
      return;
    }
    const zonas = [];
    lista.forEach(function (mesa) {
      if (zonas.indexOf(mesa.zona) === -1) zonas.push(mesa.zona);
    });
    zona.innerHTML = zonas.map(function (nombreZona) {
      const grupo = lista.filter(function (m) { return m.zona === nombreZona; });
      return '<div class="mesa-zona"><h3>' + window.Util.esc(nombreZona) + ' · ' + grupo.length + ' mesa(s)</h3>' +
        '<div class="mesas-grid">' + grupo.map(tarjetaMesa).join('') + '</div></div>';
    }).join('');

    Array.prototype.forEach.call(zona.querySelectorAll('[data-mesa]'), function (elemento) {
      elemento.addEventListener('click', function () { abrirMesa(elemento.dataset.mesa); });
    });
  }

  function abrirMesa(mesaId) {
    const mesa = window.Almacen.buscar('mesas', mesaId);
    if (!mesa) return;
    const reservasHoy = window.Reservas.deMesa(mesa.id, window.Util.hoyISO());
    const caja = window.Modal.abrir({
      titulo: 'Mesa ' + mesa.numero,
      subtitulo: mesa.zona + ' · ' + mesa.capacidad + ' personas',
      emoji: '🪑',
      tamano: 'mediano',
      cuerpo:
        '<div class="mesa-detalle-cabecera">' +
          '<div class="numero">' + window.Util.esc(mesa.numero) + '</div>' +
          '<div><h3>' + window.Util.esc(mesa.descripcion || 'Mesa CaféYa') + '</h3>' +
            '<p>' + window.Util.badge(mesa.estado) + '</p></div>' +
        '</div>' +
        '<div class="mesa-caracteristicas">' +
          (mesa.wifi ? '<span>' + window.Util.svg('wifi') + ' Wi-Fi</span>' : '') +
          (mesa.enchufe ? '<span>' + window.Util.svg('enchufe') + ' Enchufe</span>' : '') +
          (mesa.silenciosa ? '<span>🔇 Zona silenciosa</span>' : '') +
          '<span>' + window.Util.svg('usuarios') + ' ' + mesa.capacidad + ' personas</span>' +
        '</div>' +
        (reservasHoy.length
          ? '<div class="alerta aviso"><span class="alerta-icono">📅</span><div><strong>Reservas de hoy</strong>' +
            reservasHoy.map(function (r) { return r.hora + ' (' + r.personas + ' pers.)'; }).join(' · ') + '</div></div>'
          : '') +
        '<div class="mesa-qr"><img src="' + qrUrl(mesa) + '" alt="QR de la mesa ' + window.Util.esc(mesa.numero) + '" ' +
          'onerror="this.onerror=null;this.src=\'' + window.Util.placeholder('📱') + '\'">' +
          '<p>Escanea este QR demostrativo para abrir el menú identificando la mesa ' + window.Util.esc(mesa.numero) + '.</p></div>' +
        '<div class="alerta"><span class="alerta-icono">ℹ️</span><div>El QR abre el menú digital con la mesa ya identificada. ' +
          'El pedido se asociará automáticamente al confirmar el pago.</div></div>',
      acciones:
        '<button class="btn btn-claro" type="button" id="btn-descargar-qr">' + window.Util.svg('descargar') + ' Descargar QR</button>' +
        '<a class="btn btn-claro" href="menu.html?mesa=' + encodeURIComponent(mesa.numero) + '">Abrir menú</a>' +
        '<a class="btn btn-primario" href="reserva.html?mesa=' + encodeURIComponent(mesa.numero) + '">Reservar mesa</a>'
    });
    caja.querySelector('#btn-descargar-qr').addEventListener('click', function () {
      descargarQR(mesa);
    });
  }

  function descargarQR(mesa) {
    const url = qrUrl(mesa);
    const imagen = new Image();
    imagen.crossOrigin = 'anonymous';
    imagen.onload = function () {
      try {
        const lienzo = document.createElement('canvas');
        lienzo.width = 640;
        lienzo.height = 820;
        const ctx = lienzo.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, lienzo.width, lienzo.height);
        ctx.fillStyle = '#1F2461';
        ctx.fillRect(0, 0, lienzo.width, 110);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 34px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CaféYa Ica', lienzo.width / 2, 52);
        ctx.fillStyle = '#8FE3D4';
        ctx.font = '16px sans-serif';
        ctx.fillText('MENÚ DIGITAL · MESA ' + mesa.numero, lienzo.width / 2, 82);
        ctx.drawImage(imagen, 80, 150, 480, 480);
        ctx.fillStyle = '#222222';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText('Mesa ' + mesa.numero + ' · ' + mesa.zona, lienzo.width / 2, 680);
        ctx.fillStyle = '#555555';
        ctx.font = '17px sans-serif';
        ctx.fillText('Escanea para ver el menú y pedir desde tu mesa', lienzo.width / 2, 714);
        ctx.fillText('Wi-Fi: ' + (mesa.wifi ? 'Sí' : 'No') + ' · Enchufe: ' + (mesa.enchufe ? 'Sí' : 'No') +
          ' · Silenciosa: ' + (mesa.silenciosa ? 'Sí' : 'No'), lienzo.width / 2, 744);
        ctx.fillStyle = '#9AA0B5';
        ctx.font = '14px sans-serif';
        ctx.fillText('Código QR demostrativo · Proyecto académico', lienzo.width / 2, 788);
        const enlace = document.createElement('a');
        enlace.download = 'cafeya-qr-' + mesa.numero + '.png';
        enlace.href = lienzo.toDataURL('image/png');
        enlace.click();
        window.Notificaciones.exito('QR descargado', 'Imagen cafeya-qr-' + mesa.numero + '.png generada.');
      } catch (error) {
        respaldoQR(mesa);
      }
    };
    imagen.onerror = function () { respaldoQR(mesa); };
    imagen.src = url;
  }

  function respaldoQR(mesa) {
    const html = '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>QR ' + mesa.numero + '</title>' +
      '<style>body{font-family:system-ui,sans-serif;text-align:center;padding:40px;background:#F7F7F7}' +
      '.caja{background:#fff;max-width:420px;margin:0 auto;padding:30px;border-radius:20px;box-shadow:0 10px 30px rgba(0,0,0,.08)}' +
      'img{width:280px;height:280px}h1{color:#1F2461}p{color:#555}</style></head><body><div class="caja">' +
      '<h1>CaféYa Ica</h1><h2>Mesa ' + mesa.numero + '</h2><img src="' + qrUrl(mesa) + '" alt="QR">' +
      '<p>' + mesa.zona + ' · ' + mesa.capacidad + ' personas</p>' +
      '<p>Código QR demostrativo para la presentación académica</p></div></body></html>';
    window.Util.descargar('cafeya-qr-' + mesa.numero + '.html', html, 'text/html;charset=utf-8;');
    window.Notificaciones.exito('QR generado', 'Se descargó el código en formato HTML demostrativo.');
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenido = window.Shell.cliente({
      pagina: 'mesas',
      titulo: 'Mesas y códigos QR',
      subtitulo: 'Selecciona una mesa para ver su QR demostrativo',
      permitirInvitado: true
    });
    if (!contenido) return;

    const zonas = [];
    mesas().forEach(function (m) { if (zonas.indexOf(m.zona) === -1) zonas.push(m.zona); });
    const conteo = { libre: 0, ocupada: 0, reservada: 0, fuera: 0 };
    mesas().forEach(function (m) { conteo[m.estado] = (conteo[m.estado] || 0) + 1; });

    contenido.innerHTML =
      '<div class="mesas-resumen">' +
        '<span class="chip">🟢 ' + conteo.libre + ' libres</span>' +
        '<span class="chip">🔴 ' + conteo.ocupada + ' ocupadas</span>' +
        '<span class="chip">🟣 ' + conteo.reservada + ' reservadas</span>' +
        '<span class="chip">⚪ ' + conteo.fuera + ' fuera de servicio</span>' +
      '</div>' +
      '<div class="card mesas-filtros">' +
        '<select id="filtro-zona" aria-label="Filtrar por zona"><option value="todas">Todas las zonas</option>' +
          zonas.map(function (z) { return '<option value="' + window.Util.esc(z) + '">' + window.Util.esc(z) + '</option>'; }).join('') +
        '</select>' +
        '<select id="filtro-capacidad" aria-label="Capacidad"><option value="todas">Cualquier capacidad</option>' +
          '<option value="2">Hasta 2 personas</option><option value="4">Hasta 4 personas</option><option value="6">6 o más personas</option></select>' +
        '<label class="check"><input type="checkbox" id="filtro-wifi"> Wi-Fi</label>' +
        '<label class="check"><input type="checkbox" id="filtro-enchufe"> Enchufe</label>' +
        '<label class="check"><input type="checkbox" id="filtro-silenciosa"> Zona silenciosa</label>' +
      '</div>' +
      '<div id="mapa-mesas"></div>' +
      '<div class="leyenda-estados">' +
        '<span><i style="background:#00A88F"></i> Libre</span>' +
        '<span><i style="background:#B5503C"></i> Ocupada</span>' +
        '<span><i style="background:#6B3FA0"></i> Reservada</span>' +
        '<span><i style="background:#9AA0B5"></i> Fuera de servicio</span>' +
      '</div>' +
      '<div class="alerta mt-2"><span class="alerta-icono">📱</span><div><strong>Pedidos desde la mesa</strong>' +
        'Cada mesa cuenta con un QR único que abre el menú identificando el número de mesa. También puedes reservar una mesa desde aquí.</div></div>';

    renderMapa();

    document.getElementById('filtro-zona').addEventListener('change', function (e) {
      filtros.zona = e.target.value; renderMapa();
    });
    document.getElementById('filtro-capacidad').addEventListener('change', function (e) {
      filtros.capacidad = e.target.value; renderMapa();
    });
    ['wifi', 'enchufe', 'silenciosa'].forEach(function (clave) {
      document.getElementById('filtro-' + clave).addEventListener('change', function (e) {
        filtros[clave] = e.target.checked; renderMapa();
      });
    });
  });
})();
