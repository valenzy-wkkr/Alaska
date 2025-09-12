/**
 * Clase para validar datos en la aplicación
 * Proporciona métodos para validar diferentes tipos de datos y formatos
 */
class Validator {
  /**
   * Constructor de la clase Validator
   */
  constructor() {
    this.errors = {};
  }

  /**
   * Valida datos según reglas especificadas
   * @param {object} data - Los datos a validar
   * @param {object} rules - Las reglas de validación
   * @returns {boolean} - true si los datos son válidos, false en caso contrario
   */
  validate(data, rules) {
    this.errors = {};
    
    for (const field in rules) {
      const fieldRules = rules[field];
      const fieldValue = data[field];
      
      for (const rule of fieldRules) {
        if (!this.applyRule(field, fieldValue, rule)) {
          // Si una regla falla, no es necesario verificar las demás para este campo
          break;
        }
      }
    }
    
    return Object.keys(this.errors).length === 0;
  }

  /**
   * Aplica una regla de validación específica a un campo
   * @param {string} field - El nombre del campo
   * @param {any} value - El valor del campo
   * @param {string} rule - La regla de validación a aplicar
   * @returns {boolean} - true si la regla pasa, false en caso contrario
   */
  applyRule(field, value, rule) {
    switch (rule) {
      case 'required':
        return this.isRequired(value, field);
      case 'email':
        return this.validateEmail(value, field);
      case 'password':
        return this.validatePassword(value, field);
      case 'name':
        return this.validateName(value, field);
      case 'username':
        return this.validateUsername(value, field);
      case 'address':
        return this.validateAddress(value, field);
      case 'age':
        return this.validateAge(value, field);
      case 'weight':
        return this.validateWeight(value, field);
      default:
        // Regla personalizada o no reconocida, asumimos que pasa
        return true;
    }
  }

