# Clase ButtonView

La clase `ButtonView` maneja la funcionalidad de los botones en la aplicación, incluyendo eventos de clic, validaciones y efectos visuales.

## Propiedades

- `button`: Elemento del botón
- `type`: Tipo de botón (primario, secundario, etc.)
- `action`: Acción que ejecuta el botón

## Métodos

- `constructor(buttonElement, type, action)`: Inicializa un botón
- `init()`: Inicializa los event listeners para el botón
- `handleClick(event)`: Maneja el evento de clic en el botón
- `validateForm()`: Valida el formulario asociado al botón (si aplica)
- `showLoadingState()`: Muestra estado de carga en el botón
- `hideLoadingState()`: Oculta estado de carga en el botón
- `disable()`: Desactiva el botón
- `enable()`: Activa el botón
- `showSuccess(message)`: Muestra mensaje de éxito
- `showError(message)`: Muestra mensaje de error

## Ejemplo de Uso

```javascript
const registerButton = document.querySelector('.boton-primario');
const buttonView = new ButtonView(registerButton, 'primary', 'register');
buttonView.init(); // Inicializa la funcionalidad del botón
```

## Características

- Validación de formularios antes de enviar
- Estados visuales para diferentes acciones (carga, éxito, error)
- Desactivación temporal durante procesos asíncronos
- Mensajes de retroalimentación al usuario
- Efectos visuales y transiciones suaves