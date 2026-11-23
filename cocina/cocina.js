/* ============================================================
   CafeYa Ica - Panel de cocina / comandas (demostrativo)
   ============================================================ */
(function () {
  'use strict';

  let tablero = null;
  let busqueda = '';
  let sonidoActivo = true;
  let ultimoConteo = null;

  const COLUMNAS = [
    { estado: 'recibido', titulo: 'Recibido', emoji: '📥', accion: 'Iniciar preparación', siguiente: 'preparacion', clase: 'recibido', boton: 'primario' },
    { estado: 'preparacion', titulo: 'En preparación', emoji: '🔥', accion: 'Marcar listo', siguiente: 'listo', clase: 'preparacion', boton: 'teal' },
    { estado: 'listo', titulo: 'Listo para recoger', emoji: '✅', accion: 'Entregar', siguiente: 'entregado', clase: 'listo', boton: 'primario' }
  ];

  function minutos(pedido) {
    return window.Util.minutosEntre(pedido.creadoEn, new Date().toISOString());
  }

  function nivel(minutosTranscurridos, objetivo) {
    if (minutosTranscurridos > objetivo) return 'rojo';
    if (minutosTranscurridos > objetivo * 0.6) return 'ambar';
    return 'verde';
  }

  function pedidos() {
    const objetivo = window.Almacen.config().tiempoObjetivo || 8;
    return window.Pedidos.listar().filter(function (p) {
      return COLUMNAS.some(function (c) { return c.estado === p.estado; });
    }).sort(function (a, b) {
      return new Date(a.creadoEn) - new Date(b.creadoEn);
    }).filter(function (p) {
      if (!busqueda) return true;
      const texto = busqueda.toLowerCase();
      return String(p.codigo).toLowerCase().indexOf(texto) > -1 ||
        String(p.clienteNombre || '').toLowerCase().indexOf(texto) > -1;
    }).map(function (p) {
      return { pedido: p, min: minutos(p), nivel: nivel(minutos(p), objetivo) };
    });
  }

  function comandaHTML(entrada, columna) {
    const p = entrada.pedido;
    return '<article class="kds-comanda ' + entrada.nivel + '" data-pedido="' + p.id + '">' +
      '<div class="kds-comanda-top"><span class="codigo">' + window.Util.esc(p.codigo) + '</span>' +
        '<span class="kds-min">' + entrada.min + ' min</span></div>' +
      '<div class="kds-cliente"><span>' + window.Util.esc(p.clienteNombre || 'Cliente') + '</span>' +
        '<span>' + window.Util.hora(p.creadoEn) + '</span></div>' +
      '<ul class="kds-items">' + (p.items || []).map(function (item) {
        return '<li><b>' + item.cantidad + 'x</b><span>' + window.Util.esc(item.nombre) +
          (item.observacion ? '<small>' + window.Util.esc(item.observacion) + '</small>' : '') + '</span></li>';
      }).join('') + '</ul>' +
      (p.observaciones ? '<div class="kds-observacion"><span>📝</span><span>' + window.Util.esc(p.observaciones) + '</span></div>' : '') +
      '<div class="kds-meta"><span>Recojo: ' + window.Util.esc(p.horaRecojoTexto || (p.horaRecojo ? window.Util.hora(p.horaRecojo) : '—')) + '</span>' +
        window.Util.badge(p.estadoPago === 'aprobado' ? 'aprobado' : 'pendiente', p.estadoPago === 'aprobado' ? 'Pagado' : 'Pago pendiente') + '</div>' +
      '<div class="kds-acciones-comanda">' +
        '<button type="button" data-detalle="' + p.id + '">Detalle</button>' +
        '<button type="button" class="' + columna.boton + '" data-avanzar="' + p.id + '">' + columna.accion + '</button>' +
      '</div></article>';
  }

  function entregadosHoy() {
    const hoy = window.Util.hoyISO();
    return window.Pedidos.listar().filter(function (p) {
      return p.estado === 'entregado' && window.Util.isoDia(p.entregadoEn || p.creadoEn) === hoy;
    }).slice(0, 8);
  }

  function render() {
    const lista = pedidos();
    const todos = window.Pedidos.listar();
    const objetivo = window.Almacen.config().tiempoObjetivo || 8;

    const kpis = [
      { emoji: '📥', valor: todos.filter(function (p) { return p.estado === 'recibido'; }).length, texto: 'Por iniciar' },
      { emoji: '🔥', valor: todos.filter(function (p) { return p.estado === 'preparacion'; }).length, texto: 'En preparación' },
      { emoji: '✅', valor: todos.filter(function (p) { return p.estado === 'listo'; }).length, texto: 'Listos' },
      { emoji: '⏱️', valor: (function () {
        const activos = todos.filter(function (p) { return p.estado === 'preparacion'; });
        if (!activos.length) return '0 min';
        const promedio = Math.round(activos.reduce(function (s, p) { return s + minutos(p); }, 0) / activos.length);
        return promedio + ' min';
      })(), texto: 'Espera promedio' },
      { emoji: '🎯', valor: objetivo + ' min', texto: 'Objetivo' },
      { emoji: '📦', valor: entregadosHoy().length, texto: 'Entregados hoy' }
    ];

    document.getElementById('kds-resumen').innerHTML = kpis.map(function (k) {
      return '<div class="kds-kpi"><span class="emoji">' + k.emoji + '</span><div><strong>' + k.valor +
        '</strong><span>' + k.texto + '</span></div></div>';
    }).join('');

    tablero.innerHTML = COLUMNAS.map(function (columna) {
      const propias = lista.filter(function (e) { return e.pedido.estado === columna.estado; });
      return '<section class="kds-columna ' + columna.clase + '">' +
        '<div class="kds-columna-head"><h2>' + columna.emoji + ' ' + columna.titulo + '</h2>' +
          '<span class="cuenta">' + propias.length + '</span></div>' +
        '<div class="kds-lista">' +
          (propias.length
            ? propias.map(function (e) { return comandaHTML(e, columna); }).join('')
            : '<div class="kds-vacio">Sin comandas en este estado.<br>Los pedidos nuevos aparecen automáticamente.</div>') +
        '</div></section>';
    }).join('') +
      '<section class="kds-columna entregado">' +
        '<div class="kds-columna-head"><h2>📦 Entregados hoy</h2><span class="cuenta">' + entregadosHoy().length + '</span></div>' +
        '<div class="kds-lista">' +
          (entregadosHoy().length
            ? entregadosHoy().map(function (p) {
                return '<div class="kds-entrega-fila"><div><strong>' + window.Util.esc(p.codigo) + '</strong>' +
                  '<div><em>' + window.Util.esc(p.clienteNombre || '') + ' · ' + window.Util.hora(p.entregadoEn || p.creadoEn) + '</em></div></div>' +
                  '<span>' + window.Util.soles(p.total) + '</span></div>';
              }).join('')
            : '<div class="kds-vacio">Aún no hay pedidos entregados hoy.</div>') +
        '</div></section>';

    document.getElementById('kds-actualizado').textContent = 'Actualizado ' + window.Util.hora(new Date());
    revisarNuevos(todos);
  }

  function revisarNuevos(todos) {
    const pendientes = todos.filter(function (p) {
      return p.estado === 'recibido' || p.estado === 'preparacion';
    }).length;
    if (ultimoConteo !== null && pendientes > ultimoConteo && sonidoActivo) {
      sonar();
    }
    ultimoConteo = pendientes;
  }

  function sonar() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const contexto = new AudioCtx();
      const oscilador = contexto.createOscillator();
      const ganancia = contexto.createGain();
      oscilador.connect(ganancia);
      ganancia.connect(contexto.destination);
      oscilador.type = 'sine';
      oscilador.frequency.value = 880;
      ganancia.gain.value = 0.06;
      oscilador.start();
      setTimeout(function () { oscilador.stop(); contexto.close(); }, 160);
    } catch (error) { /* sin audio disponible */ }
  }

  function detalle(id) {
    const p = window.Pedidos.porId(id);
    if (!p) return;
    const historial = (p.historial || []).map(function (h) {
      return '<div class="detalle-linea"><span>' + window.Util.etiqueta(h.estado) + '</span>' +
        '<strong>' + window.Util.fechaHora(h.fecha) + '</strong></div>';
    }).join('');
    window.Modal.abrir({
      titulo: 'Comanda ' + p.codigo,
      subtitulo: (p.clienteNombre || '') + ' · ' + window.Util.etiqueta(p.estado),
      emoji: '🧾',
      cuerpo:
        '<div class="flex-between mb-1"><span class="small muted">' + window.Util.fechaHora(p.creadoEn) + '</span>' +
          window.Util.badge(p.estado) + '</div>' +
        '<div class="tabla-wrap"><table class="tabla"><thead><tr><th>Cant.</th><th>Producto</th><th>Obs.</th><th>Importe</th></tr></thead><tbody>' +
          (p.items || []).map(function (i) {
            return '<tr><td><strong>' + i.cantidad + '</strong></td><td>' + window.Util.esc(i.nombre) + '</td>' +
              '<td class="small">' + window.Util.esc(i.observacion || '—') + '</td>' +
              '<td>' + window.Util.soles(i.precio * i.cantidad) + '</td></tr>';
          }).join('') +
        '</tbody></table></div>' +
        '<div class="detalle-linea mt-2"><span>Total</span><strong>' + window.Util.soles(p.total) + '</strong></div>' +
        '<div class="detalle-linea"><span>Pago</span><strong>' + window.Util.metodoPago(p.metodoPago) + ' · ' + window.Util.etiqueta(p.estadoPago) + '</strong></div>' +
        '<div class="detalle-linea"><span>Recojo</span><strong>' + window.Util.esc(p.horaRecojoTexto || (p.horaRecojo ? window.Util.hora(p.horaRecojo) : '—')) + '</strong></div>' +
        (p.observaciones ? '<div class="alerta mt-2"><span class="alerta-icono">📝</span><div>' + window.Util.esc(p.observaciones) + '</div></div>' : '') +
        '<div class="mt-2"><strong class="small">Historial de estados</strong>' + historial + '</div>',
      acciones: '<button class="btn btn-primario" type="button" data-cerrar>Cerrar</button>'
    });
  }

  function avanzar(id) {
    const p = window.Pedidos.porId(id);
    if (!p) return;
    const mapa = { recibido: 'preparacion', preparacion: 'listo', listo: 'entregado' };
    const siguiente = mapa[p.estado];
    if (!siguiente) return;
    const resultado = window.Pedidos.cambiarEstado(id, siguiente);
    if (!resultado.ok) {
      window.Notificaciones.error('No se pudo actualizar', resultado.error);
      return;
    }
    window.Notificaciones.exito('Comanda ' + p.codigo, 'Estado: ' + window.Util.etiqueta(siguiente));
    render();
  }

  function reloj() {
    const ahora = new Date();
    const hora = document.getElementById('kds-hora');
    const fecha = document.getElementById('kds-fecha');
    if (hora) hora.textContent = ahora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });
    if (fecha) fecha.textContent = ahora.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const usuario = window.Auth.requiereAdmin(['administrador', 'gerencia', 'operaciones', 'cocina']);
    if (!usuario) return;

    tablero = document.getElementById('kds-tablero');
    if (!tablero) return;

    reloj();
    setInterval(reloj, 15000);
    render();
    setInterval(render, 30000);

    document.getElementById('kds-buscar').addEventListener('input', window.Util.debounce(function (e) {
      busqueda = e.target.value;
      render();
    }, 200));

    document.getElementById('kds-refrescar').addEventListener('click', function () {
      render();
      window.Notificaciones.info('Tablero actualizado', 'Se recargaron las comandas activas.');
    });

    const botonSonido = document.getElementById('kds-sonido');
    botonSonido.classList.add('activo');
    botonSonido.addEventListener('click', function () {
      sonidoActivo = !sonidoActivo;
      botonSonido.classList.toggle('activo', sonidoActivo);
      botonSonido.textContent = sonidoActivo ? '🔔' : '🔕';
      window.Notificaciones.info(sonidoActivo ? 'Avisos activados' : 'Avisos silenciados',
        sonidoActivo ? 'Se reproducirá un tono al ingresar una nueva comanda.' : 'No se reproducirán tonos.');
    });

    document.getElementById('kds-salir').addEventListener('click', function () {
      window.Modal.confirmar({
        titulo: 'Cerrar sesión',
        mensaje: '¿Deseas salir del panel de cocina?',
        textoOk: 'Sí, salir',
        peligro: true
      }).then(function (confirmado) {
        if (!confirmado) return;
        window.Auth.salir();
        window.location.href = '../administrador/login-admin.html';
      });
    });

    tablero.addEventListener('click', function (evento) {
      const avanzarBtn = evento.target.closest('[data-avanzar]');
      if (avanzarBtn) { avanzar(avanzarBtn.dataset.avanzar); return; }
      const detalleBtn = evento.target.closest('[data-detalle]');
      if (detalleBtn) { detalle(detalleBtn.dataset.detalle); return; }
      const fila = evento.target.closest('[data-pedido]');
      if (fila) detalle(fila.dataset.pedido);
    });

    window.Almacen.alCambiar(window.Util.debounce(render, 350));
  });
})();
