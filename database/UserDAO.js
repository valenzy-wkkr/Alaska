/**
 * Clase para acceder a los datos de usuarios en la base de datos
 * Proporciona métodos para realizar operaciones CRUD sobre usuarios
 */
class UserDAO {
  /**
   * Constructor de la clase UserDAO
   * @param {DatabaseConnection} databaseConnection - La conexión a la base de datos
   */
  constructor(databaseConnection) {
    this.db = databaseConnection;
  }

  /**
   * Crea un nuevo usuario en la base de datos
   * @param {User} user - El objeto User a crear
   * @returns {Promise<User>} - El usuario creado con su ID asignado
   */
  async create(user) {
    try {
      // Validar que el usuario tenga los datos requeridos
      if (!user.validate()) {
        throw new Error('Datos de usuario inválidos');
      }

      const params = {
        name: user.name,
        email: user.email,
        username: user.username,
        address: user.address,
        password: user.password
      };

      // Ejecutar el procedimiento almacenado para crear usuario
      const result = await this.db.executeStoredProcedure('CreateUser', params);
      
      // Asignar el ID generado al usuario
      user.id = result[0].UserId;
      
      return user;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw new Error(`No se pudo crear el usuario: ${error.message}`);
    }
  }

  /**
   * Busca un usuario por su ID
   * @param {number} id - El ID del usuario a buscar
   * @returns {Promise<User|null>} - El usuario encontrado o null si no existe
   */
  async findById(id) {
    try {
      const params = { userId: id };
      const result = await this.db.executeStoredProcedure('GetUserById', params);
      
      if (result.length === 0) {
        return null;
      }
      
      const userData = result[0];
      return this.mapRowToUser(userData);
    } catch (error) {
      console.error('Error al buscar usuario por ID:', error);
      throw new Error(`No se pudo obtener el usuario: ${error.message}`);
    }
  }

  /**
   * Busca un usuario por su email
   * @param {string} email - El email del usuario a buscar
   * @returns {Promise<User|null>} - El usuario encontrado o null si no existe
   */
  async findByEmail(email) {
    try {
      const params = { email: email };
      const result = await this.db.executeStoredProcedure('GetUserByEmail', params);
      
      if (result.length === 0) {
        return null;
      }
      
      const userData = result[0];
      return this.mapRowToUser(userData);
    } catch (error) {
      console.error('Error al buscar usuario por email:', error);
      throw new Error(`No se pudo obtener el usuario: ${error.message}`);
    }
  }

  /**
   * Actualiza un usuario existente en la base de datos
   * @param {number} id - El ID del usuario a actualizar
   * @param {object} userData - Los nuevos datos del usuario
   * @returns {Promise<number>} - El número de filas afectadas
   */
  async update(id, userData) {
    try {
      const params = {
        userId: id,
        name: userData.name,
        email: userData.email,
        username: userData.username,
        address: userData.address
      };

      const result = await this.db.executeStoredProcedure('UpdateUser', params);
      return result[0].RowsAffected;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw new Error(`No se pudo actualizar el usuario: ${error.message}`);
    }
  }

  /**
   * Elimina un usuario de la base de datos
   * @param {number} id - El ID del usuario a eliminar
   * @returns {Promise<number>} - El número de filas afectadas
   */
  async delete(id) {
    try {
      const params = { userId: id };
      const result = await this.db.executeStoredProcedure('DeleteUser', params);
      return result[0].RowsAffected;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw new Error(`No se pudo eliminar el usuario: ${error.message}`);
    }
  }

  /**
   * Obtiene todos los usuarios de la base de datos
   * @returns {Promise<Array<User>>} - Array de usuarios
   */
  async findAll() {
    try {
      const result = await this.db.executeQuery('SELECT * FROM Users');
      return result.map(row => this.mapRowToUser(row));
    } catch (error) {
      console.error('Error al obtener todos los usuarios:', error);
      throw new Error(`No se pudieron obtener los usuarios: ${error.message}`);
    }
  }

  /**
   * Autentica un usuario por email y contraseña
   * @param {string} email - El email del usuario
   * @param {string} password - La contraseña del usuario
   * @returns {Promise<User|null>} - El usuario autenticado o null si las credenciales son inválidas
   */
  async authenticate(email, password) {
    try {
      const params = {
        email: email,
        password: password // En una implementación real, se compararía el hash
      };

      const result = await this.db.executeStoredProcedure('AuthenticateUser', params);
      
      if (result.length === 0) {
        return null;
      }
      
      const userData = result[0];
      return this.mapRowToUser(userData);
    } catch (error) {
      console.error('Error al autenticar usuario:', error);
      throw new Error(`No se pudo autenticar el usuario: ${error.message}`);
    }
  }

  /**
   * Mapea una fila de la base de datos a un objeto User
   * @param {object} row - La fila de la base de datos
   * @returns {User} - El objeto User creado
   */
  mapRowToUser(row) {
    return new User(
      row.id,
      row.name,
      row.email,
      row.username,
      row.address,
      row.password
    );
  }
}

// Exportar la clase para poder usarla en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UserDAO;
}