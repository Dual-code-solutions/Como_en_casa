import Swal from 'sweetalert2';

const baseSwal = Swal.mixin({
  customClass: {
    confirmButton: 'btn-primary',
    cancelButton: 'btn-secondary',
    popup: 'swal-custom-popup'
  },
  buttonsStyling: false
});

/**
 * Muestra una alerta simple
 * @param {string} title Título o mensaje principal
 * @param {string} text Texto secundario (opcional)
 * @param {string} icon 'success', 'error', 'warning', 'info'
 */
export const showAlert = (title, text = '', icon = 'info') => {
  return baseSwal.fire({
    title,
    text,
    icon,
    confirmButtonText: 'Entendido'
  });
};

/**
 * Muestra un diálogo de confirmación
 * @param {string} title Título o pregunta principal
 * @param {string} text Texto secundario explicativo
 * @param {string} confirmText Texto del botón afirmativo
 * @param {string} icon Ícono visual ('warning', 'question', etc)
 * @returns {Promise<boolean>} Promesa que resuelve a true si el usuario confirmó
 */
export const showConfirm = async (title, text = '', confirmText = 'Sí, continuar', icon = 'warning') => {
  const result = await baseSwal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar'
  });
  return result.isConfirmed;
};
