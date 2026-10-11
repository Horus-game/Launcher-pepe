# Mi Inicio – launcher simple para adultos mayores (PWA)

**Qué es:** una PWA (HTML + CSS + JS, sin dependencias). Seis botones grandes; un toque en la foto de un familiar abre el marcador con su número. Datos y fotos quedan solo en el teléfono (IndexedDB). Funciona sin internet tras instalarla.

## 1. Publicar en GitHub Pages
1. Creá una cuenta en github.com y un repositorio nuevo, público (p. ej. `mi-inicio`).
2. "Add file" → "Upload files": descomprimí el ZIP y arrastrá **el contenido** (index.html, app.js, db.js, sw.js, styles.css, manifest.webmanifest y la carpeta icons). "Commit changes".
3. Settings → Pages → Source: "Deploy from a branch", rama `main`, carpeta `/ (root)` → Save.
4. En 1–2 minutos aparece la dirección `https://USUARIO.github.io/mi-inicio/`.

## 2. Instalar en Android
1. Abrí esa dirección en **Chrome** del teléfono (con internet) y esperá unos segundos.
2. Menú ⋮ → "Instalar aplicación" (o "Agregar a la pantalla principal") → Instalar. También: Configuración → "Instalar y sin internet".
3. Abrí "Mi Inicio" desde su icono: se abre sin barra de direcciones.

## 3. Configurar contactos y fotos
Mantené pulsado ⚙ (arriba a la derecha) 1,5 segundos. Contactos → AÑADIR: foto de la galería, nombre, parentesco, teléfono (con código de país, p. ej. +54...), WhatsApp opcional, y en qué botones aparece. "Los 6 botones" permite cambiar función, contacto, nombre, color y orden. Los contactos "EJEMPLO" son ficticios: borralos o editalos. Hacé una copia de seguridad (Configuración → Copia de seguridad).

## 4. Prueba sin internet (en un teléfono real)
Con la app instalada y abierta una vez con internet: activá modo avión, cerrá la app, abrila desde el icono. Deben verse los botones, fotos y configuración. Revisá "Instalar y sin internet". Al tocar una foto debe abrirse el marcador (hace falta señal para llamar).

## 5. Qué hace la PWA y qué no
| Funciona en la PWA | Necesita app Android nativa |
|---|---|
| 6 botones, fotos, contactos, SOS, copia de seguridad, offline | Ser el launcher predeterminado / abrirse al pulsar Inicio |
| Abrir el marcador con el número (`tel:`) | Llamar directo sin que Android muestre el marcador |
| Volver al inicio al regresar a la app tras llamar | Detectar el fin de la llamada y recuperar el primer plano solo |
| WhatsApp: abrir chat y mensaje preparado (hay que tocar enviar) | Llamada de WhatsApp directa, envío automático |
| Elegir un contacto de la agenda (solo si Chrome lo permite) | Acceso completo a la agenda |

La segunda etapa (APK/launcher) puede reutilizar esta misma interfaz dentro de un contenedor WebView nativo.

## 6. Estado de las pruebas
Solo se revisó el código (sintaxis). **Nada se probó aún en un teléfono Android real**: probá instalación, offline, llamadas y WhatsApp (el botón WhatsApp sin contacto usa un enlace `intent://` que hay que verificar en el dispositivo).

Importante: el botón SOS no reemplaza a los servicios de emergencia. Si olvidás el PIN, hay que borrar los datos de la app (se pierden contactos: usá copias).

## 7. Abrir otras apps desde un botón
Configuración → Los 6 botones → EDITAR → Función "ABRIR APP". Elegí una app de la lista (WhatsApp, YouTube, Facebook, Fotos, Mapas...) o escribí su nombre de paquete. Una PWA no puede listar las apps instaladas, por eso se elige por paquete. Si la app no está instalada, Chrome ofrece Play Store (requiere internet). Verificar en un teléfono real.

## 8. Toques necesarios (los de la app y los de Android)
| Acción | Toques de la app | Lo que controla Android |
|---|---|---|
| Llamar a un favorito (pantalla principal) | **1** (foto) | Android abre el marcador con el número: falta tocar "llamar" (+1). Con el aviso en voz activado hay 1,8 s para cancelar, sin toques extra |
| Llamar a un contacto que no es favorito | **2** (CONTACTOS → foto) | igual que arriba |
| Abrir un chat de WhatsApp | **1** (botón WhatsApp con contacto) o **2** desde CONTACTOS (💬) | WhatsApp se abre en el chat; enviar es siempre manual |
| SOS | **2** (SOS → contacto) | marcador de Android (+1). Pantalla intermedia deliberada para evitar activaciones accidentales |
| Volver al inicio tras llamar | **0** si la app vuelve a primer plano; si no, botón Inicio/recientes de Android | Android decide a qué app vuelve al colgar; la PWA no puede forzarlo |

## 9. Integración nativa futura
`app.js` usa `window.AndroidBridge` si existe (`AndroidBridge.dial(numero)`). Una app Android con WebView puede exponer ese método para llamar directo (permiso CALL_PHONE) y recuperar el primer plano, sin cambiar la interfaz.
