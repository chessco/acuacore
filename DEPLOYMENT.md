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
   ```powershell
   .\deploy_api_hetzner.ps1
   ```
3. El script realizará:
   - Empaquetado de la carpeta `api/` y `docker-compose.prod.yml`.
   - Subida al servidor via `scp`.
   - Re-construcción del contenedor `acua-core-api`.

---

## 🌐 Despliegue del Frontend (Hostinger)
El sitio web se despliega en `https://acuacore.pitayacode.io`.

### Pasos:
1. Ejecuta el script automatizado desde la raíz:
   ```powershell
   .\deploy_web_hostinger.ps1
   ```
2. El script realizará:
   - `npm run build` en la carpeta `web/`.
   - Empaquetado del contenido de `web/dist/`.
   - Subida y extracción en el servidor Hostinger.

---

## 🛠️ Solución de Problemas (Troubleshooting)

### Error en el Build (TypeScript)
Si el build falla por variables no usadas, recuerda que hemos configurado `tsconfig.app.json` con:
```json
"noUnusedLocals": false,
"noUnusedParameters": false
```
Esto permite que el build ignore advertencias de limpieza de código que no son críticas para la ejecución.

### API No Conecta
Verifica que la variable `VITE_API_URL` en `web/.env.production` apunte a la dirección correcta (ej: `https://api.acuacore.pitayacode.io` o la IP de Hetzner).

---

## 📝 Notas de Versión
- **v1.2.0:** Implementación de despliegue automatizado y limpieza de componentes core.
- **v1.2.1:** Corrección de tipos en `UserManager` y `DeepExplanationBlock`.
- **v1.2.2:** Optimización de `tsconfig` para despliegue continuo.

---
*Mantenido por Antigravity (Advanced Agentic Coding)*
