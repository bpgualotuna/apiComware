# API REST - Documentación de Endpoints

Base URL: `http://localhost:3001/api` (o la URL configurada en `API_BASE_URL` del frontend)

El frontend espera respuestas en **camelCase**. La API transforma automáticamente snake_case (DB) a camelCase.

---

## Health

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Estado del servicio |

---

## Procesos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/procesos` | Listar todos los procesos |
| GET | `/api/procesos/:id` | Obtener proceso por ID |
| POST | `/api/procesos` | Crear proceso |
| PUT | `/api/procesos/:id` | Actualizar proceso |
| DELETE | `/api/procesos/:id` | Eliminar proceso |
| POST | `/api/procesos/:id/duplicate` | Duplicar proceso |
| PUT | `/api/procesos/bulk` | Actualización masiva de procesos |

---

## Riesgos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/riesgos` | Listar riesgos (paginado). Query: `procesoId`, `clasificacion`, `busqueda`, `zona`, `page`, `pageSize` |
| GET | `/api/riesgos/recientes` | Riesgos recientes. Query: `limit` |
| GET | `/api/riesgos/:id` | Obtener riesgo por ID |
| POST | `/api/riesgos` | Crear riesgo |
| PUT | `/api/riesgos/:id` | Actualizar riesgo |
| DELETE | `/api/riesgos/:id` | Eliminar riesgo |

**Respuesta paginada (GET /riesgos):**
```json
{
  "data": [...],
  "total": 42,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5
}
```

---

## Evaluaciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/riesgos/:riesgoId/evaluaciones` | Listar evaluaciones de un riesgo |
| GET | `/api/evaluaciones/:id` | Obtener evaluación por ID |
| POST | `/api/evaluaciones` | Crear evaluación |

---

## Priorizaciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/priorizaciones` | Listar priorizaciones |
| POST | `/api/priorizaciones` | Crear priorización |

---

## Dashboard

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/estadisticas` | Estadísticas. Query: `procesoId` |
| GET | `/api/puntos-mapa` | Puntos para mapa de riesgos. Query: `procesoId`, `clasificacion` |

---

## Pasos de Proceso

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/pasos-proceso` | Listar pasos |
| POST | `/api/pasos-proceso` | Crear paso |
| PUT | `/api/pasos-proceso/:id` | Actualizar paso |
| DELETE | `/api/pasos-proceso/:id` | Eliminar paso |

---

## Encuestas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/encuestas` | Listar encuestas |
| GET | `/api/encuestas/:id` | Obtener encuesta por ID |
| POST | `/api/encuestas` | Crear encuesta |
| PUT | `/api/encuestas/:id` | Actualizar encuesta |
| DELETE | `/api/encuestas/:id` | Eliminar encuesta |

---

## Preguntas de Encuesta

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/encuestas/:encuestaId/preguntas` | Listar preguntas de una encuesta |
| POST | `/api/preguntas-encuesta` | Crear pregunta |
| PUT | `/api/preguntas-encuesta/:id` | Actualizar pregunta |
| DELETE | `/api/preguntas-encuesta/:id` | Eliminar pregunta |

---

## Listas de Valores

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/listas-valores` | Listar listas |
| GET | `/api/listas-valores/:id` | Obtener lista por ID |
| PUT | `/api/listas-valores/:id` | Actualizar lista |

---

## Parámetros de Valoración

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/parametros-valoracion` | Listar parámetros |
| GET | `/api/parametros-valoracion/:id` | Obtener parámetro por ID |
| PUT | `/api/parametros-valoracion/:id` | Actualizar parámetro |

---

## Tipologías

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/tipologias` | Listar tipologías |
| GET | `/api/tipologias/:id` | Obtener tipología por ID |
| POST | `/api/tipologias` | Crear tipología |
| PUT | `/api/tipologias/:id` | Actualizar tipología |
| DELETE | `/api/tipologias/:id` | Eliminar tipología |

---

## Fórmulas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/formulas` | Listar fórmulas |
| GET | `/api/formulas/:id` | Obtener fórmula por ID |
| POST | `/api/formulas` | Crear fórmula |
| PUT | `/api/formulas/:id` | Actualizar fórmula |
| DELETE | `/api/formulas/:id` | Eliminar fórmula |

---

## Configuraciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/configuraciones` | Listar configuraciones |
| PUT | `/api/configuraciones/:id` | Actualizar configuración |

---

## Catálogos (solo lectura)

| Método | Ruta |
|--------|------|
| GET | `/api/tipos-riesgo` |
| GET | `/api/objetivos` |
| GET | `/api/frecuencias` |
| GET | `/api/fuentes` |
| GET | `/api/impactos` |
| GET | `/api/origenes` |
| GET | `/api/tipos-proceso` |
| GET | `/api/consecuencias` |
| GET | `/api/causas` |
| GET | `/api/niveles-riesgo` |
| GET | `/api/clasificaciones-riesgo` |
| GET | `/api/ejes-mapa` |

---

## Mapa Config

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/mapa-config` | Obtener configuración del mapa |
| PUT | `/api/mapa-config` | Actualizar configuración. Body: `{ type, data }` |

---

## Observaciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/procesos/:procesoId/observaciones` | Listar observaciones de un proceso |
| POST | `/api/observaciones` | Crear observación |
| PUT | `/api/observaciones/:id` | Actualizar observación |

---

## Historial

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/procesos/:procesoId/historial` | Listar historial de un proceso |
| POST | `/api/historial` | Crear registro de historial |

---

## Tareas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/tareas` | Listar tareas |
| POST | `/api/tareas` | Crear tarea |
| PUT | `/api/tareas/:id` | Actualizar tarea |

---

## Notificaciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/notificaciones` | Listar notificaciones |
| POST | `/api/notificaciones` | Crear notificación |
| PUT | `/api/notificaciones/:id` | Actualizar notificación (ej: marcar como leída) |

---

## Áreas y Usuarios

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/areas` | Listar áreas |
| GET | `/api/usuarios` | Listar usuarios |

---

## Planes de Acción e Incidencias

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/planes-accion` | Listar planes de acción |
| GET | `/api/incidencias` | Listar incidencias |

---

## Migración del Frontend

1. Configurar `VITE_API_BASE_URL=http://localhost:3001` (o la URL de producción).
2. En `riesgosApi.ts`, cambiar `USE_MOCK_DATA` a `false` y sustituir `queryFn` por `query` con las rutas indicadas arriba.
3. Base URL para `fetchBaseQuery`: `API_BASE_URL + '/api'` (ej: `http://localhost:3001/api`).
4. Las rutas en cada endpoint deben coincidir con la columna "Ruta" de esta documentación (sin el prefijo `/api`).
