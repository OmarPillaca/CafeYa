/* ============================================================
   CafeYa Ica - Autenticación de clientes y personal
   ============================================================ */
(function () {
  'use strict';

  const C = window.Almacen.CLAVES;
  const ROLES_ADMIN = ['administrador', 'gerencia', 'marketing', 'operaciones', 'cocina'];
  const SESION_TEMPORAL = 'cafeya_sesion_temp';

  function sesion() {
    try {
      const temporal = sessionStorage.getItem(SESION_TEMPORAL);
      if (temporal) return JSON.parse(temporal);
    } catch (error) { /* almacenamiento no disponible */ }
    return window.Almacen.leer(C.sesion, null);
  }

  function usuarioActual() {
    const activa = sesion();
    if (!activa || !activa.usuarioId) return null;
    return window.Almacen.buscar(C.usuarios, activa.usuarioId);
  }

  function rol() {
    const usuario = usuarioActual();
    return usuario ? usuario.rol : null;
  }

  function esAdmin() { return ROLES_ADMIN.indexOf(rol()) > -1; }

  function iniciarSesion(usuario, persistente) {
    const datos = {
      usuarioId: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      iniciadoEn: new Date().toISOString()
    };
    if (persistente === false) {
      try { sessionStorage.setItem(SESION_TEMPORAL, JSON.stringify(datos)); } catch (error) { /* sin sesión temporal */ }
      window.Almacen.escribir(C.sesion, null);
    } else {
      try { sessionStorage.removeItem(SESION_TEMPORAL); } catch (error) { /* sin sesión temporal */ }
      window.Almacen.escribir(C.sesion, datos);
    }
  }

  function fusionarCarrito(usuarioId) {
    const carritos = window.Almacen.leer(C.carritos, {}) || {};
    const invitado = carritos.invitado || [];
    if (!invitado.length) return;
    const propios = Array.isArray(carritos[usuarioId]) ? carritos[usuarioId] : [];
    invitado.forEach(function (item) {
      const repetido = propios.find(function (linea) {
        return linea.productoId === item.productoId && (linea.observacion || '') === (item.observacion || '');
      });
      if (repetido) repetido.cantidad += item.cantidad;
      else propios.push(item);
    });
    carritos[usuarioId] = propios;
    delete carritos.invitado;
    window.Almacen.escribir(C.carritos, carritos);
  }

  function login(correo, password, persistente) {
    const limpio = String(correo || '').trim().toLowerCase();
    const usuarios = window.Almacen.listar(C.usuarios);
    const usuario = usuarios.find(function (u) { return String(u.correo).toLowerCase() === limpio; });
    if (!usuario) return { ok: false, error: 'No existe una cuenta registrada con ese correo.' };
    if (usuario.password !== password) return { ok: false, error: 'La contraseña ingresada no es correcta.' };
    if (usuario.estado === 'inactivo') return { ok: false, error: 'Esta cuenta se encuentra inactiva. Contacta a CaféYa.' };
    iniciarSesion(usuario, persistente);
    fusionarCarrito(usuario.id);
    return { ok: true, usuario: usuario };
  }

  function loginAdmin(correo, password, persistente) {
    const resultado = login(correo, password, persistente);
    if (!resultado.ok) return resultado;
    if (ROLES_ADMIN.indexOf(resultado.usuario.rol) === -1) {
      salir();
      return { ok: false, error: 'Esta cuenta es de cliente. Ingresa por el acceso de clientes.' };
    }
    return resultado;
  }

  function registrar(datos) {
    const correo = String(datos.correo || '').trim().toLowerCase();
    if (!window.Validaciones.unicoCorreo(correo)) {
      return { ok: false, error: 'Ya existe una cuenta con ese correo electrónico.' };
    }
    const usuario = window.Almacen.crear(C.usuarios, {
      nombre: String(datos.nombre || '').trim(),
      correo: correo,
      celular: String(datos.celular || '').trim(),
      password: datos.password,
      rol: 'cliente',
      estado: 'activo',
      distrito: datos.distrito || 'Ica',
      preferencia: datos.preferencia || '',
      creadoEn: new Date().toISOString()
    });
    iniciarSesion(usuario);
    fusionarCarrito(usuario.id);
    return { ok: true, usuario: usuario };
  }

  function salir() {
    try { sessionStorage.removeItem(SESION_TEMPORAL); } catch (error) { /* sin sesión temporal */ }
    window.Almacen.limpiarSesion();
  }

  function rutaActual() {
    return location.pathname.split('/').pop() + location.search;
  }

  function requiereCliente() {
    const usuario = usuarioActual();
    if (!usuario) {
      const destino = encodeURIComponent(rutaActual());
      location.href = 'login.html?next=' + destino;
      return null;
    }
    return usuario;
  }

  function rutaLoginAdmin() {
    return location.pathname.indexOf('/administrador/') > -1
      ? 'login-admin.html'
      : '../administrador/login-admin.html';
  }

  function requiereAdmin(roles) {
    const permitidos = roles || ROLES_ADMIN;
    const usuario = usuarioActual();
    if (!usuario || permitidos.indexOf(usuario.rol) === -1) {
      location.href = rutaLoginAdmin() + '?next=' + encodeURIComponent(rutaActual());
      return null;
    }
    return usuario;
  }

  function actualizarPerfil(cambios) {
    const usuario = usuarioActual();
    if (!usuario) return { ok: false, error: 'No hay una sesión activa.' };
    if (cambios.correo && !window.Validaciones.unicoCorreo(cambios.correo, usuario.id)) {
      return { ok: false, error: 'Ese correo ya pertenece a otra cuenta.' };
    }
    const permitidos = ['nombre', 'correo', 'celular', 'distrito', 'preferencia', 'direccion'];
    const limpios = {};
    permitidos.forEach(function (campo) {
      if (cambios[campo] !== undefined) limpios[campo] = cambios[campo];
    });
    const actualizado = window.Almacen.actualizar(C.usuarios, usuario.id, limpios);
    const activa = sesion();
    if (activa) {
      activa.nombre = actualizado.nombre;
      activa.correo = actualizado.correo;
      window.Almacen.escribir(C.sesion, activa);
    }
    return { ok: true, usuario: actualizado };
  }

  function recuperar(correo) {
    const usuarios = window.Almacen.listar(C.usuarios);
    const usuario = usuarios.find(function (u) {
      return String(u.correo).toLowerCase() === String(correo || '').trim().toLowerCase();
    });
    if (!usuario) {
      return { ok: false, error: 'No encontramos una cuenta asociada a ese correo.' };
    }
    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    sessionStorage.setItem('cafeya_recuperacion', JSON.stringify({
      correo: usuario.correo, codigo: codigo, expira: Date.now() + 10 * 60 * 1000
    }));
    return { ok: true, usuario: usuario, codigo: codigo };
  }

  function verificarCodigo(correo, codigo) {
    try {
      const datos = JSON.parse(sessionStorage.getItem('cafeya_recuperacion') || 'null');
      if (!datos) return { ok: false, error: 'No hay una solicitud de recuperación activa.' };
      if (Date.now() > datos.expira) return { ok: false, error: 'El código expiró. Solicita uno nuevo.' };
      if (datos.correo !== correo || datos.codigo !== codigo) return { ok: false, error: 'El código ingresado no es válido.' };
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'No se pudo verificar el código.' };
    }
  }

  function cambiarPassword(correo, nueva) {
    const usuario = window.Almacen.listar(C.usuarios).find(function (u) {
      return String(u.correo).toLowerCase() === String(correo).toLowerCase();
    });
    if (!usuario) return { ok: false, error: 'Cuenta no encontrada.' };
    window.Almacen.actualizar(C.usuarios, usuario.id, { password: nueva });
    sessionStorage.removeItem('cafeya_recuperacion');
    return { ok: true };
  }

  window.Auth = {
    ROLES_ADMIN: ROLES_ADMIN,
    sesion: sesion,
    usuarioActual: usuarioActual,
    rol: rol,
    esAdmin: esAdmin,
    login: login,
    loginAdmin: loginAdmin,
    registrar: registrar,
    salir: salir,
    requiereCliente: requiereCliente,
    requiereAdmin: requiereAdmin,
    actualizarPerfil: actualizarPerfil,
    recuperar: recuperar,
    verificarCodigo: verificarCodigo,
    cambiarPassword: cambiarPassword,
    iniciarSesion: iniciarSesion
  };
})();
