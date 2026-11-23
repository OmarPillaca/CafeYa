/* ============================================================
   CafeYa Ica - Capa central de almacenamiento (localStorage)
   ============================================================ */
(function () {
  'use strict';

  const PREFIJO = 'cafeya_';

  const CLAVES = {
    usuarios: 'usuarios',
    sesion: 'sesion',
    categorias: 'categorias',
    productos: 'productos',
    promociones: 'promociones',
    carritos: 'carritos',
    pedidos: 'pedidos',
    pagos: 'pagos',
    mesas: 'mesas',
    reservas: 'reservas',
    compartidas: 'compartidas',
    fidelizacion: 'fidelizacion',
    sugerencias: 'sugerencias',
    inventario: 'inventario',
    notificaciones: 'notificaciones',
    config: 'config',
    inicializado: 'inicializado'
  };

  const EVENTO = 'cafeya:cambio';

  function claveCompleta(clave) {
    return PREFIJO + clave;
  }

  function leer(clave, porDefecto) {
    try {
      const crudo = localStorage.getItem(claveCompleta(clave));
      if (crudo === null || crudo === undefined) return porDefecto;
      return JSON.parse(crudo);
    } catch (error) {
      console.warn('CafeYa: no se pudo leer', clave, error);
      return porDefecto;
    }
  }

  function escribir(clave, valor) {
    try {
      localStorage.setItem(claveCompleta(clave), JSON.stringify(valor));
      window.dispatchEvent(new CustomEvent(EVENTO, { detail: { coleccion: clave } }));
      return true;
    } catch (error) {
      console.error('CafeYa: no se pudo guardar', clave, error);
      if (window.Notificaciones) {
        window.Notificaciones.error('Almacenamiento lleno', 'No se pudo guardar la información.');
      }
      return false;
    }
  }

  function listar(coleccion) {
    const datos = leer(coleccion, []);
    return Array.isArray(datos) ? datos : [];
  }

  function guardarLista(coleccion, lista) {
    return escribir(coleccion, lista);
  }

  function generarId(prefijo) {
    const base = (prefijo || 'id') + '-' + Date.now().toString(36).slice(-6) +
      Math.random().toString(36).slice(2, 6);
    return base;
  }

  function crear(coleccion, objeto) {
    const lista = listar(coleccion);
    const registro = Object.assign({}, objeto);
    if (!registro.id) registro.id = generarId(coleccion.slice(0, 4));
    if (!registro.creadoEn) registro.creadoEn = new Date().toISOString();
    lista.push(registro);
    guardarLista(coleccion, lista);
    return registro;
  }

  function actualizar(coleccion, id, cambios) {
    const lista = listar(coleccion);
    const indice = lista.findIndex(function (item) { return item.id === id; });
    if (indice === -1) return null;
    lista[indice] = Object.assign({}, lista[indice], cambios, { actualizadoEn: new Date().toISOString() });
    guardarLista(coleccion, lista);
    return lista[indice];
  }

  function eliminar(coleccion, id) {
    const lista = listar(coleccion);
    const nueva = lista.filter(function (item) { return item.id !== id; });
    guardarLista(coleccion, nueva);
    return lista.length !== nueva.length;
  }

  function buscar(coleccion, id) {
    if (!id) return null;
    return listar(coleccion).find(function (item) { return item.id === id; }) || null;
  }

  function filtro(coleccion, funcion) {
    return listar(coleccion).filter(funcion);
  }

  function config() {
    return leer(CLAVES.config, {}) || {};
  }

  function guardarConfig(cambios) {
    const actual = config();
    const nueva = Object.assign({}, actual, cambios);
    escribir(CLAVES.config, nueva);
    return nueva;
  }

  function alCambiar(callback) {
    function local(evento) {
      callback(evento.detail ? evento.detail.coleccion : null);
    }
    function externo(evento) {
      if (evento.key && evento.key.indexOf(PREFIJO) === 0) {
        callback(evento.key.replace(PREFIJO, ''));
      }
    }
    window.addEventListener(EVENTO, local);
    window.addEventListener('storage', externo);
    return function () {
      window.removeEventListener(EVENTO, local);
      window.removeEventListener('storage', externo);
    };
  }

  function restaurarDemo() {
    Object.keys(localStorage).forEach(function (llave) {
      if (llave.indexOf(PREFIJO) === 0) localStorage.removeItem(llave);
    });
    if (window.DatosIniciales) {
      window.DatosIniciales.sembrar(true);
    }
    window.dispatchEvent(new CustomEvent(EVENTO, { detail: { coleccion: 'todo' } }));
  }

  function respaldar() {
    const paquete = { version: 1, fecha: new Date().toISOString(), datos: {} };
    Object.keys(CLAVES).forEach(function (llave) {
      paquete.datos[llave] = leer(CLAVES[llave], null);
    });
    return paquete;
  }

  function limpiarSesion() {
    escribir(CLAVES.sesion, null);
  }

  window.Almacen = {
    PREFIJO: PREFIJO,
    CLAVES: CLAVES,
    EVENTO: EVENTO,
    leer: leer,
    escribir: escribir,
    listar: listar,
    guardarLista: guardarLista,
    crear: crear,
    actualizar: actualizar,
    eliminar: eliminar,
    buscar: buscar,
    filtrar: filtro,
    generarId: generarId,
    config: config,
    guardarConfig: guardarConfig,
    alCambiar: alCambiar,
    restaurarDemo: restaurarDemo,
    respaldar: respaldar,
    limpiarSesion: limpiarSesion
  };
})();
