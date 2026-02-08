# 🚀 Guía de Despliegue en Render

Esta guía te ayudará a desplegar la API COMWARE en Render paso a paso.

---

## 📋 Pre-requisitos

- ✅ Cuenta en [Render](https://render.com)
- ✅ Base de datos PostgreSQL en Render (ya configurada)
- ✅ Repositorio Git con el código (GitHub, GitLab, o Bitbucket)

---

## 🔧 Paso 1: Preparar el Repositorio

### 1.1 Verificar que `.env` NO esté en Git

```bash
# Verificar que .env esté en .gitignore
cat .gitignore | grep .env

# Si no está, agregarlo
echo ".env" >> .gitignore
```

### 1.2 Hacer commit de los cambios

```bash
git add .
git commit -m "feat: Configuración para despliegue en Render"
git push origin main
```

---

## 🌐 Paso 2: Crear el Web Service en Render

### 2.1 Ir al Dashboard de Render

1. Accede a [https://dashboard.render.com](https://dashboard.render.com)
2. Click en **"New +"** → **"Web Service"**

### 2.2 Conectar el Repositorio

1. Conecta tu cuenta de GitHub/GitLab/Bitbucket
2. Selecciona el repositorio de la API
3. Click en **"Connect"**

### 2.3 Configurar el Servicio

Completa el formulario con estos valores:

| Campo              | Valor                                       |
| ------------------ | ------------------------------------------- |
| **Name**           | `comware-api` (o el nombre que prefieras)   |
| **Region**         | `Oregon (US West)` (misma región que tu BD) |
| **Branch**         | `main`                                      |
| **Root Directory** | (dejar vacío)                               |
| **Environment**    | `Node`                                      |
| **Build Command**  | `npm install`                               |
| **Start Command**  | `npm start`                                 |
| **Plan**           | `Free`                                      |

---

## 🔐 Paso 3: Configurar Variables de Entorno

En la sección **"Environment Variables"**, agrega las siguientes variables:

### Variables Requeridas:

```bash
NODE_ENV=production
DB_HOST=dpg-d639anv5r7bs73dflqa0-a.oregon-postgres.render.com
DB_PORT=5432
DB_USER=comware_user
DB_PASSWORD=OI2NXweufaHiBhRD1ACYNFGc9pQQOgjO
DB_NAME=comware
DB_SSL=true
```

### Variables Opcionales:

```bash
# URL del frontend (agregar después de desplegarlo)
FRONTEND_URL=https://tu-frontend.onrender.com
```

> **⚠️ IMPORTANTE:**
>
> - NO agregues la variable `PORT` - Render la asigna automáticamente
> - NO agregues `API_PORT` - se usa solo en desarrollo local

---

## 🎯 Paso 4: Configurar Health Check (Opcional pero Recomendado)

En **"Advanced"** → **"Health Check Path"**:

```
/api/health
```

Esto permite a Render verificar que tu API esté funcionando correctamente.

---

## 🚀 Paso 5: Desplegar

1. Click en **"Create Web Service"**
2. Render comenzará a:
   - ✅ Clonar tu repositorio
   - ✅ Ejecutar `npm install`
   - ✅ Ejecutar `npm start`
   - ✅ Asignar una URL pública

El despliegue toma aproximadamente **2-5 minutos**.

---

## ✅ Paso 6: Verificar el Despliegue

### 6.1 Obtener la URL

Una vez desplegado, Render te dará una URL como:

```
https://comware-api.onrender.com
```

### 6.2 Probar los Endpoints

```bash
# Health Check
curl https://comware-api.onrender.com/api/health

# Listar procesos
curl https://comware-api.onrender.com/api/procesos

# Información de la API
curl https://comware-api.onrender.com/
```

### 6.3 Verificar Logs

En el dashboard de Render:

1. Click en tu servicio
2. Ve a la pestaña **"Logs"**
3. Deberías ver:

```
🔒 SSL habilitado para conexión a PostgreSQL
✅ Conectado a PostgreSQL - Base de datos: comware
🚀 COMWARE API - Sistema de Gestión de Riesgos
🌍 Entorno: production
📡 Puerto: 10000
🔗 URL Pública: https://comware-api.onrender.com
```

---

## 🔄 Paso 7: Configurar Auto-Deploy (Opcional)

Por defecto, Render hace auto-deploy en cada push a `main`.

Para deshabilitarlo:

1. Ve a **"Settings"**
2. En **"Build & Deploy"** → deshabilita **"Auto-Deploy"**

---

## 🌍 Paso 8: Actualizar el Frontend

Una vez desplegada la API, actualiza tu frontend para usar la URL de producción:

```javascript
// En tu frontend
const API_URL = import.meta.env.PROD
  ? "https://comware-api.onrender.com/api"
  : "http://localhost:5000/api";
```

Y agrega la URL del frontend a las variables de entorno de Render:

```bash
FRONTEND_URL=https://tu-frontend.onrender.com
```

---

## 🐛 Solución de Problemas

### ❌ Error: "Application failed to respond"

**Causa:** El servidor no está escuchando en `0.0.0.0` o en el puerto correcto.

**Solución:** Verificar que `index.js` tenga:

```javascript
app.listen(PORT, '0.0.0.0', () => { ... });
```

### ❌ Error: "Database connection failed"

**Causa:** Variables de entorno incorrectas o base de datos inactiva.

**Solución:**

1. Verificar que todas las variables de BD estén configuradas
2. Verificar que `DB_SSL=true`
3. Verificar que la base de datos en Render esté activa

### ❌ Error de CORS

**Causa:** El frontend no está en la lista de orígenes permitidos.

**Solución:**

1. Agregar `FRONTEND_URL` en las variables de entorno de Render
2. Verificar que el código de CORS en `index.js` esté actualizado

### 🐌 La API está lenta

**Causa:** El plan Free de Render "duerme" después de 15 minutos de inactividad.

**Solución:**

- Upgrade a un plan pagado ($7/mes)
- O usar un servicio de "keep-alive" como [UptimeRobot](https://uptimerobot.com)

---

## 📊 Monitoreo

### Ver Logs en Tiempo Real

```bash
# Desde el dashboard de Render, ve a "Logs"
# O usa la CLI de Render:
render logs -f comware-api
```

### Métricas

En el dashboard puedes ver:

- 📈 CPU usage
- 💾 Memory usage
- 🌐 Request count
- ⏱️ Response time

---

## 🔄 Actualizar la API

Para desplegar cambios:

```bash
git add .
git commit -m "feat: Nueva funcionalidad"
git push origin main
```

Render detectará el push y desplegará automáticamente.

---

## 🎉 ¡Listo!

Tu API está ahora desplegada en producción.

**URL de tu API:** `https://comware-api.onrender.com`

### Próximos Pasos:

1. ✅ Desplegar el frontend
2. ✅ Configurar un dominio personalizado (opcional)
3. ✅ Configurar monitoreo y alertas
4. ✅ Implementar CI/CD con tests automáticos

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs en Render
2. Verifica las variables de entorno
3. Consulta la [documentación de Render](https://render.com/docs)

---

**Última actualización:** 2026-02-07
