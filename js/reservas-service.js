/* ============================================================
   CafeYa Ica - Servicio de reservas de mesas
   ============================================================ */
(function () {
  'use strict';

  const C = window.Almacen.CLAVES;
  const ACTIVAS = ['pendiente', 'confirmada'];

  function listar() {
    return window.Almacen.listar(C.reservas).slice().sort(function (a, b) {
      if (a.fecha === b.fecha) return a.hora < b.hora ? -1 : 1;
      return a.fecha < b.fecha ? 1 : -1;
    });
  }

  function porUsuario(usuarioId) {
    return listar().filter(function (r) { return r.usuarioId === usuarioId; });
  }

  function porId(id) { return window.Almacen.buscar(C.reservas, id); }

  function activasDeFecha(fecha) {
    return listar().filter(function (r) { return r.fecha === fecha && ACTIVAS.indexOf(r.estado) > -1; });
  }

  function deMesa(mesaId, fecha) {
    return activasDeFecha(fecha).filter(function (r) { return r.mesaId === mesaId; });
  }

  function disponible(mesaId, fecha, hora, ignorarId) {
    const mesa = window.Almacen.buscar(C.mesas, mesaId);
    if (!mesa) return { ok: false, error: 'La mesa seleccionada no existe.' };
    if (mesa.estado === 'fuera') return { ok: false, error: 'Esa mesa se encuentra fuera de servicio.' };
    if (!fecha) return { ok: false, error: 'Selecciona una fecha.' };
    if (!hora) return { ok: false, error: 'Selecciona un horario.' };
    const ocupada = listar().some(function (r) {
      return r.id !== ignorarId && r.mesaId === mesaId && r.fecha === fecha &&
        r.hora === hora && ACTIVAS.indexOf(r.estado) > -1;
    });
    if (ocupada) return { ok: false, error: 'La mesa ya tiene una reserva activa en ese horario.' };
    return { ok: true };
  }

  function crear(datos) {
    const usuario = window.Auth.usuarioActual();
    if (!usuario) return { ok: false, error: 'Inicia sesión para reservar una mesa.' };
    const mesa = window.Almacen.buscar(C.mesas, datos.mesaId);
    if (!mesa) return { ok: false, error: 'Selecciona una mesa del mapa.' };
    if (!datos.fecha) return { ok: false, error: 'Selecciona la fecha de la reserva.' };
    if (datos.fecha < window.Util.hoyISO()) return { ok: false, error: 'No puedes reservar en una fecha pasada.' };
    if (window.Util.slots().indexOf(datos.hora) === -1) return { ok: false, error: 'Selecciona un horario dentro de la atención.' };
    const personas = Number(datos.personas) || 0;
    if (personas < 1) return { ok: false, error: 'Indica el número de personas.' };
    if (personas > mesa.capacidad) {
      return { ok: false, error: 'La mesa ' + mesa.numero + ' tiene capacidad para ' + mesa.capacidad + ' personas.' };
    }
    const revision = disponible(mesa.id, datos.fecha, datos.hora);
    if (!revision.ok) return revision;

    const reserva = window.Almacen.crear(C.reservas, {
      usuarioId: usuario.id,
      cliente: usuario.nombre,
      celular: usuario.celular,
      correo: usuario.correo,
      mesaId: mesa.id,
      numeroMesa: mesa.numero,
      fecha: datos.fecha,
      hora: datos.hora,
      personas: personas,
      nota: datos.nota || '',
      estado: 'pendiente'
    });

    if (datos.fecha === window.Util.hoyISO() && mesa.estado === 'libre') {
      window.Almacen.actualizar(C.mesas, mesa.id, { estado: 'reservada' });
    }
    if (window.Notificaciones) {
      window.Notificaciones.exito('Reserva registrada',
        'Mesa ' + mesa.numero + ' para el ' + window.Util.fecha(datos.fecha) + ' a las ' + datos.hora + '.');
    }
    return { ok: true, reserva: reserva, mesa: mesa };
  }

  function cambiarEstado(reservaId, estado) {
    const reserva = porId(reservaId);
    if (!reserva) return { ok: false, error: 'Reserva no encontrada.' };
    window.Almacen.actualizar(C.reservas, reservaId, {
      estado: estado,
      actualizadoEn: new Date().toISOString()
    });
    if ((estado === 'confirmada' || estado === 'cancelada') && reserva.fecha === window.Util.hoyISO()) {
      const mesa = window.Almacen.buscar(C.mesas, reserva.mesaId);
      if (mesa) {
        const otras = listar().filter(function (r) {
          return r.id !== reservaId && r.mesaId === mesa.id && r.fecha === reserva.fecha &&
            ACTIVAS.indexOf(r.estado) > -1;
        });
        if (!otras.length && estado === 'cancelada' && mesa.estado === 'reservada') {
          window.Almacen.actualizar(C.mesas, mesa.id, { estado: 'libre' });
        }
        if (estado === 'confirmada' && mesa.estado === 'libre') {
          window.Almacen.actualizar(C.mesas, mesa.id, { estado: 'reservada' });
        }
      }
    }
    return { ok: true, reserva: porId(reservaId) };
  }

  function cancelar(reservaId) {
    return cambiarEstado(reservaId, 'cancelada');
  }

  function proximas() {
    const hoy = window.Util.hoyISO();
    return listar().filter(function (r) {
      return r.fecha >= hoy && ACTIVAS.indexOf(r.estado) > -1;
    }).sort(function (a, b) {
      if (a.fecha === b.fecha) return a.hora < b.hora ? -1 : 1;
      return a.fecha < b.fecha ? -1 : 1;
    });
  }

  function deHoy() {
    return activasDeFecha(window.Util.hoyISO());
  }

  return window.Reservas = {
    HORAS: window.Util.slots(),
    listar: listar,
    porUsuario: porUsuario,
    porId: porId,
    deMesa: deMesa,
    deHoy: deHoy,
    proximas: proximas,
    disponible: disponible,
    crear: crear,
    cambiarEstado: cambiarEstado,
    cancelar: cancelar,
    estadisticas: function () {
      const reservas = listar();
      return {
        total: reservas.length,
        pendientes: reservas.filter(function (r) { return r.estado === 'pendiente'; }).length,
        confirmadas: reservas.filter(function (r) { return r.estado === 'confirmada'; }).length,
        canceladas: reservas.filter(function (r) { return r.estado === 'cancelada'; }).length,
        hoy: deHoy().length
      };
    }
  };
})();
