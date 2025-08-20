/**
 * Pruebas para la clase UserController
 */

const UserController = require('../controllers/UserController');
const UserDAO = require('../database/UserDAO');
const Validator = require('../utils/Validator');
const { ErrorHandler } = require('../utils/ErrorHandler');

// Mocks
jest.mock('../database/UserDAO');
jest.mock('../utils/Validator');
jest.mock('../utils/ErrorHandler');

describe('Clase UserController', () => {
  let userController;
  let mockUserDAO;
  let mockValidator;
  let mockErrorHandler;

  beforeEach(() => {
    // Crear mocks
    mockUserDAO = new UserDAO();
    mockValidator = new Validator();
    mockErrorHandler = new ErrorHandler();
    
    // Crear instancia de UserController con mocks
    userController = new UserController(mockUserDAO, mockValidator, mockErrorHandler);
  });

  test('debe crear un usuario correctamente', async () => {
    const userData = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      username: 'juanp',
      address: 'Calle 123',
      password: 'password123'
    };

    mockValidator.validate.mockReturnValue(true);
    mockUserDAO.create.mockResolvedValue({
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@example.com',
      username: 'juanp',
      address: 'Calle 123'
    });

    const result = await userController.createUser(userData);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Usuario creado exitosamente');
    expect(mockUserDAO.create).toHaveBeenCalled();
  });

  test('debe manejar errores al crear un usuario', async () => {
    const userData = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      username: 'juanp',
      address: 'Calle 123',
      password: 'password123'
    };

    mockValidator.validate.mockReturnValue(true);
    mockUserDAO.create.mockRejectedValue(new Error('Error de base de datos'));

    await expect(userController.createUser(userData)).rejects.toThrow('Error de base de datos');
  });

  test('debe obtener un usuario por ID correctamente', async () => {
    const userId = 1;
    const user = {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@example.com',
      username: 'juanp',
      address: 'Calle 123'
    };

    mockUserDAO.findById.mockResolvedValue(user);

    const result = await userController.getUserById(userId);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Usuario obtenido exitosamente');
    expect(result.user).toEqual(user);
  });

  test('debe devolver un mensaje cuando no se encuentra un usuario', async () => {
    const userId = 999;

    mockUserDAO.findById.mockResolvedValue(null);

    const result = await userController.getUserById(userId);

    expect(result.success).toBe(false);
    expect(result.message).toBe('Usuario no encontrado');
  });

  test('debe actualizar un usuario correctamente', async () => {
    const userId = 1;
    const userData = {
      name: 'Juan Pérez Actualizado',
      email: 'juan.actualizado@example.com',
      username: 'juanp',
      address: 'Calle 123 Actualizada'
    };

    mockValidator.validate.mockReturnValue(true);
    mockUserDAO.findById.mockResolvedValue({ id: 1 });
    mockUserDAO.update.mockResolvedValue(1);

    const result = await userController.updateUser(userId, userData);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Usuario actualizado exitosamente');
    expect(mockUserDAO.update).toHaveBeenCalledWith(userId, userData);
  });

  test('debe eliminar un usuario correctamente', async () => {
    const userId = 1;

    mockUserDAO.findById.mockResolvedValue({ id: 1 });
    mockUserDAO.delete.mockResolvedValue(1);

    const result = await userController.deleteUser(userId);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Usuario eliminado exitosamente');
    expect(mockUserDAO.delete).toHaveBeenCalledWith(userId);
  });

  test('debe autenticar un usuario correctamente', async () => {
    const email = 'juan@example.com';
    const password = 'password123';
    const user = {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@example.com',
      username: 'juanp',
      address: 'Calle 123'
    };

    mockValidator.validateEmail.mockReturnValue(true);
    mockUserDAO.authenticate.mockResolvedValue(user);

    const result = await userController.authenticateUser(email, password);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Autenticación exitosa');
    expect(result.user).toEqual(user);
  });
});