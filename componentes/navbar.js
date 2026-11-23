/* ============================================================
   CafeYa Ica - Barra de navegación y pie del sitio público
   ============================================================ */
(function () {
  'use strict';

  function montar(opciones) {
    const o = opciones || {};
    const contenedor = document.getElementById(o.contenedor || 'navbar');
    if (!contenedor) return;
    const usuario = window.Auth ? window.Auth.usuarioActual() : null;
    const esAdmin = usuario && window.Auth.esAdmin();
    const panelHref = usuario ? (esAdmin ? 'administrador/dashboard.html' : 'cliente/cliente.html') : 'cliente/login.html';
    const panelTexto = usuario ? 'Mi panel' : 'Ingresar';

    contenedor.innerHTML =
      '<header class="sitio-header" id="sitio-header">' +
        '<nav class="sitio-nav">' +
          '<a class="sitio-logo" href="index.html">' +
            '<img src="assets/logos/logo.svg" alt="CaféYa Ica">' +
            '<span><span class="marca">Café<span>Ya</span></span><small>Ica · Café de especialidad</small></span>' +
          '</a>' +
          '<div class="sitio-menu" id="sitio-menu">' +
            '<a href="index.html">Inicio</a>' +
            '<a href="cliente/menu.html">Menú digital</a>' +
            '<a href="index.html#promociones">Promociones</a>' +
            '<a href="index.html#estudio">Zona de estudio</a>' +
            '<a href="index.html#fidelizacion">Fidelización</a>' +
            '<a href="index.html#contacto">Contacto</a>' +
          '</div>' +
          '<div class="sitio-acciones">' +
            '<a class="btn btn-ghost btn-sm" href="' + panelHref + '">' + panelTexto + '</a>' +
            (usuario ? '' : '<a class="btn btn-claro btn-sm" href="cliente/registro.html">Crear cuenta</a>') +
            '<a class="btn btn-primario btn-sm" href="cliente/menu.html">Pedir para recoger</a>' +
          '</div>' +
          '<button class="menu-movil-btn" id="menu-movil" type="button" aria-label="Abrir menú">☰</button>' +
        '</nav>' +
      '</header>';

    const boton = document.getElementById('menu-movil');
    const menu = document.getElementById('sitio-menu');
    if (boton && menu) {
      boton.addEventListener('click', function () {
        menu.classList.toggle('abierto');
        boton.textContent = menu.classList.contains('abierto') ? '✕' : '☰';
      });
      Array.prototype.forEach.call(menu.querySelectorAll('a'), function (enlace) {
        enlace.addEventListener('click', function () {
          menu.classList.remove('abierto');
          boton.textContent = '☰';
        });
      });
    }

    const cabecera = document.getElementById('sitio-header');
    if (cabecera) {
      const revisarScroll = function () {
        cabecera.style.boxShadow = window.scrollY > 12 ? '0 10px 30px rgba(31,36,97,.10)' : 'none';
      };
      window.addEventListener('scroll', revisarScroll);
      revisarScroll();
    }
  }

  function pie() {
    const contenedor = document.getElementById('footer');
    if (!contenedor) return;
    const config = window.Almacen.config();
    const horario = config.horario || { apertura: '08:00', cierre: '22:00', dias: 'Lunes a domingo' };
    contenedor.innerHTML =
      '<footer class="pie-sitio">' +
        '<div class="pie-grid">' +
          '<div>' +
            '<div class="pie-marca"><img src="assets/logos/logo.svg" alt="CaféYa Ica">' +
              '<div><strong style="color:#fff;font-size:17px">CaféYa Ica S.A.C.</strong>' +
              '<div style="font-size:10px;letter-spacing:2px;color:#8E94C4;text-transform:uppercase">Café de especialidad</div></div></div>' +
            '<p>' + window.Util.esc(config.mensajeBienvenida || 'Café de especialidad en el corazón de Ica.') + '</p>' +
            '<div class="pie-redes">' +
              '<a href="' + window.Util.esc((config.redes || {}).facebook || '#') + '" target="_blank" rel="noopener">Facebook</a>' +
              '<a href="' + window.Util.esc((config.redes || {}).instagram || '#') + '" target="_blank" rel="noopener">Instagram</a>' +
              '<a href="' + window.Util.esc((config.redes || {}).tiktok || '#') + '" target="_blank" rel="noopener">TikTok</a>' +
            '</div>' +
          '</div>' +
          '<div>' +
            '<h4>Explorar</h4>' +
            '<a href="cliente/menu.html">Menú digital</a>' +
            '<a href="cliente/reserva.html">Reservar mesa</a>' +
            '<a href="cliente/mesas.html">Mesas y QR</a>' +
            '<a href="cliente/fidelizacion.html">Cliente frecuente</a>' +
            '<a href="cliente/sugerencias.html">Buzón de sugerencias</a>' +
          '</div>' +
          '<div>' +
            '<h4>Accesos</h4>' +
            '<a href="cliente/login.html">Ingreso de clientes</a>' +
            '<a href="cliente/registro.html">Crear una cuenta</a>' +
            '<a href="administrador/login-admin.html">Panel administrativo</a>' +
            '<a href="cocina/cocina.html">Panel de cocina</a>' +
            '<a href="index.html#contacto">Cómo llegar</a>' +
          '</div>' +
          '<div>' +
            '<h4>Contacto</h4>' +
            '<p style="margin:0 0 8px">📍 ' + window.Util.esc(config.direccion || 'Av. Los Maestros 245, Ica') + '</p>' +
            '<p style="margin:0 0 8px">📞 ' + window.Util.esc(config.telefono || '(056) 234 567') + '</p>' +
            '<p style="margin:0 0 8px">📱 ' + window.Util.esc(config.whatsapp || '956 789 123') + '</p>' +
            '<p style="margin:0 0 8px">✉️ ' + window.Util.esc(config.correo || 'hola@cafeya.pe') + '</p>' +
            '<p style="margin:0">🕒 ' + window.Util.esc(horario.dias) + ' · ' + window.Util.esc(horario.apertura) + ' a ' + window.Util.esc(horario.cierre) + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="pie-final">' +
          '<span>© ' + new Date().getFullYear() + ' CaféYa Ica S.A.C. · Proyecto académico demostrativo</span>' +
          '<span>Pagos simulados · Datos almacenados en tu navegador</span>' +
        '</div>' +
      '</footer>';
  }

  window.Navbar = { montar: montar, pie: pie };
})();
