/* ============================================================
   CafeYa Ica - Roles y permisos del panel administrativo
   ============================================================ */
(function () {
  'use strict';

  const ROLES = {
    administrador: 'Administrador',
    gerencia: 'Gerencia',
    marketing: 'Marketing y atención al cliente',
    operaciones: 'Operaciones y logística',
    cocina: 'Cocina'
  };

  const MODULOS = {
    dashboard: ['administrador', 'gerencia', 'marketing', 'operaciones'],
    pedidos: ['administrador', 'gerencia', 'operaciones'],
    cocina: ['administrador', 'gerencia', 'operaciones', 'cocina'],
    productos: ['administrador', 'gerencia', 'marketing'],
    categorias: ['administrador', 'gerencia', 'marketing'],
    promociones: ['administrador', 'gerencia', 'marketing'],
    mesas: ['administrador', 'gerencia', 'operaciones'],
    reservas: ['administrador', 'gerencia', 'operaciones'],
    clientes: ['administrador', 'gerencia', 'marketing'],
    pagos: ['administrador', 'gerencia', 'operaciones'],
    inventario: ['administrador', 'gerencia', 'operaciones'],
    sugerencias: ['administrador', 'gerencia', 'marketing'],
    fidelizacion: ['administrador', 'gerencia', 'marketing'],
    reportes: ['administrador', 'gerencia'],
    usuarios: ['administrador'],
    configuracion: ['administrador', 'gerencia']
  };

  function rolActual() {
    return window.Auth ? window.Auth.rol() : null;
  }

  function puede(modulo) {
    const rol = rolActual();
    if (!rol) return false;
    if (rol === 'administrador') return true;
    const permitidos = MODULOS[modulo];
    return permitidos ? permitidos.indexOf(rol) > -1 : false;
  }

  function etiquetaRol(rol) {
    return ROLES[rol] || window.Util.cap(rol);
  }

  function esRolAdministrativo(rol) {
    return Object.keys(ROLES).indexOf(rol) > -1;
  }

  window.Permisos = {
    ROLES: ROLES,
    MODULOS: MODULOS,
    puede: puede,
    etiquetaRol: etiquetaRol,
    esRolAdministrativo: esRolAdministrativo
  };
})();
