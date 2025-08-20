/**
 * Clase para manejar la funcionalidad de los botones en la aplicación
 * Incluye eventos de clic, validaciones y efectos visuales
 */
class ButtonView {
  /**
   * Constructor de la clase ButtonView
   * @param {HTMLElement} buttonElement - El elemento del botón
   * @param {string} type - El tipo de botón (primario, secundario, etc.)
   * @param {string} action - La acción que ejecuta el botón
   */
  constructor(buttonElement, type = 'default', action = null) {
    this.button = buttonElement;
    this.type = type;
    this.action = action;
    
    // Estados del botón
    this.isLoading = false;
    this.isDisabled = false;
    
    // Referencias a elementos relacionados (formularios, etc.)
    this.form = null;
    
    // Inicializar el botón
    this.init();
  }

  /**
   * Inicializa la funcionalidad del botón
   */
  init() {
    if (!this.button) {
      console.warn('No se proporcionó un elemento de botón válido');
      return;
    }
    
    // Encontrar formulario relacionado si existe
    this.form = this.button.closest('form');
    
    // Inicializar event listeners
    this.initEventListeners();
    
    // Agregar clases CSS según el tipo de botón
    this.setButtonType();
  }

  /**
   * Inicializa los event listeners para el botón
   */
  initEventListeners() {
    // Evento para el clic del botón
    this.button.addEventListener('click', (event) => {
      event.preventDefault();
      this.handleClick(event);
    });
    
    // Evento para el foco del botón
    this.button.addEventListener('focus', () => {
      this.handleFocus();
    });
    
    // Evento para la pérdida de foco del botón
    this.button.addEventListener('blur', () => {
      this.handleBlur();
    });
    
    // Evento para el mouse sobre el botón
    this.button.addEventListener('mouseenter', () => {
      this.handleMouseEnter();
    });
    
    // Evento para el mouse saliendo del botón
    this.button.addEventListener('mouseleave', () => {
      this.handleMouseLeave();
    });
  }

  /**
   * Maneja el evento de clic en el botón
   * @param {Event} event - El evento de clic
   */
  handleClick(event) {
    // Si el botón está desactivado o cargando, no hacer nada
    if (this.isDisabled || this.isLoading) {
      return;
    }
    
    // Validar formulario si existe
    if (this.form && !this.validateForm()) {
      return;
    }
    
    // Ejecutar acción específica si está definida
    if (this.action) {
      switch (this.action) {
        case 'submit':
          this.handleSubmit(event);
          break;
        case 'reset':
          this.handleReset(event);
          break;
        case 'register':
          this.handleRegister(event);
          break;
        default:
          console.warn(`Acción desconocida: ${this.action}`);
      }
    }
    
    // Disparar evento personalizado
    this.button.dispatchEvent(new CustomEvent('buttonClick', {
      detail: { button: this, event: event }
    }));
  }