  /**
   * Valida formato de correo electrónico
   * @param {string} email - El email a validar
   * @param {string} field - El nombre del campo (para mensajes de error)
   * @returns {boolean} - true si el email es válido, false en caso contrario
   */
  validateEmail(email, field = 'email') {
    if (email === undefined || email === null) {
      return true; // Si no es requerido y no está presente, pasa la validación
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    if (!isValid) {
      this.addError(field, 'El formato del correo electrónico no es válido');
    }
    
    return isValid;
  }

  /**
   * Valida fortaleza de contraseña
   * @param {string} password - La contraseña a validar
   * @param {string} field - El nombre del campo (para mensajes de error)
   * @returns {boolean} - true si la contraseña es válida, false en caso contrario
   */
  validatePassword(password, field = 'password') {
    if (password === undefined || password === null) {
      return true; // Si no es requerido y no está presente, pasa la validación
    }
    
    // La contraseña debe tener al menos 8 caracteres
    if (password.length < 8) {
      this.addError(field, 'La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    
    // La contraseña debe contener al menos una letra y un número
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    const isValid = passwordRegex.test(password);
    
    if (!isValid) {
      this.addError(field, 'La contraseña debe contener al menos una letra y un número');
    }
    
    return isValid;
  }

  /**
   * Valida formato de nombre
   * @param {string} name - El nombre a validar
   * @param {string} field - El nombre del campo (para mensajes de error)
   * @returns {boolean} - true si el nombre es válido, false en caso contrario
   */
  validateName(name, field = 'name') {
    if (name === undefined || name === null) {
      return true; // Si no es requerido y no está presente, pasa la validación
    }
    
    // El nombre no debe estar vacío y debe tener al menos 2 caracteres
    if (name.trim().length < 2) {
      this.addError(field, 'El nombre debe tener al menos 2 caracteres');
      return false;
    }
    
    // El nombre solo debe contener letras, espacios, guiones y apóstrofes
    const nameRegex = /^[A-Za-zÀ-ÿ\s\-']+$/;
    const isValid = nameRegex.test(name);
    
    if (!isValid) {
      this.addError(field, 'El nombre solo puede contener letras, espacios, guiones y apóstrofes');
    }
    
    return isValid;
  }

  /**
   * Valida formato de nombre de usuario
   * @param {string} username - El nombre de usuario a validar
   * @param {string} field - El nombre del campo (para mensajes de error)
   * @returns {boolean} - true si el nombre de usuario es válido, false en caso contrario
   */
  validateUsername(username, field = 'username') {
    if (username === undefined || username === null) {
      return true; // Si no es requerido y no está presente, pasa la validación
    }
    
    // El nombre de usuario debe tener entre 3 y 20 caracteres
    if (username.length < 3 || username.length > 20) {
      this.addError(field, 'El nombre de usuario debe tener entre 3 y 20 caracteres');
      return false;
    }
    
    // El nombre de usuario solo debe contener letras, números, guiones bajos y puntos
    const usernameRegex = /^[a-zA-Z0-9_.]+$/;
    const isValid = usernameRegex.test(username);
    
    if (!isValid) {
      this.addError(field, 'El nombre de usuario solo puede contener letras, números, guiones bajos y puntos');
    }
    
    return isValid;
  }

  /**
   * Valida formato de dirección
   * @param {string} address - La dirección a validar
   * @param {string} field - El nombre del campo (para mensajes de error)
   * @returns {boolean} - true si la dirección es válida, false en caso contrario
   */
  validateAddress(address, field = 'address') {
    if (address === undefined || address === null) {
      return true; // Si no es requerido y no está presente, pasa la validación
    }
    
    // La dirección no debe estar vacía y debe tener al menos 5 caracteres
    if (address.trim().length < 5) {
      this.addError(field, 'La dirección debe tener al menos 5 caracteres');
      return false;
    }
    
    return true;
  }

  /**
   * Valida rango de edad
   * @param {number} age - La edad a validar
   * @param {string} field - El nombre del campo (para mensajes de error)
   * @returns {boolean} - true si la edad es válida, false en caso contrario
   */
  validateAge(age, field = 'age') {
    if (age === undefined || age === null) {
      return true; // Si no es requerido y no está presente, pasa la validación
    }
    
    // La edad debe ser un número entre 0 y 150
    if (typeof age !== 'number' || age < 0 || age > 150) {
      this.addError(field, 'La edad debe ser un número entre 0 y 150');
      return false;
    }
    
    return true;
  }

  /**
   * Valida rango de peso
   * @param {number} weight - El peso a validar
   * @param {string} field - El nombre del campo (para mensajes de error)
   * @returns {boolean} - true si el peso es válido, false en caso contrario
   */
  validateWeight(weight, field = 'weight') {
    if (weight === undefined || weight === null) {
      return true; // Si no es requerido y no está presente, pasa la validación
    }
    
    // El peso debe ser un número positivo
    if (typeof weight !== 'number' || weight <= 0) {
      this.addError(field, 'El peso debe ser un número positivo');
      return false;
    }
    
    return true;
  }

  /**
   * Verifica si un valor es requerido
   * @param {any} value - El valor a verificar
   * @param {string} field - El nombre del campo (para mensajes de error)
   * @returns {boolean} - true si el valor está presente, false en caso contrario
   */
  isRequired(value, field) {
    if (value === undefined || value === null || value === '') {
      this.addError(field, 'Este campo es requerido');
      return false;
    }
    
    // Para arrays, verificar que no estén vacíos
    if (Array.isArray(value) && value.length === 0) {
      this.addError(field, 'Este campo es requerido');
      return false;
    }
    
    return true;
  }

  /**
   * Agrega un error de validación
   * @param {string} field - El campo donde ocurrió el error
   * @param {string} message - El mensaje de error
   */
  addError(field, message) {
    if (!this.errors[field]) {
      this.errors[field] = [];
    }
    this.errors[field].push(message);
  }

  /**
   * Obtiene todos los errores de validación
   * @returns {object} - Los errores de validación
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Limpia los errores de validación
   */
  clearErrors() {
    this.errors = {};
  }

  /**
   * Verifica si la validación fue exitosa
   * @returns {boolean} - true si no hay errores, false en caso contrario
   */
  isValid() {
    return Object.keys(this.errors).length === 0;
  }

  /**
   * Valida un campo específico
   * @param {string} field - El nombre del campo
   * @param {any} value - El valor del campo
   * @param {Array<string>} rules - Las reglas de validación para el campo
   * @returns {boolean} - true si el campo es válido, false en caso contrario
   */
  validateField(field, value, rules) {
    this.errors[field] = [];
    
    for (const rule of rules) {
      if (!this.applyRule(field, value, rule)) {
        // Si una regla falla, no es necesario verificar las demás
        break;
      }
    }
    
    return this.errors[field] && this.errors[field].length === 0;
  }
}

// Exportar la clase para poder usarla en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Validator;
}

// Exponer en entorno navegador
if (typeof window !== 'undefined') {
  window.Validator = Validator;
}