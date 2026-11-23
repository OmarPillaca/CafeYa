/* ============================================================
   CafeYa Ica - Datos iniciales de demostración
   Se generan automáticamente la primera vez que se abre el sistema.
   ============================================================ */
(function () {
  'use strict';

  const C = window.Almacen.CLAVES;
  const UNSPLASH = 'https://images.unsplash.com/photo-';
  const PARAM = '?auto=format&fit=crop&w=700&q=70';

  function img(foto) { return UNSPLASH + foto + PARAM; }

  function iso(dias, hora, minuto) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    if (hora !== undefined) fecha.setHours(hora, minuto || 0, 0, 0);
    return fecha.toISOString();
  }

  function fechaClave(dias) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + (dias || 0));
    return fecha.toISOString().slice(0, 10);
  }

  /* ---------- Usuarios de prueba ---------- */
  function usuariosDemo() {
    return [
      {
        id: 'u-admin', nombre: 'Andrea Salazar', correo: 'admin@cafeya.pe', password: 'admin123',
        celular: '956 112 233', rol: 'administrador', estado: 'activo', cargo: 'Administradora general',
        creadoEn: iso(-120, 9, 0)
      },
      {
        id: 'u-gerencia', nombre: 'Roberto Ibarra', correo: 'gerencia@cafeya.pe', password: 'gerencia123',
        celular: '956 445 566', rol: 'gerencia', estado: 'activo', cargo: 'Gerente de operaciones',
        creadoEn: iso(-118, 9, 0)
      },
      {
        id: 'u-marketing', nombre: 'Lucía Prado', correo: 'marketing@cafeya.pe', password: 'marketing123',
        celular: '956 778 899', rol: 'marketing', estado: 'activo', cargo: 'Marketing y atención al cliente',
        creadoEn: iso(-110, 9, 0)
      },
      {
        id: 'u-operaciones', nombre: 'Miguel Ángel Rojas', correo: 'operaciones@cafeya.pe', password: 'operaciones123',
        celular: '956 990 011', rol: 'operaciones', estado: 'activo', cargo: 'Operaciones y logística',
        creadoEn: iso(-105, 9, 0)
      },
      {
        id: 'u-cocina', nombre: 'Chef Daniel Vargas', correo: 'cocina@cafeya.pe', password: 'cocina123',
        celular: '956 223 344', rol: 'cocina', estado: 'activo', cargo: 'Jefe de cocina',
        creadoEn: iso(-100, 9, 0)
      },
      {
        id: 'u-cliente', nombre: 'María Fernández', correo: 'cliente@cafeya.pe', password: '123456',
        celular: '987 654 321', rol: 'cliente', estado: 'activo', creadoEn: iso(-95, 16, 20),
        distrito: 'Ica', preferencia: 'Cafés y postres'
      },
      {
        id: 'u-cliente2', nombre: 'Carlos Ramos', correo: 'cliente2@cafeya.pe', password: '123456',
        celular: '912 345 678', rol: 'cliente', estado: 'activo', creadoEn: iso(-80, 11, 10),
        distrito: 'Ica', preferencia: 'Bebidas frías'
      },
      {
        id: 'u-cliente3', nombre: 'Ana Torres', correo: 'ana.torres@cafeya.pe', password: '123456',
        celular: '934 556 778', rol: 'cliente', estado: 'activo', creadoEn: iso(-60, 18, 40),
        distrito: 'Ica', preferencia: 'Desayunos'
      },
      {
        id: 'u-cliente4', nombre: 'Luis Paredes', correo: 'luis.paredes@cafeya.pe', password: '123456',
        celular: '945 667 889', rol: 'cliente', estado: 'activo', creadoEn: iso(-42, 20, 15),
        distrito: 'Ica', preferencia: 'Combos'
      },
      {
        id: 'u-cliente5', nombre: 'Rosa Mendoza', correo: 'rosa.mendoza@cafeya.pe', password: '123456',
        celular: '967 889 900', rol: 'cliente', estado: 'inactivo', creadoEn: iso(-30, 12, 5),
        distrito: 'La Tinguiña', preferencia: 'Postres'
      }
    ];
  }

  /* ---------- Categorías ---------- */
  function categoriasDemo() {
    return [
      { id: 'cat-cafes', nombre: 'Cafés', descripcion: 'Cafés de especialidad preparados al momento', icono: '☕', activa: true, orden: 1 },
      { id: 'cat-calientes', nombre: 'Bebidas calientes', descripcion: 'Infusiones y chocolates calientes', icono: '🍵', activa: true, orden: 2 },
      { id: 'cat-frias', nombre: 'Bebidas frías', descripcion: 'Frappés, iced lattes y refrescos', icono: '🧊', activa: true, orden: 3 },
      { id: 'cat-desayunos', nombre: 'Desayunos', descripcion: 'Opciones para empezar el día', icono: '🥐', activa: true, orden: 4 },
      { id: 'cat-postres', nombre: 'Postres', descripcion: 'Repostería artesanal del día', icono: '🍰', activa: true, orden: 5 },
      { id: 'cat-combos', nombre: 'Combos', descripcion: 'Combinaciones con precio especial', icono: '🎁', activa: true, orden: 6 }
    ];
  }

  /* ---------- Productos ---------- */
  function productosDemo() {
    return [
      { id: 'p-americano', nombre: 'Café Americano', descripcion: 'Café de especialidad con agua caliente, aroma intenso y cuerpo equilibrado.', precio: 7.00, categoriaId: 'cat-cafes', imagen: img('1509042239860-f550ce710b93'), emoji: '☕', disponible: true, destacado: false, tags: ['clásico', 'vegano'] },
      { id: 'p-espresso', nombre: 'Espresso doble', descripcion: 'Doble shot de café iqueño tostado medio, crema densa y notas a cacao.', precio: 6.00, categoriaId: 'cat-cafes', imagen: img('1510707577719-ae7c14805e3a'), emoji: '☕', disponible: true, destacado: false, tags: ['intenso'] },
      { id: 'p-capuchino', nombre: 'Capuchino clásico', descripcion: 'Espresso con leche vaporizada y espuma cremosa, terminado con canela.', precio: 9.50, categoriaId: 'cat-cafes', imagen: img('1572442388796-11668a67e53d'), emoji: '☕', disponible: true, destacado: true, tags: ['favorito'] },
      { id: 'p-latte', nombre: 'Latte de vainilla', descripcion: 'Café suave con leche y un toque de vainilla peruana.', precio: 11.00, categoriaId: 'cat-cafes', imagen: img('1541167760496-1628856ab772'), emoji: '🥛', disponible: true, destacado: true, tags: ['suave'] },
      { id: 'p-mocha', nombre: 'Mocha CaféYa', descripcion: 'Espresso, chocolate artesanal y leche, servido con crema batida.', precio: 12.00, categoriaId: 'cat-cafes', imagen: img('1578314675249-a6910f80cc4e'), emoji: '🍫', disponible: true, destacado: true, tags: ['dulce', 'favorito'] },
      { id: 'p-cortado', nombre: 'Cortado iqueño', descripcion: 'Espresso cortado con un chorrito de leche tibia.', precio: 7.50, categoriaId: 'cat-cafes', imagen: img('1517701550927-30cf4ba1dba5'), emoji: '☕', disponible: true, destacado: false, tags: ['corto'] },

      { id: 'p-chocolate', nombre: 'Chocolate caliente', descripcion: 'Chocolate peruano derretido con leche y malvaviscos.', precio: 10.00, categoriaId: 'cat-calientes', imagen: img('1542990253-0d0f5be5f0ed'), emoji: '🍫', disponible: true, destacado: false, tags: ['dulce'] },
      { id: 'p-matcha', nombre: 'Matcha latte', descripcion: 'Té verde matcha ceremonial con leche vaporizada.', precio: 13.00, categoriaId: 'cat-calientes', imagen: img('1515823064-d6e0c04616a7'), emoji: '🍵', disponible: true, destacado: false, tags: ['vegetariano'] },
      { id: 'p-te', nombre: 'Té de hierbas', descripcion: 'Infusión de manzanilla, hierbabuena y limón.', precio: 6.00, categoriaId: 'cat-calientes', imagen: img('1544787219-7f47ccb76574'), emoji: '🫖', disponible: true, destacado: false, tags: ['natural'] },
      { id: 'p-chai', nombre: 'Chai latte', descripcion: 'Té negro especiado con canela, jengibre y leche cremosa.', precio: 11.50, categoriaId: 'cat-calientes', imagen: img('1571934811356-5cc061b6821f'), emoji: '🍵', disponible: true, destacado: false, tags: ['especiado'] },

      { id: 'p-icedlatte', nombre: 'Iced latte', descripcion: 'Café frío con leche y hielo, perfecto para la tarde iqueña.', precio: 12.00, categoriaId: 'cat-frias', imagen: img('1517701604599-bb29b565090c'), emoji: '🧊', disponible: true, destacado: true, tags: ['frío', 'favorito'] },
      { id: 'p-frappe', nombre: 'Frappé de café', descripcion: 'Café licuado con hielo, leche y crema batida.', precio: 14.00, categoriaId: 'cat-frias', imagen: img('1461023058943-07fcbe16d735'), emoji: '🥤', disponible: true, destacado: true, tags: ['frío', 'dulce'] },
      { id: 'p-limonada', nombre: 'Limonada frozen', descripcion: 'Limón sutil iqueño, hierbabuena y hielo frappé.', precio: 10.00, categoriaId: 'cat-frias', imagen: img('1523677011781-c91d1bbe2f9d'), emoji: '🍋', disponible: true, destacado: false, tags: ['refrescante'] },
      { id: 'p-coldbrew', nombre: 'Cold brew', descripcion: 'Café extraído en frío por 18 horas, notas a chocolate.', precio: 13.00, categoriaId: 'cat-frias', imagen: img('1495474472287-4d71bcdd2085'), emoji: '🧋', disponible: true, destacado: false, tags: ['intenso'] },
      { id: 'p-jugo', nombre: 'Jugo de naranja', descripcion: 'Naranja del valle de Ica, exprimida al momento.', precio: 9.00, categoriaId: 'cat-frias', imagen: img('1600271886742-f049cd451bba'), emoji: '🍊', disponible: true, destacado: false, tags: ['natural'] },

      { id: 'p-sandwich', nombre: 'Sándwich de pollo', descripcion: 'Pan artesanal, pollo deshilachado, lechuga y mayonesa casera.', precio: 12.00, categoriaId: 'cat-desayunos', imagen: img('1528735602780-2552fd46c7af'), emoji: '🥪', disponible: true, destacado: false, tags: ['salado'] },
      { id: 'p-croissant', nombre: 'Croissant de mantequilla', descripcion: 'Horneado en casa, hojaldrado y con mantequilla francesa.', precio: 7.00, categoriaId: 'cat-desayunos', imagen: img('1555507036-ab1f4038808a'), emoji: '🥐', disponible: true, destacado: true, tags: ['horneado'] },
      { id: 'p-tostadas', nombre: 'Tostadas con palta', descripcion: 'Pan de masa madre, palta hass y tomate cherry.', precio: 11.00, categoriaId: 'cat-desayunos', imagen: img('1484723091739-30a097e8f929'), emoji: '🥑', disponible: true, destacado: false, tags: ['saludable'] },
      { id: 'p-bowl', nombre: 'Bowl de frutas', descripcion: 'Frutas de estación, granola artesanal y yogurt griego.', precio: 13.00, categoriaId: 'cat-desayunos', imagen: img('1490474418585-ba9bad8fd0ea'), emoji: '🥣', disponible: true, destacado: false, tags: ['saludable'] },
      { id: 'p-omelette', nombre: 'Omelette de queso', descripcion: 'Tres huevos, queso andino y cebollita china.', precio: 14.00, categoriaId: 'cat-desayunos', imagen: img('1510693206972-df098062cb71'), emoji: '🍳', disponible: false, destacado: false, tags: ['salado'] },

      { id: 'p-torta', nombre: 'Porción de torta de chocolate', descripcion: 'Bizcocho húmedo de cacao peruano con ganache.', precio: 11.00, categoriaId: 'cat-postres', imagen: img('1578985545062-69928b1d9587'), emoji: '🍰', disponible: true, destacado: true, tags: ['dulce', 'favorito'] },
      { id: 'p-cheesecake', nombre: 'Cheesecake de maracuyá', descripcion: 'Base de galleta, crema de queso y salsa de maracuyá.', precio: 12.00, categoriaId: 'cat-postres', imagen: img('1533134242443-d4fd215305ad'), emoji: '🍰', disponible: true, destacado: false, tags: ['frutal'] },
      { id: 'p-brownie', nombre: 'Brownie con helado', descripcion: 'Brownie tibio de chocolate 70% con helado de vainilla.', precio: 12.50, categoriaId: 'cat-postres', imagen: img('1606313564200-e75d5e30476c'), emoji: '🍫', disponible: true, destacado: false, tags: ['dulce'] },
      { id: 'p-alfajor', nombre: 'Alfajor artesanal', descripcion: 'Alfajor de manjar blanco con azúcar impalpable.', precio: 5.00, categoriaId: 'cat-postres', imagen: img('1551024506-0bccd828d307'), emoji: '🍪', disponible: true, destacado: false, tags: ['clásico'] },
      { id: 'p-tiramisu', nombre: 'Tiramisú', descripcion: 'Capas de café, mascarpone y cacao espolvoreado.', precio: 13.00, categoriaId: 'cat-postres', imagen: img('1571877227200-a0d98ea607e9'), emoji: '🍮', disponible: true, destacado: false, tags: ['italiano'] },

      { id: 'p-combo-cafe-postre', nombre: 'Combo Café + Postre', descripcion: 'Un capuchino clásico más una porción de torta de chocolate.', precio: 18.00, precioPromo: 12.00, categoriaId: 'cat-combos', imagen: img('1442512595331-e89e73853f31'), emoji: '🎁', disponible: true, destacado: true, tags: ['promo', 'ahorro'], promoId: 'promo-combo-cafe' },
      { id: 'p-combo-desayuno', nombre: 'Combo Desayuno Iqueño', descripcion: 'Café americano, croissant de mantequilla y jugo de naranja.', precio: 23.00, precioPromo: 16.00, categoriaId: 'cat-combos', imagen: img('1533089860892-a7c6f0a88666'), emoji: '🌅', disponible: true, destacado: true, tags: ['promo', 'desayuno'], promoId: 'promo-combo-desayuno' },
      { id: 'p-combo-estudio', nombre: 'Combo Zona Estudio', descripcion: 'Iced latte grande, brownie y 2 horas de mesa preferente.', precio: 26.00, precioPromo: 19.00, categoriaId: 'cat-combos', imagen: img('1453614512568-c4024d13c247'), emoji: '📚', disponible: true, destacado: false, tags: ['promo', 'estudio'], promoId: 'promo-combo-estudio' }
    ];
  }

  /* ---------- Promociones ---------- */
  function promocionesDemo() {
    return [
      {
        id: 'promo-combo-cafe', titulo: 'Combo Café + Postre', descripcion: 'Capuchino clásico + porción de torta de chocolate por solo S/ 12.00',
        tipo: 'combo', descuento: 33, precioCombo: 12.00, productos: ['p-capuchino', 'p-torta'],
        categoria: 'cat-combos', vigenciaDesde: fechaClave(-20), vigenciaHasta: fechaClave(80),
        horaInicio: '08:00', horaFin: '22:00', activa: true, destacada: true, imagen: img('1442512595331-e89e73853f31')
      },
      {
        id: 'promo-latte', titulo: 'Martes de latte -20%', descripcion: '20% de descuento en lattes y capuchinos todos los martes.',
        tipo: 'porcentaje', descuento: 20, precioCombo: null, productos: ['p-latte', 'p-capuchino'],
        categoria: 'cat-cafes', vigenciaDesde: fechaClave(-10), vigenciaHasta: fechaClave(60),
        horaInicio: '08:00', horaFin: '22:00', activa: true, destacada: false, imagen: img('1541167760496-1628856ab772')
      },
      {
        id: 'promo-happy', titulo: 'Happy hour frío -15%', descripcion: '15% de descuento en toda la categoría de bebidas frías de 3 a 7 p.m.',
        tipo: 'porcentaje', descuento: 15, precioCombo: null, productos: [], categoria: 'cat-frias',
        vigenciaDesde: fechaClave(-5), vigenciaHasta: fechaClave(45),
        horaInicio: '15:00', horaFin: '19:00', activa: true, destacada: true, imagen: img('1517701604599-bb29b565090c')
      }
    ];
  }

  /* ---------- Mesas ---------- */
  function mesasDemo() {
    return [
      { id: 'm-1', numero: 'M01', capacidad: 2, zona: 'Ventana', wifi: true, enchufe: true, silenciosa: false, estado: 'libre', descripcion: 'Mesa junto a la ventana principal' },
      { id: 'm-2', numero: 'M02', capacidad: 4, zona: 'Salón', wifi: true, enchufe: false, silenciosa: false, estado: 'ocupada', descripcion: 'Mesa central del salón' },
      { id: 'm-3', numero: 'M03', capacidad: 4, zona: 'Ventana', wifi: true, enchufe: true, silenciosa: false, estado: 'libre', descripcion: 'Ideal para reuniones cortas' },
      { id: 'm-4', numero: 'M04', capacidad: 2, zona: 'Zona estudio', wifi: true, enchufe: true, silenciosa: true, estado: 'reservada', descripcion: 'Mesa silenciosa con enchufe individual' },
      { id: 'm-5', numero: 'M05', capacidad: 6, zona: 'Terraza', wifi: true, enchufe: false, silenciosa: false, estado: 'libre', descripcion: 'Terraza con vista al jardín' },
      { id: 'm-6', numero: 'M06', capacidad: 8, zona: 'Salón', wifi: true, enchufe: true, silenciosa: false, estado: 'ocupada', descripcion: 'Mesa grande para grupos' },
      { id: 'm-7', numero: 'M07', capacidad: 2, zona: 'Barra', wifi: false, enchufe: true, silenciosa: false, estado: 'libre', descripcion: 'Barra de café, atención rápida' },
      { id: 'm-8', numero: 'M08', capacidad: 4, zona: 'Zona estudio', wifi: true, enchufe: true, silenciosa: true, estado: 'libre', descripcion: 'Ambiente silencioso para trabajar' },
      { id: 'm-9', numero: 'M09', capacidad: 4, zona: 'Terraza', wifi: true, enchufe: false, silenciosa: false, estado: 'reservada', descripcion: 'Terraza sombreada' },
      { id: 'm-10', numero: 'M10', capacidad: 6, zona: 'Zona estudio', wifi: true, enchufe: true, silenciosa: true, estado: 'libre', descripcion: 'Mesa compartida de estudio' },
      { id: 'm-11', numero: 'M11', capacidad: 2, zona: 'Salón', wifi: false, enchufe: false, silenciosa: false, estado: 'fuera', descripcion: 'En mantenimiento' },
      { id: 'm-12', numero: 'M12', capacidad: 4, zona: 'Terraza', wifi: true, enchufe: true, silenciosa: false, estado: 'libre', descripcion: 'Terraza con enchufe' }
    ];
  }

  /* ---------- Inventario ---------- */
  function inventarioDemo() {
    const base = [
      ['Café en grano tostado', 'kg', 18, 8],
      ['Leche entera', 'litros', 24, 12],
      ['Leche vegetal de almendra', 'litros', 6, 8],
      ['Chocolate en polvo', 'kg', 5, 3],
      ['Vasos 12 oz', 'unidades', 320, 150],
      ['Tapas para vaso', 'unidades', 180, 150],
      ['Azúcar rubia', 'kg', 12, 5],
      ['Harina sin preparar', 'kg', 20, 10],
      ['Huevos', 'unidades', 90, 60],
      ['Pan artesanal', 'unidades', 35, 25],
      ['Maracuyá', 'kg', 4, 5],
      ['Pollo deshilachado', 'kg', 7, 4]
    ];
    return base.map(function (fila, indice) {
      return {
        id: 'inv-' + (indice + 1),
        insumo: fila[0],
        unidad: fila[1],
        stock: fila[2],
        stockMinimo: fila[3],
        actualizadoEn: iso(-2, 8, 30),
        movimientos: [
          { fecha: iso(-2, 8, 15), tipo: 'entrada', cantidad: fila[2], nota: 'Compra semanal a proveedor' }
        ]
      };
    });
  }

  /* ---------- Sugerencias ---------- */
  function sugerenciasDemo() {
    return [
      { id: 'sug-1', usuarioId: 'u-cliente', cliente: 'María Fernández', correo: 'cliente@cafeya.pe', calificacion: 5, categoria: 'Atención', comentario: 'El trato del equipo fue excelente y el capuchino llegó en menos de 5 minutos.', estado: 'atendida', respuesta: '¡Gracias María! Nos alegra que hayas tenido una buena experiencia.', fecha: iso(-9, 17, 20), respondidoEn: iso(-8, 10, 0) },
      { id: 'sug-2', usuarioId: 'u-cliente2', cliente: 'Carlos Ramos', correo: 'cliente2@cafeya.pe', calificacion: 4, categoria: 'Producto', comentario: 'Me encantaría que agreguen más opciones sin azúcar en las bebidas frías.', estado: 'pendiente', respuesta: null, fecha: iso(-6, 12, 45) },
      { id: 'sug-3', usuarioId: 'u-cliente3', cliente: 'Ana Torres', correo: 'ana.torres@cafeya.pe', calificacion: 5, categoria: 'Zona de estudio', comentario: 'La zona silenciosa es perfecta para estudiar, el wifi es rápido y hay enchufes.', estado: 'atendida', respuesta: 'Gracias Ana, seguiremos ampliando la zona de estudio.', fecha: iso(-4, 19, 10), respondidoEn: iso(-3, 9, 30) },
      { id: 'sug-4', usuarioId: 'u-cliente4', cliente: 'Luis Paredes', correo: 'luis.paredes@cafeya.pe', calificacion: 3, categoria: 'Tiempo de espera', comentario: 'En hora punta el pedido tardó un poco más de lo esperado, aunque avisaron del tiempo.', estado: 'pendiente', respuesta: null, fecha: iso(-1, 13, 15) }
    ];
  }

  /* ---------- Pedidos de demostración ---------- */
  function pedidosDemo(productos, usuarios) {
    let semilla = 98765;
    function rnd() {
      semilla = (semilla * 1103515245 + 12345) % 2147483648;
      return semilla / 2147483648;
    }
    function elegir(lista) { return lista[Math.floor(rnd() * lista.length)]; }

    const clientes = usuarios.filter(function (u) { return u.rol === 'cliente'; });
    const metodos = ['yape', 'plin', 'tarjeta'];
    const pedidos = [];
    const pagos = [];
    const ventas = [560, 720, 640, 810, 690, 920, 760, 880, 950, 1020, 870, 1120];
    let numero = 1000;

    for (let dia = 11; dia >= 0; dia--) {
      const cantidad = 1 + Math.floor(rnd() * 3);
      for (let k = 0; k < cantidad; k++) {
        numero += 1;
        const cliente = dia === 0 ? elegir(clientes) : clientes[Math.floor(rnd() * clientes.length)];
        const items = [];
        const cuantos = 1 + Math.floor(rnd() * 3);
        for (let i = 0; i < cuantos; i++) {
          const producto = elegir(productos.filter(function (p) { return p.categoriaId !== 'cat-combos'; }));
          const existente = items.find(function (it) { return it.productoId === producto.id; });
          if (existente) {
            existente.cantidad += 1;
          } else {
            items.push({ productoId: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1, observacion: '' });
          }
        }
        const total = items.reduce(function (acumulado, it) { return acumulado + it.precio * it.cantidad; }, 0);
        const metodo = metodos[Math.floor(rnd() * metodos.length)];
        const hora = 9 + Math.floor(rnd() * 11);
        let estado = 'entregado';
        if (dia === 0 && k === 0) estado = 'recibido';
        if (dia === 0 && k === 1) estado = 'preparacion';
        if (dia === 1 && k === 0) estado = 'listo';
        if (dia === 3 && k === 0) estado = 'cancelado';
        const estadoPago = estado === 'cancelado' ? 'rechazado' : (rnd() > 0.12 ? 'aprobado' : 'pendiente');
        const creado = iso(-dia, hora, Math.floor(rnd() * 60));
        const recojo = iso(-dia, hora + 1, 0);
        const base = new Date(creado).getTime();
        const minutosDespues = function (n) { return new Date(base + n * 60000).toISOString(); };
        const minPreparacion = 2 + Math.floor(rnd() * 2);
        const minListo = minPreparacion + 3 + Math.floor(rnd() * 3);
        const pedido = {
          id: 'ped-' + numero,
          codigo: 'CY-' + numero,
          usuarioId: cliente.id,
          clienteNombre: cliente.nombre,
          clienteCorreo: cliente.correo,
          clienteCelular: cliente.celular,
          items: items,
          subtotal: total,
          descuento: Math.round(total * 0.05 * 100) / 100,
          total: Math.round(total * 0.95 * 100) / 100,
          metodoPago: metodo,
          estadoPago: estadoPago,
          estado: estado,
          modalidad: rnd() > 0.75 ? 'mesa' : 'recojo',
          mesaId: null,
          horaRecojo: recojo,
          observaciones: rnd() > 0.8 ? 'Sin azúcar, por favor.' : '',
          creadoEn: creado,
          origen: 'demo',
          historial: [{ estado: 'recibido', fecha: creado }]
        };
        if (estado === 'preparacion' || estado === 'listo' || estado === 'entregado') {
          pedido.historial.push({ estado: 'preparacion', fecha: minutosDespues(minPreparacion) });
        }
        if (estado === 'listo' || estado === 'entregado') {
          pedido.historial.push({ estado: 'listo', fecha: minutosDespues(minListo) });
        }
        if (estado === 'entregado') {
          pedido.historial.push({ estado: 'entregado', fecha: minutosDespues(minListo + 1) });
        }
        if (estado === 'cancelado') {
          pedido.historial.push({ estado: 'cancelado', fecha: minutosDespues(minPreparacion) });
        }
        pedidos.push(pedido);
        pagos.push({
          id: 'pago-' + numero,
          pedidoId: pedido.id,
          codigo: 'PG-' + numero,
          codigoPedido: pedido.codigo,
          cliente: cliente.nombre,
          usuarioId: cliente.id,
          metodo: metodo,
          importe: pedido.total,
          moneda: 'PEN',
          estado: estadoPago,
          fecha: creado,
          tipo: 'pedido',
          comprobante: 'DEMO-' + numero,
          nota: 'Pago demostrativo generado con datos iniciales'
        });
      }
    }
    return { pedidos: pedidos, pagos: pagos, ventas: ventas };
  }

  /* ---------- Reservas ---------- */
  function reservasDemo() {
    return [
      { id: 'res-1', usuarioId: 'u-cliente', cliente: 'María Fernández', celular: '987 654 321', mesaId: 'm-4', fecha: fechaClave(1), hora: '10:00', personas: 2, estado: 'confirmada', nota: 'Mesa silenciosa para estudiar', creadoEn: iso(-1, 18, 20) },
      { id: 'res-2', usuarioId: 'u-cliente2', cliente: 'Carlos Ramos', celular: '912 345 678', mesaId: 'm-9', fecha: fechaClave(2), hora: '18:00', personas: 4, estado: 'confirmada', nota: 'Cumpleaños, por favor ambientar', creadoEn: iso(-1, 20, 5) },
      { id: 'res-3', usuarioId: 'u-cliente3', cliente: 'Ana Torres', celular: '934 556 778', mesaId: 'm-5', fecha: fechaClave(0), hora: '16:00', personas: 5, estado: 'pendiente', nota: 'Reunión de trabajo', creadoEn: iso(0, 9, 35) }
    ];
  }

  /* ---------- Mesa compartida de demostración ---------- */
  function compartidaDemo() {
    return [
      {
        id: 'mc-1',
        codigo: 'MC-1042',
        mesaId: 'm-6',
        nombre: 'Mesa compartida M06',
        estado: 'abierta',
        creadoEn: iso(0, 12, 10),
        integrantes: [
          {
            id: 'int-1', nombre: 'Ana Torres', usuarioId: 'u-cliente3', estado: 'pagado', metodoPago: 'yape',
            items: [
              { productoId: 'p-capuchino', nombre: 'Capuchino clásico', precio: 9.50, cantidad: 1 },
              { productoId: 'p-torta', nombre: 'Porción de torta de chocolate', precio: 11.00, cantidad: 1 }
            ]
          },
          {
            id: 'int-2', nombre: 'Luis Paredes', usuarioId: 'u-cliente4', estado: 'pendiente', metodoPago: null,
            items: [
              { productoId: 'p-frappe', nombre: 'Frappé de café', precio: 14.00, cantidad: 2 }
            ]
          },
          {
            id: 'int-3', nombre: 'María Fernández', usuarioId: 'u-cliente', estado: 'pendiente', metodoPago: null,
            items: [
              { productoId: 'p-icedlatte', nombre: 'Iced latte', precio: 12.00, cantidad: 1 },
              { productoId: 'p-brownie', nombre: 'Brownie con helado', precio: 12.50, cantidad: 1 }
            ]
          }
        ]
      }
    ];
  }

  /* ---------- Configuración ---------- */
  function configDemo() {
    return {
      nombre: 'CaféYa Ica S.A.C.',
      nombreCorto: 'CaféYa',
      ruc: '20601234567',
      telefono: '(056) 234 567',
      whatsapp: '956 789 123',
      correo: 'hola@cafeya.pe',
      direccion: 'Av. Los Maestros 245, Ica',
      referencia: 'A dos cuadras de la Plaza de Armas de Ica',
      horario: { apertura: '08:00', cierre: '22:00', dias: 'Lunes a domingo' },
      metodosPago: { yape: true, plin: true, tarjeta: true, efectivo: true },
      redes: { facebook: 'https://facebook.com/cafeyaiica', instagram: 'https://instagram.com/cafeyaiica', tiktok: 'https://tiktok.com/@cafeyaiica' },
      tiempoObjetivo: 8,
      aforo: 42,
      moneda: 'S/',
      mensajeBienvenida: 'Café de especialidad, postres artesanales y una zona de estudio pensada para ti.',
      actualizadoEn: iso(-3, 10, 0)
    };
  }

  function sembrar(forzar) {
    const yaInicializado = window.Almacen.leer(C.inicializado, false);
    if (yaInicializado && !forzar) return false;

    const usuarios = usuariosDemo();
    const productos = productosDemo();
    const paquete = pedidosDemo(
      productos,
      usuarios
    );

    window.Almacen.escribir(C.usuarios, usuarios);
    window.Almacen.escribir(C.categorias, categoriasDemo());
    window.Almacen.escribir(C.productos, productos);
    window.Almacen.escribir(C.promociones, promocionesDemo());
    window.Almacen.escribir(C.mesas, mesasDemo());
    window.Almacen.escribir(C.inventario, inventarioDemo());
    window.Almacen.escribir(C.sugerencias, sugerenciasDemo());
    window.Almacen.escribir(C.pedidos, paquete.pedidos);
    window.Almacen.escribir(C.pagos, paquete.pagos);
    window.Almacen.escribir(C.reservas, reservasDemo());
    window.Almacen.escribir(C.compartidas, compartidaDemo());
    window.Almacen.escribir(C.carritos, {});
    window.Almacen.escribir(C.notificaciones, []);
    window.Almacen.escribir(C.config, configDemo());
    window.Almacen.escribir(C.sesion, null);

    /* Fidelización calculada a partir de pedidos entregados y pagados */
    const fidelizacion = usuarios.filter(function (u) { return u.rol === 'cliente'; }).map(function (u) {
      return { id: 'fid-' + u.id, usuarioId: u.id, cliente: u.nombre, compras: 0, canjes: 0, pedidos: [] };
    });
    paquete.pedidos.forEach(function (pedido) {
      if (pedido.estado === 'entregado' && pedido.estadoPago === 'aprobado') {
        const registro = fidelizacion.find(function (f) { return f.usuarioId === pedido.usuarioId; });
        if (registro) {
          registro.compras += 1;
          registro.pedidos.push(pedido.id);
        }
      }
    });
    /* Dos tarjetas completas para mostrar el beneficio en la demostración */
    const maria = fidelizacion.find(function (f) { return f.usuarioId === 'u-cliente'; });
    if (maria) { maria.compras = 7; maria.pedidos = paquete.pedidos.slice(0, 7).map(function (p) { return p.id; }); }
    const carlos = fidelizacion.find(function (f) { return f.usuarioId === 'u-cliente2'; });
    if (carlos) { carlos.compras = 4; carlos.pedidos = paquete.pedidos.slice(0, 4).map(function (p) { return p.id; }); }
    window.Almacen.escribir(C.fidelizacion, fidelizacion);

    window.Almacen.escribir(C.inicializado, true);
    return true;
  }

  window.DatosIniciales = {
    sembrar: sembrar,
    ventasReferencia: [560, 720, 640, 810, 690, 920, 760, 880, 950, 1020, 870, 1120]
  };

  /* Ejecución automática al cargar el script */
  sembrar(false);
})();
