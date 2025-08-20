/**
 * Configuración de demostración para el Dashboard
 * Este archivo simula un usuario autenticado y configura datos de ejemplo
 */

// Configurar usuario de demostración
function setupDemoUser() {
    const demoUser = {
        id: 1,
        name: "María González",
        email: "maria.gonzalez@email.com",
        username: "maria_gonzalez",
        address: "Calle Principal 123, Ciudad"
    };
    
    localStorage.setItem('currentUser', JSON.stringify(demoUser));
    console.log('Usuario de demostración configurado:', demoUser.name);
}

// Configurar datos de demostración si no existen
function setupDemoData() {
    // Verificar si ya existen datos
    if (localStorage.getItem('demoDataSetup')) {
        return;
    }
    
    // Marcar que los datos de demostración están configurados
    localStorage.setItem('demoDataSetup', 'true');
    console.log('Datos de demostración configurados');
}

// Función para limpiar datos de demostración
function clearDemoData() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('demoDataSetup');
    console.log('Datos de demostración limpiados');
}

// Función para reiniciar datos de demostración
function resetDemoData() {
    clearDemoData();
    setupDemoUser();
    setupDemoData();
    console.log('Datos de demostración reiniciados');
}

// Configurar automáticamente al cargar la página
if (typeof window !== 'undefined') {
    // Solo configurar si estamos en la página de inicio
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        setupDemoUser();
        setupDemoData();
    }
}

// Exponer funciones para uso manual
if (typeof window !== 'undefined') {
    window.demoSetup = {
        setupUser: setupDemoUser,
        setupData: setupDemoData,
        clearData: clearDemoData,
        resetData: resetDemoData
    };
}
