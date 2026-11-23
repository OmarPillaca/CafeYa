/* ============================================================
   CafeYa Ica - Historial, pagos y perfil del cliente
   ============================================================ */
(function () {
  'use strict';

  let contenido = null;
  let tab = 'pedidos';

  function renderCabecera(usuario) {
    const pedidos = window.Pedidos.porUsuario(usuario.id);
    const tarjeta = window.Fidelizacion.tarjeta(usuario.id);
    const gasto = window.Util.sumar(pedidos.filter(function (p) {
      return p.estadoPago === 'aprobado' && p.estado !== 'cancelado';
    }), 'total');
    return '<div class="card perfil-resumen">' +
      window.Util.avatar(usuario.nombre, 'grande azul') +
      '<div><h2>' + window.Util.esc(usuario.nombre) + '</h2>' +
        '<div class="muted small">' + window.Util.esc(usuario.correo) + '</div>' +
        '<div class="flex-wrap" style="margin-top:8px">' +
          window.Util.badge('cliente', 'Cliente frecuente') +
          (usuario.celular ? '<span class="badge sin-punto">' + window.Util.esc(usuario.celular) + '</span>' : '') +
          '<span class="badge sin-punto">' + window.Util.esc(usuario.distrito || 'Ica') + '</span>' +
        '</div></div>' +
      '<div class="perfil-datos">' +
        '<div><strong>' + pedidos.length + '</strong><span>Pedidos</span></div>' +
        '<div><strong>' + window.Util.soles(gasto) + '</strong><span>Consumo</span></div>' +
        '<div><strong>' + tarjeta.compras + '</strong><span>Compras</span></div>' +
        '<div><strong>' + tarjeta.beneficios + '</strong><span>Beneficios</span></div>' +
      '</div></div>';
  }

  function contenidoPedidos(usuario) {
    const pedidos = window.Pedidos.porUsuario(usuario.id);
    return '<div class="card">' +
      '<div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('pedidos') + '</div>' +
        '<div><h2>Mis pedidos</h2><p>Historial completo de pedidos realizados</p></div></div></div>' +
      window.AdminUI_tablaPedidos(pedidos) +
      '</div>';
  }

  window.AdminUI_tablaPedidos = function (pedidos) {
    if (!pedidos.length) {
      return window.Util.vacio('Todavía no tienes pedidos', 'Explora el menú y realiza tu primer pedido.',
        '<a class="btn btn-primario btn-sm" href="menu.html">Ir al menú</a>');
    }
    return '<div class="tabla-wrap"><table class="tabla"><thead><tr>' +
      '<th>Código</th><th>Fecha</th><th>Productos</th><th>Total</th><th>Pago</th><th>Estado</th><th></th></tr></thead><tbody>' +
      pedidos.map(function (p) {
        return '<tr><td class="principal">' + window.Util.esc(p.codigo) + '</td>' +
          '<td>' + window.Util.fecha(p.creadoEn) + '</td>' +
          '<td style="max-width:220px">' + window.Util.esc((p.items || []).map(function (i) { return i.cantidad + 'x ' + i.nombre; }).join(', ')) + '</td>' +
          '<td class="principal">' + window.Util.soles(p.total) + '</td>' +
          '<td>' + window.Util.badge(p.estadoPago) + '</td>' +
          '<td>' + window.Util.badge(p.estado) + '</td>' +
          '<td><a class="btn btn-sm btn-claro" href="seguimiento.html?codigo=' + encodeURIComponent(p.codigo) + '">Ver</a></td></tr>';
      }).join('') + '</tbody></table></div>';
  };

  function contenidoReservas(usuario) {
    const reservas = window.Reservas.porUsuario(usuario.id);
    if (!reservas.length) {
      return '<div class="card">' + window.Util.vacio('Sin reservas registradas', 'Reserva una mesa con Wi-Fi y enchufe.',
        '<a class="btn btn-primario btn-sm" href="reserva.html">Reservar mesa</a>') + '</div>';
    }
    return '<div class="card"><div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('calendario') + '</div>' +
      '<div><h2>Mis reservas</h2><p>Historial de mesas reservadas</p></div></div>' +
      '<a class="btn btn-claro btn-sm" href="reserva.html">Nueva reserva</a></div>' +
      '<div class="tabla-wrap"><table class="tabla"><thead><tr>' +
      '<th>Mesa</th><th>Fecha</th><th>Hora</th><th>Personas</th><th>Estado</th><th>Nota</th></tr></thead><tbody>' +
      reservas.map(function (r) {
        const mesa = window.Almacen.buscar('mesas', r.mesaId) || {};
        return '<tr><td class="principal">Mesa ' + window.Util.esc(mesa.numero || r.numeroMesa || '—') + '</td>' +
          '<td>' + window.Util.fecha(r.fecha) + '</td><td>' + r.hora + '</td><td>' + r.personas + '</td>' +
          '<td>' + window.Util.badge(r.estado) + '</td>' +
          '<td class="small">' + window.Util.esc(r.nota || '—') + '</td></tr>';
      }).join('') + '</tbody></table></div></div>';
  }

  function contenidoPagos(usuario) {
    const pagos = window.Pagos.porUsuario(usuario.id);
    if (!pagos.length) {
      return '<div class="card">' + window.Util.vacio('Sin pagos registrados', 'Los pagos demostrativos de tus pedidos aparecerán aquí.') + '</div>';
    }
    return '<div class="card"><div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('pagos') + '</div>' +
      '<div><h2>Mis pagos</h2><p>Pagos demostrativos registrados</p></div></div></div>' +
      '<div class="tabla-wrap"><table class="tabla"><thead><tr>' +
      '<th>Código</th><th>Pedido</th><th>Método</th><th>Importe</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>' +
      pagos.map(function (p) {
        return '<tr><td class="principal">' + window.Util.esc(p.codigo) + '</td>' +
          '<td>' + window.Util.esc(p.codigoPedido || (p.tipo === 'compartida' ? 'Mesa compartida' : '—')) + '</td>' +
          '<td>' + window.Util.metodoPago(p.metodo) + '</td>' +
          '<td class="principal">' + window.Util.soles(p.importe) + '</td>' +
          '<td>' + window.Util.fechaHora(p.fecha) + '</td>' +
          '<td>' + window.Util.badge(p.estado) + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<p class="small muted mt-2">Todos los pagos son demostrativos y no representan transacciones reales.</p></div>';
  }

  function contenidoSugerencias(usuario) {
    const sugerencias = window.Almacen.listar('sugerencias').filter(function (s) { return s.usuarioId === usuario.id; });
    return '<div class="card"><div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('sugerencias') + '</div>' +
      '<div><h2>Mis sugerencias</h2><p>Comentarios enviados al local</p></div></div>' +
      '<a class="btn btn-claro btn-sm" href="sugerencias.html">Enviar sugerencia</a></div>' +
      (sugerencias.length
        ? sugerencias.map(function (s) {
            return '<div class="historial-item"><div class="cabeza"><h4>' + window.Util.esc(s.categoria) + ' · ' + window.Util.fecha(s.fecha) + '</h4>' +
              window.Util.badge(s.estado) + '</div>' +
              '<div class="small muted">' + window.Util.estrella(s.calificacion) + '</div>' +
              '<p class="mt-1">' + window.Util.esc(s.comentario) + '</p>' +
              (s.respuesta ? '<div class="alerta mt-1"><span class="alerta-icono">💬</span><div><strong>Respuesta de CaféYa</strong>' +
                window.Util.esc(s.respuesta) + '</div></div>' : '') + '</div>';
          }).join('')
        : window.Util.vacio('Sin sugerencias enviadas', 'Tu opinión nos ayuda a mejorar el servicio.',
          '<a class="btn btn-primario btn-sm" href="sugerencias.html">Enviar sugerencia</a>')) + '</div>';
  }

  function contenidoPerfil(usuario) {
    return '<div class="card"><div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('usuario') + '</div>' +
      '<div><h2>Mis datos</h2><p>Actualiza tu información personal</p></div></div></div>' +
      '<form id="form-perfil" class="form-grid perfil-form dos">' +
        '<div class="campo"><label for="p-nombre">Nombres y apellidos</label>' +
          '<input id="p-nombre" name="nombre" value="' + window.Util.esc(usuario.nombre) + '"><span class="error"></span></div>' +
        '<div class="campo"><label for="p-correo">Correo electrónico</label>' +
          '<input type="email" id="p-correo" name="correo" value="' + window.Util.esc(usuario.correo) + '"><span class="error"></span></div>' +
        '<div class="campo"><label for="p-celular">Celular</label>' +
          '<input id="p-celular" name="celular" value="' + window.Util.esc(usuario.celular || '') + '"><span class="error"></span></div>' +
        '<div class="campo"><label for="p-distrito">Distrito</label>' +
          '<input id="p-distrito" name="distrito" value="' + window.Util.esc(usuario.distrito || 'Ica') + '"><span class="error"></span></div>' +
        '<div class="campo"><label for="p-preferencia">Preferencia de consumo</label>' +
          '<select id="p-preferencia" name="preferencia">' +
            ['Cafés', 'Bebidas frías', 'Desayunos', 'Postres', 'Combos'].map(function (opcion) {
              return '<option' + (usuario.preferencia === opcion ? ' selected' : '') + '>' + opcion + '</option>';
            }).join('') + '</select></div>' +
        '<div class="campo"><label>Miembro desde</label>' +
          '<input value="' + window.Util.fecha(usuario.creadoEn) + '" readonly></div>' +
        '<div style="grid-column:1/-1" class="flex-wrap">' +
          '<button class="btn btn-primario" type="submit">Guardar cambios</button>' +
          '<a class="btn btn-claro" href="fidelizacion.html">Ver mi tarjeta de fidelización</a>' +
        '</div>' +
        '<div class="perfil-nota" style="grid-column:1/-1">🔐 La contraseña se gestiona desde la recuperación de acceso. ' +
        'Los datos se almacenan localmente en este navegador.</div>' +
      '</form></div>';
  }

  function render() {
    const usuario = window.Auth.usuarioActual();
    if (!usuario) return;
    const pedidos = window.Pedidos.porUsuario(usuario.id);
    const reservas = window.Reservas.porUsuario(usuario.id);
    const pagos = window.Pagos.porUsuario(usuario.id);
    const sugerencias = window.Almacen.listar('sugerencias').filter(function (s) { return s.usuarioId === usuario.id; });

    contenido.innerHTML = renderCabecera(usuario) +
      '<div class="tabs-bar">' + [
        ['pedidos', 'Pedidos', pedidos.length],
        ['reservas', 'Reservas', reservas.length],
        ['pagos', 'Pagos', pagos.length],
        ['sugerencias', 'Sugerencias', sugerencias.length],
        ['perfil', 'Mi perfil', null]
      ].map(function (item) {
        return '<button type="button" class="' + (tab === item[0] ? 'activo' : '') + '" data-tab="' + item[0] + '">' + item[1] +
          (item[2] !== null ? '<span class="conteo">' + item[2] + '</span>' : '') + '</button>';
      }).join('') + '</div><div id="tab-contenido"></div>';

    Array.prototype.forEach.call(contenido.querySelectorAll('[data-tab]'), function (boton) {
      boton.addEventListener('click', function () {
        tab = boton.dataset.tab;
        render();
      });
    });

    const zona = document.getElementById('tab-contenido');
    if (tab === 'reservas') zona.innerHTML = contenidoReservas(usuario);
    else if (tab === 'pagos') zona.innerHTML = contenidoPagos(usuario);
    else if (tab === 'sugerencias') zona.innerHTML = contenidoSugerencias(usuario);
    else if (tab === 'perfil') {
      zona.innerHTML = contenidoPerfil(usuario);
      document.getElementById('form-perfil').addEventListener('submit', function (evento) {
        evento.preventDefault();
        const revision = window.Validaciones.formulario(evento.target, {
          nombre: { etiqueta: 'El nombre', requerido: true, minLength: 3 },
          correo: { etiqueta: 'El correo', requerido: true, tipo: 'correo' },
          celular: { etiqueta: 'El celular', requerido: true, tipo: 'celular' },
          distrito: { etiqueta: 'El distrito', requerido: true }
        });
        if (!revision.valido) {
          window.Notificaciones.error('Revisa tus datos', revision.errores[0]);
          return;
        }
        const resultado = window.Auth.actualizarPerfil({
          nombre: revision.datos.nombre,
          correo: revision.datos.correo,
          celular: revision.datos.celular,
          distrito: revision.datos.distrito,
          preferencia: evento.target.elements.preferencia.value
        });
        if (!resultado.ok) {
          window.Notificaciones.error('No se pudo actualizar', resultado.error);
          return;
        }
        window.Notificaciones.exito('Perfil actualizado', 'Tus datos se guardaron correctamente.');
        render();
      });
    } else zona.innerHTML = contenidoPedidos(usuario);
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenido = window.Shell.cliente({
      pagina: 'historial',
      titulo: 'Historial y perfil',
      subtitulo: 'Pedidos, reservas, pagos y datos personales'
    });
    if (!contenido) return;
    render();
    window.Almacen.alCambiar(window.Util.debounce(render, 500));
  });
})();
