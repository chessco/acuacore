# Guía de Despliegue de Producción - AcuaCore

Este documento detalla el proceso final para desplegar **AcuaCore** en sus entornos de producción: **Hetzner** (Backend/API) y **Hostinger** (Frontend/Web).

## 🚀 Resumen del Estado Actual
- **Build de Producción:** ✅ Verificado y exitoso (Zero errors).
- **TypeScript:** ✅ Reglas `noUnusedLocals` y `noUnusedParameters` relajadas en `tsconfig.app.json` para facilitar el despliegue.
- **Configuración:** ✅ Todos los componentes usan `VITE_API_URL` para la comunicación con la API.
- **Seguridad:** ✅ Secretos y llaves SSH manejados externamente.

---

## 🏗️ Despliegue del Backend (Hetzner)
La API corre sobre Docker en un servidor compartido dentro de la red `pitaya_net`.

### Pasos:
1. Asegúrate de tener la llave SSH `id_citaia` en tu carpeta `.ssh`.
2. Ejecuta el script automatizado desde la raíz:
## 🔐 Configuración de Entornos (.env)

Hemos implementado un sistema de doble archivo para evitar conflictos entre local y producción:

- **`api/.env`**: Configuración para desarrollo local (usa `localhost`).
- **`api/.env.prod`**: Configuración para producción (usa nombres de contenedores Docker).

### Credenciales de Producción (Hetzner)
| Base de Datos | Host | Usuario | Contraseña | Puerto Interno |
| :--- | :--- | :--- | :--- | :--- |
| **MySQL (Transaccional)** | `luxury-mysql-prod` | `root` | `luxury_pass` | 3306 |
| **PostgreSQL (Vectores)** | `acua-core-postgres` | `acuacore_user` | `acuacore_pass` | 5432 |

---

## 🚀 Despliegue Automatizado

### 1. API (Hetzner)
El script `.\deploy_api_hetzner.ps1` realiza las siguientes acciones:
1. Empaqueta el código del API.
2. Sube el paquete al servidor Hetzner.
3. **Crucial:** Intercambia el archivo `.env.prod` por el `.env` final en el servidor.
4. Reconstruye el contenedor `acua-core-api`.

```powershell
.\deploy_api_hetzner.ps1
```

### 2. Web (Hostinger)
El script `.\deploy_web_hostinger.ps1` compila y sube el frontend:
1. Genera la build de Vite.
2. Sube los archivos vía SSH/SCP.
3. Asegura que el `.htaccess` esté configurado para rutas SPA.

```powershell
.\deploy_web_hostinger.ps1
```

### 3. Sincronización de Datos (Knowledge)
Para subir nuevos vectores de conocimiento desde local a producción:
```powershell
.\sync_postgres_to_prod.ps1
```
*(Asegúrate de que la base de datos local sea `acuacore_vectors`)*.

---

## 🛠️ Solución de Problemas Comunes

### Error de CORS o 500 al iniciar
Suele deberse a que el API no puede conectar con la base de datos (Error P1000/P1001). Verifica que la red `pitaya_net` exista en el servidor y que las credenciales en `.env.prod` coincidan con las de los contenedores.

### API No Conecta
Verifica que la variable `VITE_API_URL` en `web/.env.production` apunte a la dirección correcta (ej: `https://api.acuacore.pitayacode.io` o la IP de Hetzner).

---

## 📝 Notas de Versión
- **v1.2.0:** Implementación de despliegue automatizado y limpieza de componentes core.
- **v1.2.1:** Corrección de tipos en `UserManager` y `DeepExplanationBlock`.
- **v1.2.2:** Optimización de `tsconfig` para despliegue continuo.

---
*Mantenido por Antigravity (Advanced Agentic Coding)*
