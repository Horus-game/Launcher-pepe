# Mi Inicio – app Android (launcher)

Es la misma interfaz web (carpeta `app/src/main/assets`) dentro de una app Android.
Con esto la app puede **listar las apps instaladas**, **llamar directo** y ser el **launcher** del teléfono.

## Compilar el APK sin Android Studio (GitHub)
1. Creá un repositorio en github.com y subí **todo el contenido de esta carpeta** (incluida la carpeta oculta `.github`).
2. Pestaña **Actions** → "Compilar APK" → esperá ~5 min (si no arrancó solo: Run workflow).
3. Entrá a la ejecución terminada → abajo, **Artifacts** → `MiInicio-apk` → descargá el zip y sacá `app-debug.apk`.

## Instalar
1. Pasá el APK al teléfono y abrilo (permití "instalar apps de esta fuente").
2. Abrí "Mi Inicio" y aceptá el permiso de **llamadas** (así llama directo, sin pasar por el marcador).
3. Para que sea el inicio: Ajustes → Aplicaciones → Apps predeterminadas → **Aplicación de inicio** → Mi Inicio.

## Poner una app en un cuadro del inicio
Mantené pulsado ⚙ 1,5 s → **Los 6 botones** → EDITAR en el cuadro → **ELEGIR APP INSTALADA** → tocá la app.
Queda guardado con su icono y nombre.

## Datos
La app instalada guarda sus datos aparte de la versión web/Chrome: usá **Copia de seguridad → EXPORTAR** en la versión vieja e **IMPORTAR** en la nueva.

## Estado
Los cambios de la interfaz se probaron en un navegador simulado; el código Android **no se compiló ni probó en un teléfono real**. Si GitHub muestra un error de compilación, pasalo y se corrige.
