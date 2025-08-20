/**
 * Pruebas para la clase Validator
 */

const Validator = require('../utils/Validator');

describe('Clase Validator', () => {
  let validator;

  beforeEach(() => {
    validator = new Validator();
  });

  test('debe validar correctamente un email válido', () => {
    const isValid = validator.validateEmail('juan@example.com');
    
    expect(isValid).toBe(true);
    expect(validator.isValid()).toBe(true);
  });

  test('debe invalidar correctamente un email inválido', () => {
    const isValid = validator.validateEmail('juan@.com');
    
    expect(isValid).toBe(false);
    expect(validator.isValid()).toBe(false);
  });

  test('debe validar correctamente una contraseña válida', () => {
    const isValid = validator.validatePassword('password123');
    
    expect(isValid).toBe(true);
    expect(validator.isValid()).toBe(true);
  });

  test('debe invalidar correctamente una contraseña corta', () => {
    const isValid = validator.validatePassword('pass');
    
    expect(isValid).toBe(false);
    expect(validator.isValid()).toBe(false);
  });

  test('debe validar correctamente un nombre válido', () => {
    const isValid = validator.validateName('Juan Pérez');
    
    expect(isValid).toBe(true);
    expect(validator.isValid()).toBe(true);
  });

  test('debe invalidar correctamente un nombre corto', () => {
    const isValid = validator.validateName('J');
    
    expect(isValid).toBe(false);
    expect(validator.isValid()).toBe(false);
  });

  test('debe validar correctamente un conjunto de datos con reglas', () => {
    const data = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'password123'
    };
    
    const rules = {
      name: ['required', 'name'],
      email: ['required', 'email'],
      password: ['required', 'password']
    };
    
    const isValid = validator.validate(data, rules);
    
    expect(isValid).toBe(true);
    expect(validator.isValid()).toBe(true);
  });

  test('debe invalidar correctamente un conjunto de datos con reglas inválidas', () => {
    const data = {
      name: '',
      email: 'juan@.com',
      password: 'pass'
    };
    
    const rules = {
      name: ['required', 'name'],
      email: ['required', 'email'],
      password: ['required', 'password']
    };
    
    const isValid = validator.validate(data, rules);
    
    expect(isValid).toBe(false);
    expect(validator.isValid()).toBe(false);
    
    const errors = validator.getErrors();
    expect(errors.name).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
  });

  test('debe limpiar los errores correctamente', () => {
    validator.validateEmail('juan@.com');
    expect(validator.isValid()).toBe(false);
    
    validator.clearErrors();
    expect(validator.isValid()).toBe(true);
  });
});