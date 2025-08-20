# Panel de Control (Dashboard) - Alaska

## Descripción

El Panel de Control es una página personalizada donde los usuarios pueden gestionar toda la información relacionada con sus mascotas de manera centralizada y organizada.

## Características Principales

### 📊 Estadísticas Generales
- **Total de Mascotas**: Muestra el número de mascotas registradas
- **Próximas Citas**: Cuenta las citas veterinarias programadas
- **Recordatorios**: Total de recordatorios activos

### 🔔 Próximos Recordatorios
- Visualización de recordatorios ordenados por fecha
- Diferentes tipos: vacunas, citas, medicamentos, alimentación, paseos
- Indicadores visuales para recordatorios urgentes (menos de 24 horas)
- Formulario para agregar nuevos recordatorios
- Información detallada: título, fecha, tipo, mascota asociada y notas

### 🏥 Estado de Salud de Mascotas
- Tarjetas individuales para cada mascota
- Información completa: nombre, especie, raza, edad, peso
- Estado de salud con indicadores visuales:
  - 🟢 **Saludable**: Mascota en buen estado
  - 🟡 **Necesita atención**: Requiere revisión
  - 🔴 **Requiere revisión**: Problemas de salud identificados
- Fecha de última revisión veterinaria
- Formulario para agregar nuevas mascotas

### 📰 Últimos Artículos del Blog
- Vista previa de los 3 artículos más recientes
- Información: título, extracto, fecha, categoría
- Enlace directo al blog completo
- Contenido educativo sobre cuidado de mascotas

### ⏰ Actividad Reciente
- Timeline de actividades recientes
- Diferentes tipos: citas, recordatorios, mascotas, blog
- Iconos distintivos para cada tipo de actividad
- Timestamps relativos (hace X horas/días)

## Funcionalidades Interactivas

### Modales
- **Modal de Recordatorio**: Formulario completo para crear recordatorios
- **Modal de Mascota**: Formulario para registrar nuevas mascotas
- Cierre con botón X, clic fuera del modal o botón Cancelar

### Formularios
- Validación de campos requeridos
- Selectores dinámicos (mascotas disponibles)
- Campos específicos según el tipo de recordatorio
- Feedback visual de éxito/error

### Navegación
- Enlace al dashboard desde la navegación principal
- Botón de cerrar sesión
- Redirección automática si no hay usuario autenticado

## Estructura de Archivos

```
dashboard.html          # Página principal del dashboard
dashboard.css           # Estilos específicos del dashboard
js/dashboard.js         # Lógica y funcionalidad JavaScript
data/
├── blog-articles.json  # Datos de artículos del blog
├── pets-data.json      # Datos de mascotas de ejemplo
└── reminders-data.json # Datos de recordatorios de ejemplo
```

## Tecnologías Utilizadas

- **HTML5**: Estructura semántica y accesible
- **CSS3**: Diseño responsive y moderno
- **JavaScript ES6+**: Funcionalidad interactiva
- **Font Awesome**: Iconografía
- **Google Fonts**: Tipografías (Montserrat, Poppins)

## Diseño Responsive

El dashboard se adapta a diferentes tamaños de pantalla:

- **Desktop**: Layout de 2 columnas
- **Tablet**: Layout de 1 columna con estadísticas en fila
- **Mobile**: Layout vertical con estadísticas apiladas

## Estados de la Interfaz

### Estados Vacíos
- Mensajes informativos cuando no hay datos
- Iconos descriptivos
- Llamadas a la acción para agregar contenido

### Estados de Carga
- Indicadores de carga durante la obtención de datos
- Fallbacks para datos de ejemplo si no se pueden cargar los archivos JSON

### Estados de Error
- Manejo de errores en la carga de datos
- Mensajes informativos para el usuario

## Integración con el Sistema

### Autenticación
- Verificación de usuario autenticado
- Redirección automática al login si no hay sesión
- Persistencia de datos de usuario en localStorage

### Datos
- Carga desde archivos JSON locales
- Estructura preparada para integración con API
- Datos de ejemplo para demostración

## Personalización

### Colores
- Variables CSS para fácil personalización
- Paleta de colores coherente con el diseño principal
- Estados visuales diferenciados (urgente, atención, etc.)

### Contenido
- Datos de ejemplo editables en archivos JSON
- Estructura modular para agregar nuevas funcionalidades
- Sistema de categorías extensible

## Próximas Mejoras

- [ ] Notificaciones push en tiempo real
- [ ] Calendario integrado
- [ ] Gráficos de salud y peso
- [ ] Exportación de datos
- [ ] Modo oscuro
- [ ] Filtros avanzados
- [ ] Búsqueda en tiempo real
- [ ] Integración con APIs veterinarias

## Uso

1. Acceder al dashboard desde la navegación principal
2. Ver estadísticas generales en la parte superior
3. Gestionar recordatorios en la columna izquierda
4. Revisar estado de salud de mascotas
5. Leer artículos del blog en la columna derecha
6. Agregar nuevos recordatorios o mascotas con los botones "+"

## Soporte

Para reportar problemas o solicitar nuevas funcionalidades, contactar al equipo de desarrollo de Alaska.
