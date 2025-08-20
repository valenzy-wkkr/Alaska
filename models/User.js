/**
 * Clase que representa un usuario en el sistema
 * Contiene la información básica de un usuario y métodos para manipularla
 */
class User {
  /**
   * Constructor de la clase User
   * @param {number} id - Identificador único del usuario
   * @param {string} name - Nombre completo del usuario
   * @param {string} email - Correo electrónico del usuario
   * @param {string} username - Nombre de usuario
   * @param {string} address - Dirección del usuario
   * @param {string} password - Contraseña del usuario
   */
  constructor(id, name, email, username, address, password) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.username = username;
    this.address = address;
    this.password = password;
  }

  /**
   * Valida los datos del usuario
   * @returns {boolean} - true si los datos son válidos, false en caso contrario
   */
  validate() {
    // Verificar que todos los campos requeridos estén presentes
    if (!this.name || !this.email || !this.username || !this.address || !this.password) {
      return false;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      return false;
    }

    // Validar longitud mínima de contraseña
    if (this.password.length < 8) {
      return false;
    }

    return true;
  }

  /**
   * Hashea la contraseña del usuario
   * En una implementación real, se usaría una biblioteca de hashing como bcrypt
   */
  hashPassword() {
    // En una implementación real, esto sería:
    // this.password = bcrypt.hashSync(this.password, 10);
    
    // Para este ejemplo, simplemente agregaremos un prefijo para indicar que está "hasheada"
    this.password = `hashed_${this.password}`;
  }

  /**
   * Convierte el objeto a formato JSON para su serialización
   * @returns {object} - Representación JSON del usuario
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      username: this.username,
      address: this.address
      // No incluimos la contraseña en el JSON por seguridad
    };
  }
}

// Exportar la clase para poder usarla en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = User;
}