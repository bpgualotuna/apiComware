# COMWARE API - Sistema de Gestión de Riesgos

API REST completa para el Sistema de Gestión de Riesgos COMWARE, construida con Node.js, Express y PostgreSQL.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar en desarrollo (con hot reload)
npm run dev

# Iniciar en producción
npm start
```

**Servidor:** `http://localhost:5000`

---

## 📋 Tabla de Contenidos

- [Configuración](#-configuración)
- [Autenticación](#-autenticación)
- [Usuarios](#-usuarios)
- [Administración](#-administración)
- [Catálogos](#-catálogos)
- [Procesos y Áreas](#-procesos-y-áreas)
- [Riesgos](#-riesgos)
- [Evaluaciones](#-evaluaciones)
- [Configuración del Sistema](#-configuración-del-sistema)
- [Workflow](#-workflow)
- [Códigos de Error](#-códigos-de-error)

---

## ⚙️ Configuración

### Variables de Entorno (.env)

```bash
# Base de Datos PostgreSQL
DB_HOST=dpg-d639anv5r7bs73dflqa0-a.oregon-postgres.render.com
DB_PORT=5432
DB_USER=comware_user
DB_PASSWORD=OI2NXweufaHiBhRD1ACYNFGc9pQQOgjO
DB_NAME=comware
DB_SSL=true

# Servidor API
API_PORT=5000
NODE_ENV=development
```

### Dependencias

- **express** - Framework web
- **pg** - Cliente PostgreSQL
- **bcrypt** - Hash de contraseñas
- **cors** - CORS middleware
- **dotenv** - Variables de entorno
- **nodemon** - Hot reload (dev)

---

## 🔐 Autenticación

### POST `/api/auth/login`

Iniciar sesión con credenciales de usuario.

**Request:**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200):**

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

**Errores:**

- `400` - Campos requeridos faltantes
- `401` - Credenciales inválidas
- `403` - Usuario inactivo

---

### POST `/api/auth/logout`

Cerrar sesión del usuario actual.

**Response (200):**

```json
{
  "message": "Logout exitoso"
}
```

---

### GET `/api/auth/me`

Verificar sesión actual (preparado para JWT).

**Response (200):**

```json
{
  "message": "Endpoint para verificar sesión (implementar JWT)"
}
```

---

## 👥 Usuarios

### GET `/api/usuarios`

Listar todos los usuarios del sistema.

**Query Parameters:**

- `activo` (boolean) - Filtrar por estado activo/inactivo
- `role` (string) - Filtrar por rol
- `limit` (number) - Límite de resultados
- `offset` (number) - Offset para paginación

**Ejemplo:** `GET /api/usuarios?activo=true&role=manager&limit=10`

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@comware.com",
      "full_name": "Administrador",
      "role": "admin",
      "department": "Administración",
      "position": "Administrador",
      "phone": "+57 300 123 4567",
      "activo": true,
      "fecha_creacion": "2024-01-01T00:00:00Z",
      "ultimo_acceso": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

---

### GET `/api/usuarios/:id`

Obtener un usuario específico por ID.

**Response (200):** Objeto de usuario

**Errores:**

- `404` - Usuario no encontrado

---

### POST `/api/usuarios`

Crear un nuevo usuario.

**Request:**

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

**Roles disponibles:**

- `admin` - Administrador
- `dueño_procesos` - Dueño de Procesos
- `manager` - Gerente de Procesos
- `analyst` - Analista
- `director_procesos` - Director General

**Response (201):** Usuario creado (sin password)

**Errores:**

- `400` - Campos requeridos faltantes
- `409` - Username o email ya existe

---

### PUT `/api/usuarios/:id`

Actualizar información de un usuario.

**Request:** Campos a actualizar (sin password)

```json
{
  "full_name": "Juan Pérez Actualizado",
  "position": "Senior Analyst",
  "phone": "+57 301 234 5678"
}
```

**Response (200):** Usuario actualizado

**Errores:**

- `404` - Usuario no encontrado

---

### PATCH `/api/usuarios/:id/password`

Cambiar contraseña de un usuario.

**Request:**

```json
{
  "nuevaPassword": "nuevaPassword123"
}
```

**Response (200):**

```json
{
  "message": "Contraseña actualizada correctamente"
}
```

**Errores:**

- `400` - Contraseña debe tener al menos 6 caracteres
- `404` - Usuario no encontrado

---

### PATCH `/api/usuarios/:id/toggle`

Activar o desactivar un usuario.

**Response (200):**

```json
{
  "message": "Usuario activado correctamente",
  "activo": true
}
```

**Errores:**

- `404` - Usuario no encontrado

---

### DELETE `/api/usuarios/:id`

Eliminar un usuario del sistema.

**Response (200):**

```json
{
  "message": "Usuario eliminado correctamente",
  "id": 1
}
```

**Errores:**

- `404` - Usuario no encontrado
- `409` - Usuario tiene registros relacionados

---

## 🛡️ Administración

### GET `/api/admin/roles`

Listar roles del sistema (solo lectura).

**Response (200):**

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
  ],
  "total": 5
}
```

---

### GET `/api/admin/areas/:areaId/gerentes`

Obtener gerentes asignados a un área.

**Ejemplo:** `GET /api/admin/areas/1/gerentes`

**Response (200):**

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
      "department": "Talento Humano",
      "position": "Gerente de Riesgos",
      "fecha_asignacion": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### POST `/api/admin/areas/:areaId/gerentes`

Asignar un gerente a un área.

**Request:**

```json
{
  "usuarioId": 2
}
```

**Response (201):**

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

**Errores:**

- `400` - usuarioId requerido
- `404` - Área o usuario no encontrado
- `409` - Gerente ya asignado a esta área

---

### DELETE `/api/admin/areas/:areaId/gerentes/:usuarioId`

Remover un gerente de un área.

**Ejemplo:** `DELETE /api/admin/areas/1/gerentes/2`

**Response (200):**

```json
{
  "message": "Gerente removido del área correctamente",
  "areaId": 1,
  "usuarioId": 2
}
```

**Errores:**

- `404` - Asignación no encontrada

---

### GET `/api/admin/usuarios/:usuarioId/areas`

Obtener áreas asignadas a un gerente.

**Ejemplo:** `GET /api/admin/usuarios/2/areas`

**Response (200):**

```json
{
  "usuarioId": 2,
  "areas": [
    {
      "id": 1,
      "nombre": "Talento Humano",
      "descripcion": "Área de recursos humanos",
      "director_id": 5,
      "director_nombre": "Carlos Director",
      "fecha_asignacion": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## 📚 Catálogos

Todos los catálogos soportan las mismas operaciones CRUD.

### Endpoints Disponibles

| Endpoint                               | Descripción                |
| -------------------------------------- | -------------------------- |
| `GET /api/catalogos/origenes-riesgo`   | Orígenes de riesgo         |
| `GET /api/catalogos/tipos-riesgo`      | Tipos de riesgo            |
| `GET /api/catalogos/fuentes-causa`     | Fuentes de causa           |
| `GET /api/catalogos/frecuencias`       | Frecuencias de ocurrencia  |
| `GET /api/catalogos/niveles-impacto`   | Niveles de impacto         |
| `GET /api/catalogos/objetivos`         | Objetivos organizacionales |
| `GET /api/catalogos/atributos-control` | Atributos de control       |

### Operaciones CRUD

Todos los catálogos soportan:

- `GET /api/catalogos/{nombre}` - Listar todos
- `GET /api/catalogos/{nombre}/:id` - Obtener uno
- `POST /api/catalogos/{nombre}` - Crear
- `PUT /api/catalogos/{nombre}/:id` - Actualizar
- `PATCH /api/catalogos/{nombre}/:id` - Actualizar parcial
- `DELETE /api/catalogos/{nombre}/:id` - Eliminar

**Query Parameters (GET):**

- `activo` (boolean) - Filtrar por estado
- `limit` (number) - Límite de resultados
- `offset` (number) - Offset para paginación
- `orderBy` (string) - Campo para ordenar
- `order` (string) - Dirección: ASC o DESC

**Ejemplo:** `GET /api/catalogos/tipos-riesgo?activo=true&orderBy=nombre&order=ASC`

---

## 🏢 Procesos y Áreas

### Áreas

#### GET `/api/areas`

Listar todas las áreas.

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Talento Humano",
      "descripcion": "Área de recursos humanos",
      "director_id": 5,
      "director_nombre": "Carlos Director",
      "activo": true,
      "fecha_creacion": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 4
}
```

#### POST `/api/areas`

Crear nueva área.

**Request:**

```json
{
  "nombre": "Nueva Área",
  "descripcion": "Descripción del área",
  "director_id": 5
}
```

#### PUT `/api/areas/:id`

Actualizar área.

#### DELETE `/api/areas/:id`

Eliminar área.

---

### Personas

#### GET `/api/personas`

Listar todas las personas.

#### POST `/api/personas`

Crear nueva persona.

**Request:**

```json
{
  "nombre": "Juan Pérez",
  "cargo": "Analista",
  "email": "juan@comware.com",
  "telefono": "+57 300 123 4567"
}
```

---

### Procesos

#### GET `/api/procesos`

Listar todos los procesos.

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "codigo_proceso": "PRO-001",
      "nombre_proceso": "Gestión de Talento Humano",
      "descripcion": "Proceso de gestión de recursos humanos",
      "area_id": 1,
      "responsable_id": 2,
      "director_id": 5,
      "activo": true,
      "fecha_creacion": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 10
}
```

#### POST `/api/procesos`

Crear nuevo proceso.

**Request:**

```json
{
  "codigo_proceso": "PRO-002",
  "nombre_proceso": "Nuevo Proceso",
  "descripcion": "Descripción del proceso",
  "area_id": 1,
  "responsable_id": 2,
  "director_id": 5
}
```

#### PUT `/api/procesos/:id`

Actualizar proceso.

#### DELETE `/api/procesos/:id`

Eliminar proceso.

---

## ⚠️ Riesgos

### GET `/api/riesgos`

Listar todos los riesgos.

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "codigo_riesgo": "R-001",
      "descripcion_riesgo": "Riesgo de pérdida de datos",
      "proceso_id": 1,
      "tipo_riesgo_id": 1,
      "origen_riesgo_id": 1,
      "activo": true,
      "fecha_creacion": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 25
}
```

### POST `/api/riesgos`

Crear nuevo riesgo.

**Request:**

```json
{
  "codigo_riesgo": "R-002",
  "descripcion_riesgo": "Descripción del riesgo",
  "proceso_id": 1,
  "tipo_riesgo_id": 1,
  "origen_riesgo_id": 1
}
```

---

### Causas

#### GET `/api/causas`

Listar todas las causas de riesgos.

#### POST `/api/causas`

Crear nueva causa.

**Request:**

```json
{
  "riesgo_id": 1,
  "descripcion_causa": "Descripción de la causa",
  "fuente_causa_id": 1
}
```

---

### Controles de Riesgo

#### GET `/api/controles-riesgo`

Listar todos los controles.

#### POST `/api/controles-riesgo`

Crear nuevo control.

**Request:**

```json
{
  "causa_id": 1,
  "descripcion_control": "Descripción del control",
  "tipo_control": "preventivo",
  "frecuencia_control_id": 1
}
```

---

## 📊 Evaluaciones

### Evaluaciones de Riesgo

#### GET `/api/evaluaciones-riesgo`

Listar todas las evaluaciones.

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "riesgo_id": 1,
      "probabilidad": 3,
      "impacto": 4,
      "nivel_riesgo": "alto",
      "fecha_evaluacion": "2024-01-15T00:00:00Z",
      "evaluador_id": 2
    }
  ],
  "total": 50
}
```

#### POST `/api/evaluaciones-riesgo`

Crear nueva evaluación.

**Request:**

```json
{
  "riesgo_id": 1,
  "probabilidad": 3,
  "impacto": 4,
  "nivel_riesgo": "alto",
  "fecha_evaluacion": "2024-01-15",
  "evaluador_id": 2,
  "observaciones": "Observaciones de la evaluación"
}
```

---

### Priorizaciones

#### GET `/api/priorizaciones`

Listar priorizaciones de riesgos.

#### POST `/api/priorizaciones`

Crear nueva priorización.

---

### Planes de Acción

#### GET `/api/planes-accion`

Listar planes de acción.

#### POST `/api/planes-accion`

Crear nuevo plan de acción.

**Request:**

```json
{
  "riesgo_id": 1,
  "nombre_plan": "Plan de Mitigación",
  "descripcion": "Descripción del plan",
  "responsable_id": 2,
  "fecha_inicio": "2024-02-01",
  "fecha_fin": "2024-03-01",
  "estado": "en_progreso"
}
```

---

### Acciones del Plan

#### GET `/api/acciones-plan`

Listar acciones de planes.

#### POST `/api/acciones-plan`

Crear nueva acción.

**Request:**

```json
{
  "plan_accion_id": 1,
  "descripcion_accion": "Implementar backup automático",
  "responsable_id": 3,
  "fecha_limite": "2024-02-15",
  "estado": "pendiente"
}
```

---

## ⚙️ Configuración del Sistema

### Pasos de Proceso

#### GET `/api/configuracion/pasos-proceso`

Listar pasos de proceso.

#### POST `/api/configuracion/pasos-proceso`

Crear nuevo paso.

---

### Listas de Valores

#### GET `/api/configuracion/listas-valores`

Listar listas de valores configurables.

#### GET `/api/configuracion/valores-lista`

Listar valores de listas.

---

### Parámetros de Valoración

#### GET `/api/configuracion/parametros-valoracion`

Listar parámetros de valoración.

#### GET `/api/configuracion/valores-parametro`

Listar valores de parámetros.

---

### Configuraciones Generales

#### GET `/api/configuracion/configuraciones`

Listar configuraciones del sistema.

---

## 🔔 Workflow

### Notificaciones

#### GET `/api/workflow/notificaciones`

Listar notificaciones.

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "usuario_id": 2,
      "tipo": "proceso_aprobado",
      "mensaje": "El proceso PRO-001 ha sido aprobado",
      "leida": false,
      "fecha_creacion": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 15
}
```

#### POST `/api/workflow/notificaciones`

Crear nueva notificación.

---

### Tareas

#### GET `/api/workflow/tareas`

Listar tareas.

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "titulo": "Revisar evaluación de riesgo",
      "descripcion": "Revisar la evaluación del riesgo R-001",
      "asignado_a": 2,
      "estado": "pendiente",
      "prioridad": "alta",
      "fecha_limite": "2024-02-01T00:00:00Z"
    }
  ],
  "total": 8
}
```

#### POST `/api/workflow/tareas`

Crear nueva tarea.

---

### Observaciones de Proceso

#### GET `/api/workflow/observaciones-proceso`

Listar observaciones.

#### POST `/api/workflow/observaciones-proceso`

Crear nueva observación.

---

### Historial de Cambios

#### GET `/api/workflow/historial-cambios`

Listar historial de cambios de procesos.

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "proceso_id": 1,
      "usuario_id": 2,
      "tipo_cambio": "actualizacion",
      "descripcion": "Actualización de descripción del proceso",
      "fecha_cambio": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 50
}
```

---

## 🔍 Características Comunes

### Paginación

Todos los endpoints GET soportan paginación:

```
GET /api/procesos?limit=10&offset=0
```

### Filtros

Filtrar por estado activo:

```
GET /api/procesos?activo=true
```

### Ordenamiento

Ordenar resultados:

```
GET /api/procesos?orderBy=nombre_proceso&order=ASC
```

### Respuesta Estándar

```json
{
  "data": [...],
  "total": 100,
  "limit": 10,
  "offset": 0
}
```

---

## ❌ Códigos de Error

| Código | Descripción                                |
| ------ | ------------------------------------------ |
| `200`  | OK - Solicitud exitosa                     |
| `201`  | Created - Recurso creado                   |
| `400`  | Bad Request - Datos inválidos              |
| `401`  | Unauthorized - No autenticado              |
| `403`  | Forbidden - Sin permisos                   |
| `404`  | Not Found - Recurso no encontrado          |
| `409`  | Conflict - Conflicto (duplicado, FK)       |
| `500`  | Internal Server Error - Error del servidor |

### Formato de Error

```json
{
  "error": "Descripción del error",
  "message": "Mensaje detallado",
  "code": "23505"
}
```

### Errores PostgreSQL Comunes

- `23505` - Violación de unicidad (duplicado)
- `23503` - Violación de clave foránea
- `23502` - Violación de NOT NULL
- `22P02` - Tipo de dato inválido

---

## 🧪 Testing con Postman

### Colección de Ejemplo

```bash
# Importar en Postman
curl -o comware-api.postman_collection.json \
  http://localhost:5000/api/postman-collection
```

### Ejemplos de Requests

**1. Login**

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**2. Crear Usuario**

```bash
POST http://localhost:5000/api/usuarios
Content-Type: application/json

{
  "username": "test.user",
  "email": "test@comware.com",
  "password": "password123",
  "full_name": "Usuario de Prueba",
  "role": "analyst"
}
```

**3. Listar Procesos**

```bash
GET http://localhost:5000/api/procesos?activo=true&limit=10
```

**4. Crear Riesgo**

```bash
POST http://localhost:5000/api/riesgos
Content-Type: application/json

{
  "codigo_riesgo": "R-001",
  "descripcion_riesgo": "Riesgo de ejemplo",
  "proceso_id": 1,
  "tipo_riesgo_id": 1
}
```

---

## 📊 Resumen de Endpoints

**Total de endpoints:** 40+

| Módulo             | Endpoints | Descripción                       |
| ------------------ | --------- | --------------------------------- |
| **Autenticación**  | 3         | Login, logout, verificación       |
| **Usuarios**       | 7         | CRUD + password + toggle          |
| **Administración** | 5         | Roles, gerentes por área          |
| **Catálogos**      | 42        | 7 catálogos × 6 operaciones       |
| **Procesos**       | 18        | Áreas, personas, procesos         |
| **Riesgos**        | 18        | Riesgos, causas, controles        |
| **Evaluaciones**   | 24        | Evaluaciones, planes, acciones    |
| **Configuración**  | 36        | Pasos, listas, parámetros         |
| **Workflow**       | 24        | Notificaciones, tareas, historial |

---

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ Conexión SSL a PostgreSQL
- ✅ Validación de entrada
- ✅ Manejo de errores SQL
- ⚠️ JWT pendiente de implementar

---

## 📝 Notas

- Todos los timestamps están en formato ISO 8601
- Los IDs son enteros autoincrementales
- Los campos `activo` son booleanos
- Las fechas se aceptan en formato `YYYY-MM-DD`
- La API usa `snake_case` para nombres de campos en la BD

---

## 📞 Soporte

Para más información, consulta:

- `NUEVOS_ENDPOINTS.md` - Detalles de endpoints de usuarios/auth
- `MIGRACION_RENDER.md` - Configuración de base de datos
- `/api` - Documentación interactiva en el servidor

**Servidor:** http://localhost:5000  
**Health Check:** http://localhost:5000/api/health  
**Documentación:** http://localhost:5000/api
