/**
 * Clase que representa una mascota en el sistema
 * Contiene la información básica de una mascota y métodos para manipularla
 */
class Pet {
  /**
   * Constructor de la clase Pet
   * @param {number} id - Identificador único de la mascota
   * @param {string} name - Nombre de la mascota
   * @param {string} species - Especie de la mascota (perro, gato, etc.)
   * @param {string} breed - Raza de la mascota
   * @param {number} age - Edad de la mascota
   * @param {number} weight - Peso de la mascota
   * @param {number} userId - Identificador del usuario dueño de la mascota
   */
  constructor(id, name, species, breed, age, weight, userId) {
    this.id = id;
    this.name = name;
    this.species = species;
    this.breed = breed;
    this.age = age;
    this.weight = weight;
    this.userId = userId;
  }

  /**
   * Valida los datos de la mascota
   * @returns {boolean} - true si los datos son válidos, false en caso contrario
   */
  validate() {
    // Verificar que todos los campos requeridos estén presentes
    if (!this.name || !this.species || !this.userId) {
      return false;
    }

    // Validar que la edad sea un número positivo
    if (this.age !== undefined && (typeof this.age !== 'number' || this.age < 0)) {
      return false;
    }

    // Validar que el peso sea un número positivo
    if (this.weight !== undefined && (typeof this.weight !== 'number' || this.weight <= 0)) {
      return false;
    }

    // Validar que el userId sea un número
    if (typeof this.userId !== 'number') {
      return false;
    }

    return true;
  }

  /**
   * Convierte el objeto a formato JSON para su serialización
   * @returns {object} - Representación JSON de la mascota
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      species: this.species,
      breed: this.breed,
      age: this.age,
      weight: this.weight,
      userId: this.userId
    };
  }
}

// Exportar la clase para poder usarla en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Pet;
}