/* ============================================================
   CafeYa Ica - Usuarios y roles
   ============================================================ */
(function () {
  'use strict';

  let contenido = null;
  const filtros = { busqueda: '', tipo: 'todos' };

  const DESCRIPCIONES = {
    administrador: 'Acceso total al sistema, configuración y gestión de usuarios.',
    gerencia: 'Reportes, indicadores y supervisión de todas las áreas.',
    marketing: 'Productos, promociones, clientes, fidelización y sugerencias.',
    operaciones: 'Pedidos, cocina, mesas, reservas, pagos e inventario.',
    cocina: 'Comandas del panel de cocina y cambios de estado de pedidos.'
  };
  const EMOJIS = { administrador: '🛡️', gerencia: '📊', marketing: '📣', operaciones: '⚙️', cocina: '👨‍🍳' };

  function renderTabla() {
    const zona = document.getElementById('tabla-usuarios');
    if (!zona) return;
    let lista = window.Almacen.listar('usuarios').slice();
    if (filtros.tipo === 'clientes') lista = lista.filter(function (u) { return u.rol === 'cliente'; });
    if (filtros.tipo === 'administrativos') lista = lista.filter(function (u) { return u.rol !== 'cliente'; });
    lista = window.AdminUI.filtrar(lista, filtros.busqueda, ['nombre', 'correo', 'celular']);

    zona.innerHTML = window.AdminUI.tabla({
      datos: lista,
      vacioTitulo: 'Sin usuarios',
      vacioTexto: 'No hay usuarios que coincidan con la búsqueda.',
      columnas: [
        { titulo: 'Usuario', render: function (u) {
          return window.AdminUI.persona(u.nombre, u.correo, u.rol === 'cliente' ? '' : 'azul');
        } },
        { titulo: 'Celular', campo: 'celular' },
        { titulo: 'Rol', render: function (u) {
          return '<span class="rol-badge ' + window.Util.esc(u.rol) + '">' + window.Util.esc(window.Permisos.etiquetaRol(u.rol)) + '</span>';
        } },
        { titulo: 'Acceso', render: function (u) {
          if (u.rol === 'cliente') return '<span class="small muted">Panel del cliente</span>';
          const modulos = Object.keys(window.Permisos.MODULOS).filter(function (m) {
            return window.Permisos.MODULOS[m].indexOf(u.rol) > -1;
          });
          return '<span class="small">' + modulos.length + ' módulo(s)</span>';
        } },
        { titulo: 'Estado', render: function (u) { return window.Util.badge(u.estado === 'inactivo' ? 'inactivo' : 'activo'); } },
        { titulo: 'Acciones', render: function (u) {
          const soyYo = window.Auth.usuarioActual() && window.Auth.usuarioActual().id === u.id;
          return '<div class="acciones-fila">' +
            '<button type="button" class="btn btn-sm btn-claro" data-ver="' + u.id + '">Ver</button>' +
            (u.rol === 'cliente' ? '' : '<button type="button" class="btn btn-sm btn-claro" data-rol="' + u.id + '">Cambiar rol</button>') +
            '<button type="button" class="btn btn-sm ' + (u.estado === 'inactivo' ? 'btn-teal' : 'btn-peligro') + '" data-estado="' + u.id + '"' +
              (soyYo ? ' disabled title="No puedes desactivar tu propia cuenta"' : '') + '>' +
              (u.estado === 'inactivo' ? 'Activar' : 'Desactivar') + '</button></div>';
        } }
      ]
    });
  }

  function verUsuario(id) {
    const usuario = window.Almacen.buscar('usuarios', id);
    const modulos = Object.keys(window.Permisos.MODULOS).filter(function (m) {
      return window.Permisos.MODULOS[m].indexOf(usuario.rol) > -1;
    });
    window.Modal.abrir({
      titulo: usuario.nombre,
      subtitulo: window.Permisos.etiquetaRol(usuario.rol),
      emoji: EMOJIS[usuario.rol] || '👤',
      cuerpo: window.Modal.detalleFilas([
        ['Correo', usuario.correo],
        ['Celular', usuario.celular || '—'],
        ['Rol', window.Permisos.etiquetaRol(usuario.rol)],
        ['Estado', window.Util.etiqueta(usuario.estado === 'inactivo' ? 'inactivo' : 'activo')],
        ['Registrado', window.Util.fecha(usuario.creadoEn)],
        ['Módulos habilitados', modulos.length ? modulos.map(function (m) { return window.Util.cap(m); }).join(', ') : 'Panel del cliente']
      ]),
      acciones: '<button class="btn btn-primario" type="button" data-cerrar>Cerrar</button>'
    });
  }

  function cambiarRol(id) {
    const usuario = window.Almacen.buscar('usuarios', id);
    const caja = window.Modal.abrir({
      titulo: 'Cambiar rol',
      subtitulo: usuario.nombre,
      emoji: '🔐',
      cuerpo:
        '<div class="campo"><label for="ur-rol">Rol del usuario</label><select id="ur-rol">' +
          Object.keys(window.Permisos.ROLES).map(function (rol) {
            return '<option value="' + rol + '"' + (usuario.rol === rol ? ' selected' : '') + '>' +
              window.Permisos.etiquetaRol(rol) + '</option>';
          }).join('') + '</select>' +
          '<span class="ayuda">Los permisos del menú y de cada módulo se actualizan según el rol asignado.</span></div>',
      acciones: '<button class="btn btn-claro" type="button" data-cerrar>Cancelar</button>' +
        '<button class="btn btn-primario" type="button" id="ur-guardar">Guardar rol</button>'
    });
    caja.querySelector('#ur-guardar').addEventListener('click', function () {
      const rol = caja.querySelector('#ur-rol').value;
      window.Almacen.actualizar('usuarios', usuario.id, { rol: rol });
      window.Modal.cerrar();
      window.Notificaciones.exito('Rol actualizado', usuario.nombre + ' ahora es ' + window.Permisos.etiquetaRol(rol) + '.');
      renderTabla();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenido = window.AdminUI.montar({
      pagina: 'usuarios-admin',
      titulo: 'Usuarios y roles',
      subtitulo: 'Cuentas de demostración, roles y permisos'
    });
    if (!contenido) return;

    const usuarios = window.Almacen.listar('usuarios');
    const admins = usuarios.filter(function (u) { return u.rol !== 'cliente'; });
    const clientes = usuarios.filter(function (u) { return u.rol === 'cliente'; });
    const inactivos = usuarios.filter(function (u) { return u.estado === 'inactivo'; });

    const modulos = Object.keys(window.Permisos.MODULOS);
    const matriz = '<div class="tabla-wrap roles-matriz"><table class="tabla"><thead><tr><th>Módulo</th>' +
      Object.keys(window.Permisos.ROLES).map(function (rol) {
        return '<th>' + window.Util.esc(window.Permisos.etiquetaRol(rol).split(' y ')[0]) + '</th>';
      }).join('') + '</tr></thead><tbody>' +
      modulos.map(function (modulo) {
        return '<tr><td><strong style="font-size:12px">' + window.Util.cap(modulo) + '</strong></td>' +
          Object.keys(window.Permisos.ROLES).map(function (rol) {
            const permite = window.Permisos.MODULOS[modulo].indexOf(rol) > -1;
            return '<td class="' + (permite ? 'si' : 'no') + '">' + (permite ? '✓' : '·') + '</td>';
          }).join('') + '</tr>';
      }).join('') + '</tbody></table></div>';

    contenido.innerHTML =
      '<div class="grid grid-4">' +
        window.AdminUI.stat(usuarios.length, 'Usuarios registrados', 'usuarios', '') +
        window.AdminUI.stat(admins.length, 'Usuarios administrativos', 'candado', 'azul') +
        window.AdminUI.stat(clientes.length, 'Clientes', 'usuario', 'menta') +
        window.AdminUI.stat(inactivos.length, 'Cuentas inactivas', 'alerta', 'terracota') +
      '</div>' +
      '<div class="card mt-2">' +
        '<div class="panel-filtros">' +
          '<div class="buscador grow">' + window.Util.svg('buscar') +
            '<input id="us-buscar" type="search" placeholder="Buscar usuario por nombre o correo..."></div>' +
          '<select id="us-tipo"><option value="todos">Todos los usuarios</option>' +
            '<option value="administrativos">Solo administrativos</option>' +
            '<option value="clientes">Solo clientes</option></select>' +
        '</div>' +
        '<div id="tabla-usuarios"></div>' +
      '</div>' +
      '<div class="card mt-2">' +
        '<div class="card-head"><div class="card-titulo"><div class="card-icono">' + window.Util.svg('candado') + '</div>' +
          '<div><h2>Roles del sistema</h2><p>Permisos por módulo del panel administrativo</p></div></div></div>' +
        '<div class="roles-grid">' +
          Object.keys(window.Permisos.ROLES).map(function (rol) {
            return '<div class="rol-card"><span class="emoji">' + EMOJIS[rol] + '</span>' +
              '<div><h4>' + window.Util.esc(window.Permisos.etiquetaRol(rol)) + '</h4>' +
              '<p>' + DESCRIPCIONES[rol] + '</p></div></div>';
          }).join('') +
        '</div>' +
        matriz +
      '</div>' +
      '<div class="alerta mt-2"><span class="alerta-icono">🔑</span><div><strong>Cuentas de demostración</strong>' +
        'Administrador: admin@cafeya.pe / admin123 · Gerencia, marketing, operaciones y cocina tienen claves propias definidas en el README.</div></div>';

    document.getElementById('us-buscar').addEventListener('input', window.Util.debounce(function (e) {
      filtros.busqueda = e.target.value; renderTabla();
    }, 220));
    document.getElementById('us-tipo').addEventListener('change', function (e) {
      filtros.tipo = e.target.value; renderTabla();
    });

    contenido.addEventListener('click', function (evento) {
      const ver = evento.target.closest('[data-ver]');
      if (ver) { verUsuario(ver.dataset.ver); return; }
      const rol = evento.target.closest('[data-rol]');
      if (rol) { cambiarRol(rol.dataset.rol); return; }
      const estado = evento.target.closest('[data-estado]');
      if (estado && !estado.disabled) {
        const usuario = window.Almacen.buscar('usuarios', estado.dataset.estado);
        const nuevo = usuario.estado === 'inactivo' ? 'activo' : 'inactivo';
        window.Almacen.actualizar('usuarios', usuario.id, { estado: nuevo });
        window.Notificaciones.info('Cuenta actualizada', usuario.nombre + ' quedó ' + nuevo + '.');
        renderTabla();
      }
    });

    renderTabla();
  });
})();
