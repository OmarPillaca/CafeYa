/* ============================================================
   CafeYa Ica - Configuración general del sistema
   ============================================================ */
(function () {
  'use strict';

  let contenido = null;

  function render() {
    const config = window.Almacen.config();
    const horario = config.horario || {};
    const metodos = config.metodosPago || {};
    const redes = config.redes || {};
    const usuarios = window.Almacen.listar('usuarios');
    const pedidos = window.Almacen.listar('pedidos');

    contenido.innerHTML =
      '<div class="config-grid">' +
        '<div class="config-card">' +
          '<h3><span>🏪</span>Datos del negocio</h3>' +
          '<p class="config-sub">Información que aparece en la página principal y comprobantes.</p>' +
          '<div class="form-grid">' +
            '<div class="campo"><label for="cf-nombre">Razón social</label><input id="cf-nombre" value="' + window.Util.esc(config.nombre || '') + '"></div>' +
            '<div class="form-grid dos">' +
              '<div class="campo"><label for="cf-ruc">RUC</label><input id="cf-ruc" value="' + window.Util.esc(config.ruc || '') + '"></div>' +
              '<div class="campo"><label for="cf-telefono">Teléfono</label><input id="cf-telefono" value="' + window.Util.esc(config.telefono || '') + '"></div>' +
            '</div>' +
            '<div class="campo"><label for="cf-correo">Correo de contacto</label><input id="cf-correo" type="email" value="' + window.Util.esc(config.correo || '') + '"></div>' +
            '<div class="campo"><label for="cf-direccion">Dirección</label><input id="cf-direccion" value="' + window.Util.esc(config.direccion || '') + '"></div>' +
            '<div class="campo"><label for="cf-referencia">Referencia</label><input id="cf-referencia" value="' + window.Util.esc(config.referencia || '') + '"></div>' +
            '<div class="campo"><label for="cf-mensaje">Mensaje de bienvenida</label><textarea id="cf-mensaje" rows="2" maxlength="180">' + window.Util.esc(config.mensajeBienvenida || '') + '</textarea></div>' +
          '</div>' +
        '</div>' +
        '<div class="config-card">' +
          '<h3><span>🕒</span>Horarios y operación</h3>' +
          '<p class="config-sub">Se usan para validar la hora de recojo de los pedidos.</p>' +
          '<div class="form-grid">' +
            '<div class="form-grid dos">' +
              '<div class="campo"><label for="cf-apertura">Apertura</label><input type="time" id="cf-apertura" value="' + (horario.apertura || '08:00') + '"></div>' +
              '<div class="campo"><label for="cf-cierre">Cierre</label><input type="time" id="cf-cierre" value="' + (horario.cierre || '22:00') + '"></div>' +
            '</div>' +
            '<div class="campo"><label for="cf-dias">Días de atención</label><input id="cf-dias" value="' + window.Util.esc(horario.dias || 'Lunes a domingo') + '"></div>' +
            '<div class="form-grid dos">' +
              '<div class="campo"><label for="cf-objetivo">Objetivo de preparación (min)</label>' +
                '<input type="number" id="cf-objetivo" min="1" max="30" value="' + (config.tiempoObjetivo || 8) + '"></div>' +
              '<div class="campo"><label for="cf-aforo">Aforo del local</label>' +
                '<input type="number" id="cf-aforo" min="1" max="200" value="' + (config.aforo || 42) + '"></div>' +
            '</div>' +
            '<div class="campo"><label for="cf-whatsapp">WhatsApp</label><input id="cf-whatsapp" value="' + window.Util.esc(config.whatsapp || '') + '"></div>' +
          '</div>' +
        '</div>' +
        '<div class="config-card">' +
          '<h3><span>💳</span>Métodos de pago demostrativos</h3>' +
          '<p class="config-sub">Habilita las opciones que verá el cliente al pagar.</p>' +
          '<div class="config-metodos">' +
            '<label><input type="checkbox" data-metodo="yape"' + (metodos.yape !== false ? ' checked' : '') + '>' +
              '<span class="emoji">📱</span><span>Yape<small>QR demostrativo</small></span></label>' +
            '<label><input type="checkbox" data-metodo="plin"' + (metodos.plin !== false ? ' checked' : '') + '>' +
              '<span class="emoji">📲</span><span>Plin<small>QR demostrativo</small></span></label>' +
            '<label><input type="checkbox" data-metodo="tarjeta"' + (metodos.tarjeta !== false ? ' checked' : '') + '>' +
              '<span class="emoji">💳</span><span>Tarjeta<small>Formulario simulado</small></span></label>' +
            '<label><input type="checkbox" data-metodo="efectivo"' + (metodos.efectivo !== false ? ' checked' : '') + '>' +
              '<span class="emoji">💵</span><span>Efectivo<small>Pago en caja del local</small></span></label>' +
          '</div>' +
          '<div class="alerta mt-2"><span class="alerta-icono">🧪</span><div>Ningún pago es real. Toda la pasarela está simulada para la exposición.</div></div>' +
          '<div class="campo mt-2"><label for="cf-redes">Redes sociales</label>' +
            '<div class="form-grid">' +
              '<input id="cf-facebook" placeholder="Facebook" value="' + window.Util.esc(redes.facebook || '') + '">' +
              '<input id="cf-instagram" placeholder="Instagram" value="' + window.Util.esc(redes.instagram || '') + '">' +
              '<input id="cf-tiktok" placeholder="TikTok" value="' + window.Util.esc(redes.tiktok || '') + '">' +
            '</div></div>' +
        '</div>' +
        '<div class="config-card">' +
          '<h3><span>🗄️</span>Datos del sistema</h3>' +
          '<p class="config-sub">Todo se guarda en el localStorage de este navegador.</p>' +
          '<div class="config-resumen">' +
            '<div><span>Usuarios</span><strong>' + usuarios.length + '</strong></div>' +
            '<div><span>Pedidos</span><strong>' + pedidos.length + '</strong></div>' +
            '<div><span>Productos</span><strong>' + window.Almacen.listar('productos').length + '</strong></div>' +
            '<div><span>Pagos</span><strong>' + window.Almacen.listar('pagos').length + '</strong></div>' +
            '<div><span>Sugerencias</span><strong>' + window.Almacen.listar('sugerencias').length + '</strong></div>' +
            '<div><span>Última actualización</span><strong>' + window.Util.fechaHora(config.actualizadoEn || new Date()) + '</strong></div>' +
          '</div>' +
          '<div class="config-acciones">' +
            '<button type="button" class="btn btn-claro btn-sm" id="cf-respaldo">Descargar respaldo JSON</button>' +
            '<button type="button" class="btn btn-peligro btn-sm" id="cf-restaurar">Restaurar datos de demostración</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="config-acciones">' +
        '<button type="button" class="btn btn-primario" id="cf-guardar">Guardar configuración</button>' +
        '<a class="btn btn-claro" href="../index.html">Ver sitio público</a>' +
      '</div>';

    document.getElementById('cf-guardar').addEventListener('click', guardar);
    document.getElementById('cf-respaldo').addEventListener('click', function () {
      window.Util.descargar('cafeya-respaldo-' + window.Util.hoyISO() + '.json',
        JSON.stringify(window.Almacen.respaldar(), null, 2), 'application/json');
      window.Notificaciones.exito('Respaldo descargado', 'Se guardó una copia JSON de los datos.');
    });
    document.getElementById('cf-restaurar').addEventListener('click', function () {
      window.Modal.confirmar({
        titulo: 'Restaurar datos de demostración',
        mensaje: 'Se eliminarán los pedidos, productos y registros actuales y se restaurarán los datos iniciales. Esta acción no se puede deshacer.',
        peligro: true,
        textoOk: 'Sí, restaurar todo'
      }).then(function (confirmado) {
        if (!confirmado) return;
        window.Almacen.restaurarDemo();
        window.Notificaciones.exito('Datos restaurados', 'El sistema volvió al estado inicial de demostración.');
        setTimeout(function () { window.location.reload(); }, 900);
      });
    });
  }

  function guardar() {
    const nombre = document.getElementById('cf-nombre').value.trim();
    const correo = document.getElementById('cf-correo').value.trim();
    const apertura = document.getElementById('cf-apertura').value;
    const cierre = document.getElementById('cf-cierre').value;
    if (nombre.length < 3) { window.Notificaciones.error('Nombre inválido', 'Ingresa la razón social del negocio.'); return; }
    if (!window.Validaciones.correo(correo)) { window.Notificaciones.error('Correo inválido', 'Revisa el correo de contacto.'); return; }
    if (!apertura || !cierre || apertura >= cierre) { window.Notificaciones.error('Horario inválido', 'La apertura debe ser anterior al cierre.'); return; }

    const metodosPago = {};
    ['yape', 'plin', 'tarjeta', 'efectivo'].forEach(function (metodo) {
      const casilla = document.querySelector('[data-metodo="' + metodo + '"]');
      metodosPago[metodo] = !!(casilla && casilla.checked);
    });
    if (!Object.keys(metodosPago).some(function (m) { return metodosPago[m]; })) {
      window.Notificaciones.error('Métodos de pago', 'Debe quedar al menos un método habilitado.');
      return;
    }

    window.Almacen.guardarConfig({
      nombre: nombre,
      ruc: document.getElementById('cf-ruc').value.trim(),
      telefono: document.getElementById('cf-telefono').value.trim(),
      whatsapp: document.getElementById('cf-whatsapp').value.trim(),
      correo: correo,
      direccion: document.getElementById('cf-direccion').value.trim(),
      referencia: document.getElementById('cf-referencia').value.trim(),
      mensajeBienvenida: document.getElementById('cf-mensaje').value.trim(),
      horario: {
        apertura: apertura,
        cierre: cierre,
        dias: document.getElementById('cf-dias').value.trim()
      },
      tiempoObjetivo: Number(document.getElementById('cf-objetivo').value) || 8,
      aforo: Number(document.getElementById('cf-aforo').value) || 42,
      metodosPago: metodosPago,
      redes: {
        facebook: document.getElementById('cf-facebook').value.trim(),
        instagram: document.getElementById('cf-instagram').value.trim(),
        tiktok: document.getElementById('cf-tiktok').value.trim()
      },
      actualizadoEn: new Date().toISOString()
    });
    window.Notificaciones.exito('Configuración guardada', 'Los cambios se aplican en todos los paneles.');
  }

  document.addEventListener('DOMContentLoaded', function () {
    contenido = window.AdminUI.montar({
      pagina: 'configuracion',
      titulo: 'Configuración',
      subtitulo: 'Datos del negocio, horarios y métodos de pago'
    });
    if (!contenido) return;
    render();
  });
})();
