/**
 * Clase para manejar la funcionalidad de los formularios en la aplicación
 * Incluye validaciones, manejo de eventos y comunicación con el controlador
 */
class FormView {
  /**
   * Constructor de la clase FormView
   * @param {HTMLFormElement} formElement - El elemento del formulario
   */
  constructor(formElement) {
    this.form = formElement;
    
    // Elementos del formulario
    this.fields = {};
    this.submitButton = null;
    
    // Validador y manejador de errores
    this.validator = new Validator();
    this.errorHandler = new ErrorHandler();
    
    // Estado del formulario
    this.isSubmitting = false;
    
    // Inicializar el formulario
    this.init();
  }

  /**
   * Inicializa la funcionalidad del formulario
   */
  init() {
    if (!this.form) {
      console.warn('No se proporcionó un elemento de formulario válido');
      return;
    }
    
    // Obtener campos del formulario
    this.initFields();
    
    // Obtener botón de envío
    this.submitButton = this.form.querySelector('button[type="submit"]');
    
    // Inicializar event listeners
    this.initEventListeners();
  }

  /**
   * Inicializa los campos del formulario
   */
  initFields() {
    const inputs = this.form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      const name = input.name;
      if (name) {
        this.fields[name] = input;
      }
    });
  }

  /**
   * Inicializa los event listeners para el formulario
   */
  initEventListeners() {
    // Evento para el envío del formulario
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.handleSubmission(event);
    });
    
    // Evento para la validación en tiempo real
    Object.values(this.fields).forEach(field => {
      field.addEventListener('input', () => {
        this.validateField(field);
      });
      
      field.addEventListener('blur', () => {
        this.validateField(field);
      });
    });
  }

  /**
   * Maneja el evento de envío del formulario
   * @param {Event} event - El evento de envío
   */
  async handleSubmission(event) {
    // Si ya se está enviando, no hacer nada
    if (this.isSubmitting) {
      return;
    }
    
    // Validar todo el formulario
    const isValid = this.validateForm();
    
    if (!isValid) {
      // Mostrar errores de validación
      this.showFormErrors(this.validator.getErrors());
      return;
    }
    
    // Recoger datos del formulario
    const formData = this.collectFormData();
    
    // Enviar formulario
    await this.submitForm(formData);
  }

  /**
   * Valida todos los campos del formulario
   * @returns {boolean} - true si el formulario es válido, false en caso contrario
   */
  validateForm() {
    // Limpiar errores anteriores
    this.clearFormErrors();
    
    // Obtener reglas de validación según el tipo de formulario
    const validationRules = this.getValidationRules();
    
    // Recoger datos del formulario
    const formData = this.collectFormData();
    
    // Validar datos
    const isValid = this.validator.validate(formData, validationRules);
    
    return isValid;
  }

  /**
   * Valida un campo específico del formulario
   * @param {HTMLInputElement} field - El campo a validar
   * @returns {boolean} - true si el campo es válido, false en caso contrario
   */
  validateField(field) {
    const fieldName = field.name;
    const fieldValue = field.value;
    
    if (!fieldName) {
      return true; // Campo sin nombre, no se valida
    }
    
    // Obtener reglas de validación para este campo
    const fieldRules = this.getFieldValidationRules(fieldName);
    
    if (fieldRules.length === 0) {
      return true; // No hay reglas de validación para este campo
    }
    
    // Validar campo
    const isValid = this.validator.validateField(fieldName, fieldValue, fieldRules);
    
    if (!isValid) {
      // Mostrar error específico del campo
      const errors = this.validator.getErrors();
      this.showFieldError(field, errors[fieldName]);
    } else {
      // Limpiar error del campo
      this.clearFieldError(field);
    }
    
    return isValid;
  }

  /**
   * Muestra un error en un campo específico
   * @param {HTMLInputElement} field - El campo donde mostrar el error
   * @param {Array<string>} messages - Los mensajes de error
   */
  showFieldError(field, messages) {
    // Limpiar error anterior
    this.clearFieldError(field);
    
    // Crear elemento de error si no existe
    let errorElement = field.parentNode.querySelector('.field-error');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'field-error';
      errorElement.style.cssText = `
        color: #f44336;
        font-size: 12px;
        margin-top: 5px;
      `;
      field.parentNode.appendChild(errorElement);
    }
    
    // Mostrar mensaje de error
    errorElement.textContent = messages.join(', ');
    
    // Agregar clase de error al campo
    field.classList.add('error');
  }

  /**
   * Limpia el error de un campo específico
   * @param {HTMLInputElement} field - El campo donde limpiar el error
   */
  clearFieldError(field) {
    // Remover clase de error del campo
    field.classList.remove('error');
    
    // Remover elemento de error si existe
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  /**
   * Recoge los datos del formulario
   * @returns {object} - Los datos del formulario
   */
  collectFormData() {
    const data = {};
    
    Object.entries(this.fields).forEach(([name, field]) => {
      // Para checkboxes, usar checked en lugar de value
      if (field.type === 'checkbox') {
        data[name] = field.checked;
      } else {
        data[name] = field.value;
      }
    });
    
    return data;
  }

  /**
   * Envía los datos del formulario al servidor
   * @param {object} data - Los datos del formulario
   */
  async submitForm(data) {
    try {
      // Mostrar estado de carga
      this.showLoadingState();
      
      // En una implementación real, aquí se enviarían los datos al servidor
      console.log('Enviando datos del formulario:', data);
      
      // Simular envío asíncrono
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Manejar respuesta exitosa
      this.handleSuccess(data);
    } catch (error) {
      // Manejar errores
      this.handleError(error);
    } finally {
      // Ocultar estado de carga
      this.hideLoadingState();
    }
  }

  /**
   * Maneja la respuesta exitosa del servidor
   * @param {object} data - Los datos enviados
   */
  handleSuccess(data) {
    // Mostrar mensaje de éxito
    this.showSuccess('Formulario enviado exitosamente');
    
    // Resetear formulario
    this.resetForm();
  }

  /**
   * Maneja los errores del servidor
   * @param {Error} error - El error ocurrido
   */
  handleError(error) {
    // Mostrar mensaje de error
    this.showError('Ocurrió un error al enviar el formulario. Por favor, inténtalo de nuevo.');
    
    // Registrar error
    this.errorHandler.handleError(error, 'FormView.submitForm');
  }

  /**
   * Reinicia el formulario a su estado inicial
   */
  resetForm() {
    this.form.reset();
    
    // Limpiar errores
    this.clearFormErrors();
  }

  /**
   * Obtiene las reglas de validación para el formulario
   * @returns {object} - Las reglas de validación
   */
  getValidationRules() {
    // Determinar el tipo de formulario según su ID o clase
    if (this.form.id === 'formulario-registro' || this.form.classList.contains('formulario-registro')) {
      return {
        nombre: ['required', 'name'],
        contacto: ['required', 'email'],
        password: ['required', 'password'],
        username: ['required', 'username'],
        direccion: ['required', 'address'],
        terminos: ['required']
      };
    } else if (this.form.id === 'formulario-contacto' || this.form.classList.contains('formulario-contacto')) {
      return {
        'nombre-contacto': ['required', 'name'],
        'email-contacto': ['required', 'email'],
        'asunto-contacto': ['required'],
        'mensaje-contacto': ['required']
      };
    } else {
      // Reglas genéricas
      const rules = {};
      Object.keys(this.fields).forEach(fieldName => {
        rules[fieldName] = ['required'];
      });
      return rules;
    }
  }

  /**
   * Obtiene las reglas de validación para un campo específico
   * @param {string} fieldName - El nombre del campo
   * @returns {Array<string>} - Las reglas de validación para el campo
   */
  getFieldValidationRules(fieldName) {
    const rules = this.getValidationRules();
    return rules[fieldName] || [];
  }

  /**
   * Muestra errores de validación en el formulario
   * @param {object} errors - Los errores de validación
   */
  showFormErrors(errors) {
    // Limpiar errores anteriores
    this.clearFormErrors();
    
    // Mostrar cada error
    Object.entries(errors).forEach(([fieldName, messages]) => {
      const field = this.fields[fieldName];
      if (field) {
        this.showFieldError(field, messages);
      }
    });
    
    // Enfocar el primer campo con error
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField && this.fields[firstErrorField]) {
      this.fields[firstErrorField].focus();
    }
  }

  /**
   * Limpia todos los errores del formulario
   */
  clearFormErrors() {
    Object.values(this.fields).forEach(field => {
      this.clearFieldError(field);
    });
    
    this.validator.clearErrors();
  }

  /**
   * Muestra estado de carga
   */
  showLoadingState() {
    this.isSubmitting = true;
    
    if (this.submitButton) {
      // Guardar texto original
      this.originalButtonText = this.submitButton.textContent;
      
      // Mostrar indicador de carga
      this.submitButton.innerHTML = `
        <span class="spinner" style="display: inline-block; width: 16px; height: 16px; border: 2px solid #fff; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite; margin-right: 8px;"></span>
        Enviando...
      `;
      
      // Desactivar botón
      this.submitButton.setAttribute('disabled', 'disabled');
    }
  }

  /**
   * Oculta estado de carga
   */
  hideLoadingState() {
    this.isSubmitting = false;
    
    if (this.submitButton) {
      // Restaurar texto original
      if (this.originalButtonText) {
        this.submitButton.textContent = this.originalButtonText;
      }
      
      // Activar botón
      this.submitButton.removeAttribute('disabled');
    }
  }

  /**
   * Muestra mensaje de éxito
   * @param {string} message - El mensaje de éxito
   */
  showSuccess(message) {
    // Crear elemento de mensaje si no existe
    let messageElement = this.form.querySelector('.form-message.success');
    if (!messageElement) {
      messageElement = document.createElement('div');
      messageElement.className = 'form-message success';
      messageElement.style.cssText = `
        color: #4CAF50;
        font-size: 14px;
        margin: 15px 0;
        padding: 15px;
        background-color: #E8F5E9;
        border-radius: 4px;
        display: none;
      `;
      this.form.insertBefore(messageElement, this.form.firstChild);
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
   * Muestra mensaje de error
   * @param {string} message - El mensaje de error
   */
  showError(message) {
    // Crear elemento de mensaje si no existe
    let messageElement = this.form.querySelector('.form-message.error');
    if (!messageElement) {
      messageElement = document.createElement('div');
      messageElement.className = 'form-message error';
      messageElement.style.cssText = `
        color: #f44336;
        font-size: 14px;
        margin: 15px 0;
        padding: 15px;
        background-color: #FFEBEE;
        border-radius: 4px;
        display: none;
      `;
      this.form.insertBefore(messageElement, this.form.firstChild);
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
   * Destruye la instancia del formulario (limpia event listeners)
   */
  destroy() {
    // Remover event listeners
    this.form.removeEventListener('submit', this.handleSubmission);
    
    Object.values(this.fields).forEach(field => {
      field.removeEventListener('input', this.validateField);
      field.removeEventListener('blur', this.validateField);
    });
  }
}

// Importar dependencias necesarias
if (typeof require !== 'undefined') {
  var Validator = require('../utils/Validator');
  var ErrorHandler = require('../utils/ErrorHandler').ErrorHandler;
}

// Exportar la clase para poder usarla en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormView;
}