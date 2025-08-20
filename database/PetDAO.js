/**
 * Clase para acceder a los datos de mascotas en la base de datos
 * Proporciona métodos para realizar operaciones CRUD sobre mascotas
 */
class PetDAO {
  /**
   * Constructor de la clase PetDAO
   * @param {DatabaseConnection} databaseConnection - La conexión a la base de datos
   */
  constructor(databaseConnection) {
    this.db = databaseConnection;
  }

  /**
   * Crea una nueva mascota en la base de datos
   * @param {Pet} pet - El objeto Pet a crear
   * @returns {Promise<Pet>} - La mascota creada con su ID asignado
   */
  async create(pet) {
    try {
      // Validar que la mascota tenga los datos requeridos
      if (!pet.validate()) {
        throw new Error('Datos de mascota inválidos');
      }

      const params = {
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age: pet.age,
        weight: pet.weight,
        userId: pet.userId
      };

      // Ejecutar el procedimiento almacenado para crear mascota
      const result = await this.db.executeStoredProcedure('CreatePet', params);
      
      // Asignar el ID generado a la mascota
      pet.id = result[0].PetId;
      
      return pet;
    } catch (error) {
      console.error('Error al crear mascota:', error);
      throw new Error(`No se pudo crear la mascota: ${error.message}`);
    }
  }

  /**
   * Busca una mascota por su ID
   * @param {number} id - El ID de la mascota a buscar
   * @returns {Promise<Pet|null>} - La mascota encontrada o null si no existe
   */
  async findById(id) {
    try {
      const params = { petId: id };
      const result = await this.db.executeStoredProcedure('GetPetById', params);
      
      if (result.length === 0) {
        return null;
      }
      
      const petData = result[0];
      return this.mapRowToPet(petData);
    } catch (error) {
      console.error('Error al buscar mascota por ID:', error);
      throw new Error(`No se pudo obtener la mascota: ${error.message}`);
    }
  }

  /**
   * Busca todas las mascotas de un usuario específico
   * @param {number} userId - El ID del usuario
   * @returns {Promise<Array<Pet>>} - Array de mascotas del usuario
   */
  async findByUserId(userId) {
    try {
      const params = { userId: userId };
      const result = await this.db.executeStoredProcedure('GetPetsByUserId', params);
      
      return result.map(row => this.mapRowToPet(row));
    } catch (error) {
      console.error('Error al buscar mascotas por ID de usuario:', error);
      throw new Error(`No se pudieron obtener las mascotas: ${error.message}`);
    }
  }

  /**
   * Actualiza una mascota existente en la base de datos
   * @param {number} id - El ID de la mascota a actualizar
   * @param {object} petData - Los nuevos datos de la mascota
   * @returns {Promise<number>} - El número de filas afectadas
   */
  async update(id, petData) {
    try {
      const params = {
        petId: id,
        name: petData.name,
        species: petData.species,
        breed: petData.breed,
        age: petData.age,
        weight: petData.weight
      };

      const result = await this.db.executeStoredProcedure('UpdatePet', params);
      return result[0].RowsAffected;
    } catch (error) {
      console.error('Error al actualizar mascota:', error);
      throw new Error(`No se pudo actualizar la mascota: ${error.message}`);
    }
  }

  /**
   * Elimina una mascota de la base de datos
   * @param {number} id - El ID de la mascota a eliminar
   * @returns {Promise<number>} - El número de filas afectadas
   */
  async delete(id) {
    try {
      const params = { petId: id };
      const result = await this.db.executeStoredProcedure('DeletePet', params);
      return result[0].RowsAffected;
    } catch (error) {
      console.error('Error al eliminar mascota:', error);
      throw new Error(`No se pudo eliminar la mascota: ${error.message}`);
    }
  }

  /**
   * Obtiene todas las mascotas de la base de datos
   * @returns {Promise<Array<Pet>>} - Array de mascotas
   */
  async findAll() {
    try {
      const result = await this.db.executeQuery('SELECT * FROM Pets');
      return result.map(row => this.mapRowToPet(row));
    } catch (error) {
      console.error('Error al obtener todas las mascotas:', error);
      throw new Error(`No se pudieron obtener las mascotas: ${error.message}`);
    }
  }

  /**
   * Mapea una fila de la base de datos a un objeto Pet
   * @param {object} row - La fila de la base de datos
   * @returns {Pet} - El objeto Pet creado
   */
  mapRowToPet(row) {
    return new Pet(
      row.id,
      row.name,
      row.species,
      row.breed,
      row.age,
      row.weight,
      row.userId
    );
  }

  /**
   * Valida que una mascota exista en la base de datos
   * @param {number} id - El ID de la mascota a validar
   * @returns {Promise<boolean>} - true si la mascota existe, false en caso contrario
   */
  async validatePetExists(id) {
    try {
      const pet = await this.findById(id);
      return pet !== null;
    } catch (error) {
      console.error('Error al validar existencia de mascota:', error);
      return false;
    }
  }

  /**
   * Valida que un usuario sea dueño de una mascota específica
   * @param {number} petId - El ID de la mascota
   * @param {number} userId - El ID del usuario
   * @returns {Promise<boolean>} - true si el usuario es dueño de la mascota, false en caso contrario
   */
  async validateUserOwnsPet(petId, userId) {
    try {
      const pet = await this.findById(petId);
      return pet !== null && pet.userId === userId;
    } catch (error) {
      console.error('Error al validar propiedad de mascota:', error);
      return false;
    }
  }
}

// Exportar la clase para poder usarla en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PetDAO;
}