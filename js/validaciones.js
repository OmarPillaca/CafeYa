/* ============================================================
   CafeYa Ica - Validaciones de formularios
   ============================================================ */
(function () {
  'use strict';

  function limpiarFormulario(form) {
    if (!form) return;
    Array.prototype.forEach.call(form.querySelectorAll('.campo'), function (caja) {
      caja.classList.remove('invalido');
    });
  }

  function marcarError(input, mensaje) {
    const caja = input.closest('.campo');
    if (!caja) return;
    caja.classList.add('invalido');
    const cajaError = caja.querySelector('.error');
    if (cajaError && mensaje) cajaError.textContent = mensaje;
    input.addEventListener('input', function quitar() {
      caja.classList.remove('invalido');
      input.removeEventListener('input', quitar);
    });
  }

  function validarRegla(valor, regla) {
    const nombre = regla.etiqueta || 'El campo';
    if (regla.requerido && (valor === '' || valor === false)) {
      return nombre + ' es obligatorio.';
    }
    if (valor === '' || valor === null || valor === undefined) return null;
    if (regla.tipo === 'correo' && !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(valor)) {
      return 'Ingresa un correo electrónico válido.';
    }
    if (regla.tipo === 'celular' && !/^[0-9+\s()-]{7,15}$/.test(valor)) {
      return 'Ingresa un celular válido (mínimo 7 dígitos).';
    }
    if (regla.tipo === 'password' && String(valor).length < (regla.minLength || 6)) {
      return 'La contraseña debe tener al menos ' + (regla.minLength || 6) + ' caracteres.';
    }
    if (regla.tipo === 'numero' && isNaN(Number(valor))) {
      return 'Ingresa un número válido.';
    }
    if (regla.minLength && String(valor).trim().length < regla.minLength) {
      return nombre + ' debe tener al menos ' + regla.minLength + ' caracteres.';
    }
    if (regla.maxLength && String(valor).trim().length > regla.maxLength) {
      return nombre + ' no debe exceder ' + regla.maxLength + ' caracteres.';
    }
    if (regla.tipo === 'positivo' && Number(valor) <= 0) {
      return 'Ingresa un valor mayor a cero.';
    }
    if (regla.tipo === 'fecha' && !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
      return 'Selecciona una fecha válida.';
    }
    if (regla.tipo === 'fechaFutura') {
      const hoy = new Date().toISOString().slice(0, 10);
      if (valor < hoy) return 'La fecha no puede ser anterior a hoy.';
    }
    return null;
  }

  function formulario(form, esquema) {
    if (!form) return { valido: false, datos: {}, errores: ['Formulario no encontrado'] };
    limpiarFormulario(form);
    const datos = {};
    const errores = [];
    let valido = true;

    Object.keys(esquema || {}).forEach(function (nombre) {
      const regla = esquema[nombre];
      const input = form.elements[nombre] || form.querySelector('[name="' + nombre + '"]');
      if (!input) return;
      let valor;
      if (input.type === 'checkbox') valor = input.checked;
      else if (input.type === 'number') valor = input.value === '' ? '' : Number(input.value);
      else valor = String(input.value || '').trim();
      datos[nombre] = valor;

      const mensaje = validarRegla(valor, regla);
      if (mensaje) {
        valido = false;
        errores.push(mensaje);
        marcarError(input, mensaje);
      }
    });

    return { valido: valido, datos: datos, errores: errores };
  }

  function unicoCorreo(correo, exceptoId) {
    const usuarios = window.Almacen.listar('usuarios');
    return !usuarios.some(function (u) {
      return u.correo.toLowerCase() === String(correo).toLowerCase() && u.id !== exceptoId;
    });
  }

  window.Validaciones = {
    formulario: formulario,
    limpiar: limpiarFormulario,
    marcarError: marcarError,
    correo: function (v) { return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v); },
    celular: function (v) { return /^[0-9+\s()-]{7,15}$/.test(v); },
    unicoCorreo: unicoCorreo
  };
})();
