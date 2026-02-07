# Migración a PostgreSQL en Render - Resumen

## ✅ Cambios Realizados

Se ha actualizado la configuración de la API para conectarse a la base de datos PostgreSQL alojada en **Render** en lugar de la base de datos local.

---

## 📝 Archivos Modificados

### 1. `.env`

**Cambios:**

- ✅ `DB_HOST`: `localhost` → `dpg-d639anv5r7bs73dflqa0-a.oregon-postgres.render.com`
- ✅ `DB_USER`: `postgres` → `comware_user`
- ✅ `DB_PASSWORD`: `bpg2000` → `OI2NXweufaHiBhRD1ACYNFGc9pQQOgjO`
- ✅ `DB_NAME`: `comware` (sin cambios)
- ✅ `DB_PORT`: `5432` (sin cambios)
- ✅ **NUEVO:** `DB_SSL=true` (requerido para Render)

### 2. `config/database.js`

**Cambios:**

- ✅ Agregada configuración SSL condicional
- ✅ SSL habilitado cuando `DB_SSL=true`
- ✅ `rejectUnauthorized: false` para compatibilidad con Render

---

## 🔒 Configuración SSL

```javascript
if (process.env.DB_SSL === "true") {
  poolConfig.ssl = {
    rejectUnauthorized: false, // Necesario para Render
  };
  console.log("🔒 SSL habilitado para conexión a PostgreSQL");
}
```

---

## ✅ Verificación de Conexión

**Salida del servidor:**

```
🔒 SSL habilitado para conexión a PostgreSQL
✅ Conectado a PostgreSQL - Base de datos: comware

============================================================
🚀 COMWARE API - Sistema de Gestión de Riesgos
============================================================
📡 Servidor corriendo en: http://localhost:5000
```

---

## 🗄️ Detalles de la Base de Datos en Render

| Parámetro         | Valor                                                   |
| ----------------- | ------------------------------------------------------- |
| **Host**          | `dpg-d639anv5r7bs73dflqa0-a.oregon-postgres.render.com` |
| **Puerto**        | `5432`                                                  |
| **Usuario**       | `comware_user`                                          |
| **Base de Datos** | `comware`                                               |
| **SSL**           | ✅ Habilitado                                           |
| **Región**        | Oregon, USA                                             |

---

## 📋 Próximos Pasos

### 1. Verificar Esquema de Base de Datos

Asegúrate de que la base de datos en Render tenga todas las tablas necesarias:

```bash
# Conectar a la base de datos en Render
psql -h dpg-d639anv5r7bs73dflqa0-a.oregon-postgres.render.com \
     -U comware_user \
     -d comware \
     -p 5432
```

### 2. Ejecutar Scripts SQL (si es necesario)

Si la base de datos está vacía, ejecutar en orden:

1. `02_nuevo_esquema_completo.sql` - Crear tablas principales
2. `04_tablas_usuarios_auth.sql` - Crear tablas de usuarios y autenticación
3. `03_datos_ejemplo.sql` - Insertar datos de ejemplo

### 3. Probar Endpoints

```bash
# Health check
curl http://localhost:5000/api/health

# Listar procesos
curl http://localhost:5000/api/procesos

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 🔄 Volver a Base de Datos Local (si es necesario)

Si necesitas volver a la configuración local, edita `.env`:

```bash
# Configuración Local
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=bpg2000
DB_NAME=comware
DB_SSL=false  # o eliminar esta línea
```

---

## ⚠️ Notas Importantes

1. **Seguridad:** Las credenciales están en el archivo `.env`. Asegúrate de que `.env` esté en `.gitignore`
2. **SSL:** Render requiere SSL. No funciona sin `DB_SSL=true`
3. **Conexiones:** El pool tiene máximo 20 conexiones simultáneas
4. **Timeout:** Conexión timeout de 2 segundos, idle timeout de 30 segundos

---

## 🧪 Estado Actual

- ✅ API conectada a PostgreSQL en Render
- ✅ SSL habilitado y funcionando
- ✅ Servidor corriendo en `http://localhost:5000`
- ✅ Todos los endpoints disponibles
- ⏳ Pendiente: Verificar que todas las tablas existan en Render
- ⏳ Pendiente: Poblar datos si es necesario

---

## 📞 Soporte

Si hay problemas de conexión:

1. Verificar que las credenciales sean correctas
2. Verificar que la base de datos en Render esté activa
3. Verificar que el firewall permita conexiones desde tu IP
4. Revisar logs del servidor: `npm run dev`
