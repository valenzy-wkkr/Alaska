# Clase FormView

La clase `FormView` maneja la funcionalidad de los formularios en la aplicación, incluyendo validaciones, manejo de eventos y comunicación con el controlador.

## Propiedades

- `form`: Elemento del formulario
- `fields`: Campos del formulario
- `validator`: Instancia del validador de datos
- `errorHandler`: Instancia del manejador de errores

## Métodos

- `constructor(formElement)`: Inicializa un formulario
- `init()`: Inicializa los event listeners para el formulario
- `handleSubmission(event)`: Maneja el evento de envío del formulario
- `validateForm()`: Valida todos los campos del formulario
- `validateField(field)`: Valida un campo específico del formulario
- `showFieldError(field, message)`: Muestra un error en un campo específico
- `clearFieldError(field)`: Limpia el error de un campo específico
- `collectFormData()`: Recoge los datos del formulario
- `submitForm(data)`: Envía los datos del formulario al servidor
- `handleSuccess(response)`: Maneja la respuesta exitosa del servidor
- `handleError(error)`: Maneja los errores del servidor
- `resetForm()`: Reinicia el formulario a su estado inicial

## Ejemplo de Uso

```javascript
const registrationForm = document.querySelector('.formulario-registro');
const formView = new FormView(registrationForm);
formView.init(); // Inicializa la funcionalidad del formulario
```

## Características

- Validación en tiempo real de campos
- Manejo de errores con mensajes descriptivos
- Prevención de envíos duplicados
- Retroalimentación visual durante el proceso de envío
- Integración con clases de validación y manejo de errores
- Accesibilidad mejorada con atributos ARIA