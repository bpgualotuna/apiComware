# Nuevos Endpoints - Gestión de Usuarios y Administración

## 📋 Resumen de Endpoints Agregados

Se han agregado **3 nuevos módulos** con endpoints para completar la funcionalidad administrativa del sistema.

---

## 🔐 1. Autenticación (`/api/auth`)

### POST `/api/auth/login`

**Descripción:** Iniciar sesión con username y password

**Body:**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Respuesta exitosa (200):**

```json
{
  "message": "Login exitoso",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@comware.com",
    "full_name": "Administrador del Sistema",
    "role": "admin",
    "department": "Administración",
    "position": "Administrador",
    "activo": true
  }
}
```

### POST `/api/auth/logout`

**Descripción:** Cerrar sesión

**Respuesta (200):**

```json
{
  "message": "Logout exitoso"
}
```

---

## 👥 2. Usuarios (`/api/usuarios`)

### GET `/api/usuarios`

**Descripción:** Listar todos los usuarios

**Query params:**

- `activo` (boolean): Filtrar por estado
- `role` (string): Filtrar por rol
- `limit` (number): Límite de resultados
- `offset` (number): Offset para paginación

**Ejemplo:** `GET /api/usuarios?activo=true&role=manager`

**Respuesta (200):**

```json
{
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@comware.com",
      "full_name": "Administrador",
      "role": "admin",
      "activo": true,
      "fecha_creacion": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

### GET `/api/usuarios/:id`

**Descripción:** Obtener un usuario por ID

**Respuesta (200):** Objeto de usuario

### POST `/api/usuarios`

**Descripción:** Crear nuevo usuario

**Body:**

```json
{
  "username": "juan.perez",
  "email": "juan.perez@comware.com",
  "password": "password123",
  "full_name": "Juan Pérez",
  "role": "analyst",
  "department": "Talento Humano",
  "position": "Analista de Riesgos",
  "phone": "+57 300 123 4567"
}
```

**Respuesta (201):** Usuario creado (sin password_hash)

### PUT `/api/usuarios/:id`

**Descripción:** Actualizar usuario

**Body:** Campos a actualizar (sin password)

### PATCH `/api/usuarios/:id/password`

**Descripción:** Cambiar contraseña de usuario

**Body:**

```json
{
  "nuevaPassword": "nuevaPassword123"
}
```

**Respuesta (200):**

```json
{
  "message": "Contraseña actualizada correctamente"
}
```

### PATCH `/api/usuarios/:id/toggle`

**Descripción:** Activar/desactivar usuario

**Respuesta (200):**

```json
{
  "message": "Usuario activado correctamente",
  "activo": true
}
```

### DELETE `/api/usuarios/:id`

**Descripción:** Eliminar usuario

**Respuesta (200):**

```json
{
  "message": "Usuario eliminado correctamente",
  "id": 1
}
```

---

## 🛡️ 3. Administración (`/api/admin`)

### Roles

#### GET `/api/admin/roles`

**Descripción:** Listar roles del sistema

**Respuesta (200):**

```json
{
  "data": [
    {
      "id": 1,
      "codigo": "admin",
      "nombre": "Administrador",
      "descripcion": "Acceso completo al sistema",
      "es_sistema": true,
      "activo": true
    }
  ]
}
```

### Gerentes por Área

#### GET `/api/admin/areas/:areaId/gerentes`

**Descripción:** Obtener gerentes asignados a un área

**Ejemplo:** `GET /api/admin/areas/1/gerentes`

**Respuesta (200):**

```json
{
  "areaId": 1,
  "gerentes": [
    {
      "id": 2,
      "username": "maria.gonzalez",
      "full_name": "María González",
      "email": "maria@comware.com",
      "role": "manager",
      "fecha_asignacion": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### POST `/api/admin/areas/:areaId/gerentes`

**Descripción:** Asignar gerente a un área

**Body:**

```json
{
  "usuarioId": 2
}
```

**Respuesta (201):**

```json
{
  "message": "Gerente asignado correctamente",
  "asignacion": {
    "area_id": 1,
    "usuario_id": 2,
    "fecha_asignacion": "2024-01-15T10:30:00Z"
  }
}
```

#### DELETE `/api/admin/areas/:areaId/gerentes/:usuarioId`

**Descripción:** Remover gerente de un área

**Ejemplo:** `DELETE /api/admin/areas/1/gerentes/2`

**Respuesta (200):**

```json
{
  "message": "Gerente removido del área correctamente",
  "areaId": 1,
  "usuarioId": 2
}
```

#### GET `/api/admin/usuarios/:usuarioId/areas`

**Descripción:** Obtener áreas asignadas a un gerente

**Ejemplo:** `GET /api/admin/usuarios/2/areas`

**Respuesta (200):**

```json
{
  "usuarioId": 2,
  "areas": [
    {
      "id": 1,
      "nombre": "Talento Humano",
      "descripcion": "Área de recursos humanos",
      "fecha_asignacion": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## 🗄️ Tablas Creadas en PostgreSQL

### 1. `usuarios`

- Almacena usuarios del sistema con autenticación
- Password hasheado con bcrypt
- Roles: admin, dueño_procesos, manager, analyst, director_procesos

### 2. `roles`

- Catálogo de roles del sistema (solo lectura)
- 5 roles predefinidos

### 3. `area_gerentes`

- Relación many-to-many entre áreas y gerentes
- Permite múltiples gerentes por área

### 4. `permisos_proceso`

- Permisos específicos de usuarios sobre procesos
- (Preparado para futuras implementaciones)

### 5. `sesiones`

- Sesiones activas de usuarios
- (Preparado para implementación JWT)

---

## 📝 Script SQL

Ejecutar en PostgreSQL:

```bash
psql -U postgres -d comware -f "Base de datos Refactorizada/04_tablas_usuarios_auth.sql"
```

O desde pgAdmin:

1. Abrir Query Tool
2. Cargar archivo `04_tablas_usuarios_auth.sql`
3. Ejecutar (F5)

---

## ✅ Checklist de Integración

### Backend (API)

- [x] Tabla `usuarios` creada
- [x] Tabla `roles` creada
- [x] Tabla `area_gerentes` creada
- [x] Endpoints CRUD de usuarios
- [x] Endpoint cambiar password
- [x] Endpoint toggle activo/inactivo
- [x] Endpoints de autenticación (login/logout)
- [x] Endpoints de gerentes por área
- [x] Hash de contraseñas con bcrypt

### Pendiente

- [ ] Ejecutar script SQL en PostgreSQL
- [ ] Probar endpoints con Postman
- [ ] Implementar JWT para autenticación real
- [ ] Actualizar frontend para usar nuevos endpoints

---

## 🧪 Pruebas con Postman

### 1. Crear usuario

```
POST http://localhost:5000/api/usuarios
Content-Type: application/json

{
  "username": "test.user",
  "email": "test@comware.com",
  "password": "password123",
  "full_name": "Usuario de Prueba",
  "role": "analyst",
  "department": "TI",
  "position": "Desarrollador"
}
```

### 2. Login

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### 3. Asignar gerente a área

```
POST http://localhost:5000/api/admin/areas/1/gerentes
Content-Type: application/json

{
  "usuarioId": 2
}
```

### 4. Listar gerentes de un área

```
GET http://localhost:5000/api/admin/areas/1/gerentes
```

---

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ Validación de campos requeridos
- ✅ Manejo de errores de duplicados
- ⚠️ JWT pendiente de implementar para producción
- ⚠️ Cambiar contraseña de admin en producción

---

## 📊 Endpoints Totales

**Antes:** 25+ endpoints (CRUD de tablas)
**Ahora:** 40+ endpoints

**Nuevos módulos:**

- Autenticación: 3 endpoints
- Usuarios: 7 endpoints
- Administración: 5 endpoints
