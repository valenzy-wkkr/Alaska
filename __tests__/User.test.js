/**
 * Pruebas para la clase User
 */

const User = require('../models/User');

describe('Clase User', () => {
  test('debe crear una instancia de User correctamente', () => {
    const user = new User(1, 'Juan Pérez', 'juan@example.com', 'juanp', 'Calle 123', 'password123');
    
    expect(user.id).toBe(1);
    expect(user.name).toBe('Juan Pérez');
    expect(user.email).toBe('juan@example.com');
    expect(user.username).toBe('juanp');
    expect(user.address).toBe('Calle 123');
    expect(user.password).toBe('password123');
  });

  test('debe validar correctamente los datos de un usuario válido', () => {
    const user = new User(1, 'Juan Pérez', 'juan@example.com', 'juanp', 'Calle 123', 'password123');
    
    expect(user.validate()).toBe(true);
  });

  test('debe invalidar correctamente los datos de un usuario inválido', () => {
    const user = new User(1, '', 'juan@example.com', 'juanp', 'Calle 123', 'password123');
    
    expect(user.validate()).toBe(false);
  });

  test('debe hashear la contraseña correctamente', () => {
    const user = new User(1, 'Juan Pérez', 'juan@example.com', 'juanp', 'Calle 123', 'password123');
    user.hashPassword();
    
    expect(user.password).toBe('hashed_password123');
  });

  test('debe convertir el usuario a JSON correctamente', () => {
    const user = new User(1, 'Juan Pérez', 'juan@example.com', 'juanp', 'Calle 123', 'password123');
    const json = user.toJSON();
    
    expect(json.id).toBe(1);
    expect(json.name).toBe('Juan Pérez');
    expect(json.email).toBe('juan@example.com');
    expect(json.username).toBe('juanp');
    expect(json.address).toBe('Calle 123');
    expect(json.password).toBeUndefined();
  });
});