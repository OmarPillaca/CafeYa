/* ============================================================
   CafeYa Ica - Shell de los paneles privados (cliente y admin)
   ============================================================ */
(function () {
  'use strict';

  const NAV_CLIENTE = [
    {
      grupo: 'Mi cuenta',
      items: [
        { id: 'cliente', texto: 'Mi panel', icono: 'inicio', href: 'cliente.html' },
        { id: 'menu', texto: 'Menú digital', icono: 'cafe', href: 'menu.html' },
        { id: 'carrito', texto: 'Mi carrito', icono: 'carrito', href: 'carrito.html', badge: 'carrito' },
        { id: 'seguimiento', texto: 'Seguimiento del pedido', icono: 'reloj', href: 'seguimiento.html' },
        { id: 'historial', texto: 'Historial y perfil', icono: 'pedidos', href: 'historial.html' }
      ]
    },
    {
      grupo: 'Mesas y reservas',
      items: [
        { id: 'mesas', texto: 'Mesas y códigos QR', icono: 'mesas', href: 'mesas.html' },
        { id: 'reserva', texto: 'Reservar una mesa', icono: 'calendario', href: 'reserva.html' },
        { id: 'mesa-compartida', texto: 'Mesa compartida', icono: 'usuarios', href: 'mesa-compartida.html' }
      ]
    },
    {
      grupo: 'Beneficios',
      items: [
        { id: 'fidelizacion', texto: 'Cliente frecuente', icono: 'fidelizacion', href: 'fidelizacion.html' },
        { id: 'sugerencias', texto: 'Buzón de sugerencias', icono: 'sugerencias', href: 'sugerencias.html' }
      ]
    }
  ];

  const NAV_ADMIN = [
    {
      grupo: 'Principal',
      items: [
        { id: 'dashboard', texto: 'Dashboard', icono: 'grafico', href: 'dashboard.html', modulo: 'dashboard' }
      ]
    },
    {
      grupo: 'Operación',
      items: [
        { id: 'pedidos', texto: 'Pedidos', icono: 'pedidos', href: 'pedidos.html', modulo: 'pedidos', badge: 'pedidos' },
        { id: 'cocina', texto: 'Panel de cocina', icono: 'cocina', href: '../cocina/cocina.html', modulo: 'cocina', badge: 'cocina' },
        { id: 'mesas-admin', texto: 'Mesas y QR', icono: 'mesas', href: 'mesas-admin.html', modulo: 'mesas' },
        { id: 'reservas-admin', texto: 'Reservas', icono: 'calendario', href: 'reservas-admin.html', modulo: 'reservas', badge: 'reservas' }
      ]
    },
    {
      grupo: 'Catálogo',
      items: [
        { id: 'productos', texto: 'Productos', icono: 'producto', href: 'productos.html', modulo: 'productos' },
        { id: 'categorias', texto: 'Categorías', icono: 'categoria', href: 'categorias.html', modulo: 'categorias' },
        { id: 'promociones', texto: 'Promociones', icono: 'promocion', href: 'promociones.html', modulo: 'promociones' }
      ]
    },
    {
      grupo: 'Clientes',
      items: [
        { id: 'clientes-admin', texto: 'Clientes', icono: 'usuarios', href: 'clientes-admin.html', modulo: 'clientes' },
        { id: 'pagos-admin', texto: 'Pagos', icono: 'pagos', href: 'pagos-admin.html', modulo: 'pagos' },
        { id: 'fidelizacion-admin', texto: 'Fidelización', icono: 'fidelizacion', href: 'fidelizacion-admin.html', modulo: 'fidelizacion' },
        { id: 'sugerencias-admin', texto: 'Sugerencias', icono: 'sugerencias', href: 'sugerencias-admin.html', modulo: 'sugerencias', badge: 'sugerencias' }
      ]
    },
    {
      grupo: 'Gestión',
      items: [
        { id: 'inventario', texto: 'Inventario', icono: 'inventario', href: 'inventario.html', modulo: 'inventario' },
        { id: 'reportes', texto: 'Reportes', icono: 'reportes', href: 'reportes.html', modulo: 'reportes' },
        { id: 'usuarios-admin', texto: 'Usuarios y roles', icono: 'usuario', href: 'usuarios-admin.html', modulo: 'usuarios' },
        { id: 'configuracion', texto: 'Configuración', icono: 'configuracion', href: 'configuracion.html', modulo: 'configuracion' }
      ]
    }
  ];

  function navHTML(grupos, pagina, filtro) {
    return grupos.map(function (grupo) {
      const items = grupo.items.filter(function (item) { return !filtro || filtro(item); });
      if (!items.length) return '';
      return '<div class="nav-grupo"><div class="nav-titulo">' + grupo.grupo + '</div>' +
        items.map(function (item) {
          const activo = item.id === pagina ? ' activo' : '';
          return '<a class="nav-item' + activo + '" href="' + item.href + '">' +
            window.Util.svg(item.icono) + '<span>' + window.Util.esc(item.texto) + '</span>' +
            (item.badge ? '<span class="nav-badge" data-badge="' + item.badge + '" style="display:none">0</span>' : '') +
            '</a>';
        }).join('') + '</div>';
    }).join('');
  }

  function setBadge(nombre, valor) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-badge="' + nombre + '"]'), function (elemento) {
      elemento.textContent = valor;
      elemento.style.display = valor ? 'inline-block' : 'none';
    });
  }

  function actualizarBadges() {
    const carrito = window.Carrito ? window.Carrito.contar() : 0;
    setBadge('carrito', carrito);
    const contador = document.getElementById('badge-carrito-top');
    if (contador) {
      contador.textContent = carrito;
      contador.style.display = carrito ? 'grid' : 'none';
    }
    if (window.Pedidos) {
      setBadge('pedidos', window.Pedidos.activos().length);
      setBadge('cocina', window.Pedidos.listar().filter(function (p) {
        return p.estado === 'recibido' || p.estado === 'preparacion';
      }).length);
    }
    if (window.Reservas) {
      setBadge('reservas', window.Reservas.proximas().filter(function (r) { return r.estado === 'pendiente'; }).length);
    }
    const sugerencias = (window.Almacen.leer('sugerencias', []) || []).filter(function (s) {
      return s.estado === 'pendiente';
    }).length;
    setBadge('sugerencias', sugerencias);
    const punto = document.getElementById('punto-notif');
    if (punto && window.Notificaciones) punto.style.display = window.Notificaciones.noLeidas() ? 'block' : 'none';
  }

  function abrirCuenta(usuario, tipo) {
    const esAdmin = tipo === 'admin';
    const tarjeta = (!esAdmin && window.Fidelizacion) ? window.Fidelizacion.tarjeta(usuario.id) : null;
    const pedidos = (!esAdmin && window.Pedidos) ? window.Pedidos.porUsuario(usuario.id).length : 0;
    const filas = [
      ['Rol', esAdmin ? window.Permisos.etiquetaRol(usuario.rol) : 'Cliente'],
      ['Miembro desde', window.Util.fecha(usuario.creadoEn || new Date())]
    ];
    if (!esAdmin) {
      filas.push(['Pedidos realizados', pedidos]);
      filas.push(['Compras acumuladas', tarjeta.compras]);
      filas.push(['Beneficios disponibles', tarjeta.beneficios]);
    }
    const cuerpo =
      '<div class="cuenta-cabecera">' + window.Util.avatar(usuario.nombre, 'grande azul') +
        '<div><h3 style="margin:0;font-size:19px">' + window.Util.esc(usuario.nombre) + '</h3>' +
        '<div class="muted small">' + window.Util.esc(usuario.correo) + '</div>' +
        '<div class="flex-wrap" style="margin-top:8px">' +
          window.Util.badge(esAdmin ? usuario.rol : 'cliente', esAdmin ? window.Permisos.etiquetaRol(usuario.rol) : 'Cliente') +
          (usuario.celular ? '<span class="badge sin-punto">' + window.Util.esc(usuario.celular) + '</span>' : '') +
        '</div></div></div>' +
      window.Modal.detalleFilas(filas) +
      (esAdmin ? '' : '<div class="alerta mt-2"><span class="alerta-icono">⭐</span><div><strong>Tarjeta de cliente frecuente</strong>' +
        tarjeta.enTarjeta + ' de 5 compras en tu tarjeta actual · ' + tarjeta.beneficios + ' beneficio(s) disponible(s).</div></div>');

    window.Modal.abrir({
      titulo: 'Mi cuenta',
      subtitulo: 'Sesión activa en CaféYa Ica',
      emoji: '👤',
      tamano: 'mediano',
      cuerpo: cuerpo,
      acciones: (esAdmin
        ? '<a class="btn btn-claro" href="configuracion.html">Configuración</a>'
        : '<a class="btn btn-claro" href="historial.html">Mi historial</a>') +
        '<button class="btn btn-peligro" type="button" onclick="Shell.salir(\'' + tipo + '\')">Cerrar sesión</button>'
    });
  }

  function abrirNotificaciones() {
    const lista = window.Notificaciones.listar().slice(0, 12);
    const cuerpo = lista.length
      ? '<div class="notif-lista">' + lista.map(function (n) {
          const icono = n.tipo === 'error' ? '⚠️' : (n.tipo === 'exito' ? '✅' : '🔔');
          return '<div class="notif-item"><span class="notif-emoji">' + icono + '</span>' +
            '<div class="grow"><h4>' + window.Util.esc(n.titulo) + '</h4>' +
            (n.mensaje ? '<p>' + window.Util.esc(n.mensaje) + '</p>' : '') +
            '<time>' + window.Util.fechaHora(n.fecha) + '</time></div>' +
            (n.leida ? '' : '<span class="badge badge-nuevo sin-punto">Nuevo</span>') + '</div>';
        }).join('') + '</div>'
      : window.Util.vacio('Sin notificaciones', 'Aquí aparecerán los avisos de pedidos, pagos y reservas.');
    window.Modal.abrir({
      titulo: 'Notificaciones',
      subtitulo: 'Actividad reciente del sistema',
      emoji: '🔔',
      tamano: 'mediano',
      cuerpo: cuerpo,
      acciones: '<button class="btn btn-primario" type="button" data-cerrar>Entendido</button>'
    });
    window.Notificaciones.marcarLeidas();
    actualizarBadges();
  }

  function salir(tipo) {
    window.Auth.salir();
    window.location.href = tipo === 'admin' ? 'login-admin.html' : 'login.html';
  }

  function construir(opciones) {
    const o = opciones || {};
    const tipo = o.tipo === 'admin' ? 'admin' : 'cliente';
    const esAdmin = tipo === 'admin';
    let usuario;
    if (esAdmin) {
      usuario = window.Auth.requiereAdmin(o.roles);
    } else if (o.permitirInvitado) {
      usuario = window.Auth.usuarioActual();
    } else {
      usuario = window.Auth.requiereCliente();
    }
    if (!usuario && !(o.permitirInvitado && !esAdmin)) return null;
    const invitado = !usuario;
    const sesionVisual = usuario || { nombre: 'Invitado', rol: 'invitado', correo: 'Sin sesión iniciada' };

    const app = document.getElementById('app');
    if (!app) return null;
    document.title = (o.titulo || 'Panel') + ' · CaféYa Ica';

    const config = esAdmin ? {
      sub: 'Ica · Administración',
      nav: NAV_ADMIN,
      home: '../index.html',
      accion: '<a class="btn btn-teal btn-sm no-imprimir" href="pedidos.html">' + window.Util.svg('pedidos') + '<span class="btn-etiqueta">Pedidos</span></a>',
      extra: window.Permisos.puede('cocina') ? '<a class="icono-btn" href="../cocina/cocina.html" title="Panel de cocina">' + window.Util.svg('cocina') + '</a>' : '',
      pie: 'Panel administrativo · Modo demostración'
    } : {
      sub: 'Ica · Cliente',
      nav: NAV_CLIENTE,
      home: '../index.html',
      accion: '<a class="btn btn-claro btn-sm no-imprimir" href="menu.html">' + window.Util.svg('cafe') + '<span class="btn-etiqueta">Pedir ahora</span></a>',
      extra: '<a class="icono-btn" href="carrito.html" title="Mi carrito" style="position:relative">' + window.Util.svg('carrito') + '<span class="contador-carrito" id="badge-carrito-top">0</span></a>',
      pie: 'Panel del cliente · Datos guardados en tu navegador'
    };

    const filtro = esAdmin ? function (item) { return window.Permisos.puede(item.modulo); } : null;

    app.innerHTML =
      '<div class="layout">' +
        '<aside class="sidebar" id="sidebar">' +
          '<a class="sidebar-brand" href="' + config.home + '">' +
            '<img src="../assets/logos/logo.svg" alt="CaféYa Ica">' +
            '<div><div class="marca">Café<span>Ya</span></div><small>' + config.sub + '</small></div>' +
          '</a>' +
          '<div class="sidebar-scroll">' + navHTML(config.nav, o.pagina, filtro) +
            '<div class="nav-grupo"><div class="nav-titulo">Sesión</div>' +
              '<a class="nav-item" href="' + config.home + '">' + window.Util.svg('inicio') + '<span>Ir al sitio web</span></a>' +
              '<button class="nav-item" type="button" data-salir style="width:100%;background:transparent;border:none;text-align:left">' +
                window.Util.svg('salir') + '<span>Cerrar sesión</span></button>' +
            '</div>' +
          '</div>' +
          '<div class="sidebar-pie"><span class="demo-tag">VERSIÓN DEMO</span><div>' + config.pie + '</div></div>' +
        '</aside>' +
        '<div class="overlay-menu" id="overlay-menu"></div>' +
        '<div class="main">' +
          '<header class="topbar">' +
            '<button class="icono-btn hamburguesa" id="btn-menu" type="button" aria-label="Abrir menú">' + window.Util.svg('menu') + '</button>' +
            '<div class="topbar-titulo">' + window.Util.esc(o.titulo || 'Panel') +
              '<small>' + window.Util.esc(o.subtitulo || '') + '</small></div>' +
            '<div class="topbar-acciones">' + config.accion + config.extra +
              '<button class="icono-btn" id="btn-notif" type="button" title="Notificaciones">' + window.Util.svg('campana') +
                '<span class="punto" id="punto-notif" style="display:none"></span></button>' +
              '<button class="usuario-chip" id="chip-usuario" type="button">' +
                window.Util.avatar(sesionVisual.nombre, esAdmin ? 'azul' : '') +
                '<span class="datos" style="text-align:left"><span class="nombre">' +
                  window.Util.esc(String(sesionVisual.nombre).split(' ')[0]) + '</span>' +
                  '<span class="rol">' + (invitado ? 'Invitado' : window.Util.esc(esAdmin ? window.Permisos.etiquetaRol(sesionVisual.rol) : 'Cliente')) + '</span>' +
                '</span>' +
              '</button>' +
            '</div>' +
          '</header>' +
          '<main class="contenido" id="contenido"></main>' +
        '</div>' +
      '</div>';

    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay-menu');
    const botonMenu = document.getElementById('btn-menu');
    if (botonMenu) {
      botonMenu.addEventListener('click', function () {
        sidebar.classList.toggle('abierto');
        overlay.classList.toggle('visible');
      });
    }
    if (overlay) {
      overlay.addEventListener('click', function () {
        sidebar.classList.remove('abierto');
        overlay.classList.remove('visible');
      });
    }
    Array.prototype.forEach.call(document.querySelectorAll('[data-salir]'), function (boton) {
      boton.addEventListener('click', function () { salir(tipo); });
    });
    document.getElementById('chip-usuario').addEventListener('click', function () {
      if (invitado) { window.location.href = 'login.html'; return; }
      abrirCuenta(sesionVisual, tipo);
    });
    document.getElementById('btn-notif').addEventListener('click', abrirNotificaciones);

    actualizarBadges();
    window.Almacen.alCambiar(window.Util.debounce(actualizarBadges, 150));

    return document.getElementById('contenido');
  }

  window.Shell = {
    cliente: function (opciones) { return construir(Object.assign({ tipo: 'cliente' }, opciones)); },
    admin: function (opciones) { return construir(Object.assign({ tipo: 'admin' }, opciones)); },
    salir: salir,
    actualizarBadges: actualizarBadges
  };
})();