  /**
   * Valida el formulario asociado al botón (si aplica)
   * @returns {boolean} - true si el formulario es válido, false en caso contrario
   */
  validateForm() {
    if (!this.form) {
      return true; // No hay formulario que validar
    }
    
    // Verificar que todos los campos requeridos estén llenos
    const requiredFields = this.form.querySelectorAll('[required]');
    for (let field of requiredFields) {
      if (!field.value.trim()) {
        this.showError('Por favor, completa todos los campos requeridos');
        field.focus();
        return false;
      }
    }
    
    // Validar formato de email si existe
    const emailField = this.form.querySelector('input[type="email"]');
    if (emailField && emailField.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailField.value)) {
        this.showError('Por favor, ingresa un correo electrónico válido');
        emailField.focus();
        return false;
      }
    }
    
    return true;
  }

  /**
   * Maneja el envío del formulario
   * @param {Event} event - El evento de clic
   */
  handleSubmit(event) {
    // Mostrar estado de carga
    this.showLoadingState();
    
    // En una implementación real, aquí se enviaría el formulario
    console.log('Enviando formulario...');
    
    // Simular envío asíncrono
    setTimeout(() => {
      this.hideLoadingState();
      this.showSuccess('Formulario enviado exitosamente');
      
      // Resetear formulario si es necesario
      if (this.form) {
        this.form.reset();
      }
    }, 2000);
  }

  /**
   * Maneja el reset del formulario
   * @param {Event} event - El evento de clic
   */
  handleReset(event) {
    if (this.form) {
      this.form.reset();
      this.showSuccess('Formulario reiniciado');
    }
  }

  /**
   * Maneja el registro de usuario
   * @param {Event} event - El evento de clic
   */
  handleRegister(event) {
    // Mostrar estado de carga
    this.showLoadingState();
    
    // En una implementación real, aquí se procesaría el registro
    console.log('Procesando registro...');
    
    // Simular proceso de registro
    setTimeout(() => {
      this.hideLoadingState();
      this.showSuccess('Registro completado exitosamente');
    }, 2000);
  }

  /**
   * Muestra estado de carga en el botón
   */
  showLoadingState() {
    this.isLoading = true;
    this.disable();
    
    // Guardar texto original
    this.originalText = this.button.textContent;
    
    // Mostrar indicador de carga
    this.button.innerHTML = `
      <span class="spinner" style="display: inline-block; width: 16px; height: 16px; border: 2px solid #fff; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></span>
      ${this.originalText}
    `;
    
    // Agregar animación de giro
    if (!document.querySelector('#spinner-style')) {
      const style = document.createElement('style');
      style.id = 'spinner-style';
      style.textContent = `
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Oculta estado de carga en el botón
   */
  hideLoadingState() {
    this.isLoading = false;
    this.enable();
    
    // Restaurar texto original
    if (this.originalText) {
      this.button.textContent = this.originalText;
    }
  }

  /**
   * Desactiva el botón
   */
  disable() {
    this.isDisabled = true;
    this.button.setAttribute('disabled', 'disabled');
    this.button.classList.add('disabled');
  }

  /**
   * Activa el botón
   */
  enable() {
    this.isDisabled = false;
    this.button.removeAttribute('disabled');
    this.button.classList.remove('disabled');
  }

  /**
   * Muestra mensaje de éxito
   * @param {string} message - El mensaje de éxito
   */
  showSuccess(message) {
    // Crear elemento de mensaje si no existe
    let messageElement = this.button.parentNode.querySelector('.button-message.success');
    if (!messageElement) {
      messageElement = document.createElement('div');
      messageElement.className = 'button-message success';
      messageElement.style.cssText = `
        color: #4CAF50;
        font-size: 14px;
        margin-top: 10px;
        padding: 10px;
        background-color: #E8F5E9;
        border-radius: 4px;
        display: none;
      `;
      this.button.parentNode.insertBefore(messageElement, this.button.nextSibling);
    }
    
    // Mostrar mensaje
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    
    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
      messageElement.style.display = 'none';
    }, 3000);
  }

  /**
   * Muestra mensaje de error
   * @param {string} message - El mensaje de error
   */
  showError(message) {
    // Crear elemento de mensaje si no existe
    let messageElement = this.button.parentNode.querySelector('.button-message.error');
    if (!messageElement) {
      messageElement = document.createElement('div');
      messageElement.className = 'button-message error';
      messageElement.style.cssText = `
        color: #f44336;
        font-size: 14px;
        margin-top: 10px;
        padding: 10px;
        background-color: #FFEBEE;
        border-radius: 4px;
        display: none;
      `;
      this.button.parentNode.insertBefore(messageElement, this.button.nextSibling);
    }
    
    // Mostrar mensaje
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    
    // Ocultar mensaje después de 5 segundos
    setTimeout(() => {
      messageElement.style.display = 'none';
    }, 5000);
  }

  /**
   * Establece el tipo de botón (agrega clases CSS)
   */
  setButtonType() {
    this.button.classList.add(`boton-${this.type}`);
  }

  /**
   * Maneja el foco del botón
   */
  handleFocus() {
    this.button.classList.add('focused');
  }

  /**
   * Maneja la pérdida de foco del botón
   */
  handleBlur() {
    this.button.classList.remove('focused');
  }

  /**
   * Maneja el mouse sobre el botón
   */
  handleMouseEnter() {
    this.button.classList.add('hovered');
  }

  /**
   * Maneja el mouse saliendo del botón
   */
  handleMouseLeave() {
    this.button.classList.remove('hovered');
  }

  /**
   * Destruye la instancia del botón (limpia event listeners)
   */
  destroy() {
    // Remover event listeners
    this.button.removeEventListener('click', this.handleClick);
    this.button.removeEventListener('focus', this.handleFocus);
    this.button.removeEventListener('blur', this.handleBlur);
    this.button.removeEventListener('mouseenter', this.handleMouseEnter);
    this.button.removeEventListener('mouseleave', this.handleMouseLeave);
    
    // Remover clases añadidas
    this.button.classList.remove(`boton-${this.type}`, 'focused', 'hovered', 'disabled');
  }
}

// Exportar la clase para poder usarla en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ButtonView;
}