# Clase Pet

La clase `Pet` representa una mascota en el sistema de cuidado de mascotas.

## Propiedades

- `id`: Identificador único de la mascota
- `name`: Nombre de la mascota
- `species`: Especie de la mascota (perro, gato, etc.)
- `breed`: Raza de la mascota
- `age`: Edad de la mascota
- `weight`: Peso de la mascota
- `userId`: Identificador del usuario dueño de la mascota

## Métodos

- `constructor(id, name, species, breed, age, weight, userId)`: Inicializa una nueva mascota
- `validate()`: Valida los datos de la mascota
- `toJSON()`: Convierte el objeto a formato JSON para su serialización

## Ejemplo de Uso

```javascript
const pet = new Pet(1, "Firulais", "perro", "Labrador", 3, 25.5, 1);
pet.validate(); // Valida los datos de la mascota
console.log(pet.toJSON()); // Muestra la mascota en formato JSON