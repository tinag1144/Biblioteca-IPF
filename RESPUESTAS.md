# TP4 · Respuestas sobre Biblioteca IPF

## Parte B · Estado, efectos y renderizado

### B1. El ciclo de vida de `useLibros`

Contando los renders que provoca el estado de carga, hay dos si la petición inicial responde y cuatro si falla y el reintento responde. El hook agrupa la lista, el indicador y el error en un mismo estado. [useLibros.ts, líneas 6–30](src/hooks/useLibros.ts#L6-L30)

| Render | `libros` | `cargando` | `error` | Qué lo provoca |
| --- | --- | --- | --- | --- |
| 1 | `[]` | `true` | `null` | Montaje. Después del render, el efecto inicia el pedido. |
| 2, éxito | 15 libros | `false` | `null` | El `.then()` publica los datos. |
| 2, fallo | `[]` | `false` | Mensaje para el catálogo | El `.catch()` publica el fallo y su acción de reintento. |
| 3, al reintentar | `[]` | `true` | `null` | El evento restablece la carga e incrementa `intento`. React agrupa ambas actualizaciones. |
| 4, reintento exitoso | 15 libros | `false` | `null` | El resultado del nuevo pedido reemplaza la carga. Si falla otra vez, vuelve el mensaje de error. |

En Chrome agregué mensajes temporales al inicio y a la limpieza. Al cambiar a Mis reservas y volver, y al abrir un detalle, solo apareció el mensaje del inicio original. El catálogo conservó su estado. Retiré la instrumentación. La limpieza corre cuando cambia `intento` y cuando React desmonta la vista o desconecta sus efectos al ocultarla mediante una frontera de actividad. Cambiar el foco por sí solo no ejecutó esa limpieza.

El callback del efecto debe devolver inmediatamente una función de limpieza o `undefined`. Una función `async` devuelve una promesa. En mi hook el efecto llama a la API, encadena `.then()` y `.catch()`, y devuelve sincrónicamente `() => { vigente = false; }`. La API simulada termina la espera, pero su resultado se descarta si el efecto ya se limpió. [useLibros.ts, líneas 13–23](src/hooks/useLibros.ts#L13-L23)

El contador `intento` cambia en cada toque de **Reintentar** y por eso sirve para repetir el mismo pedido. Depender de `libros` dispararía otra solicitud con cada respuesta, pues la API devuelve un array nuevo. [useLibros.ts, líneas 23–28](src/hooks/useLibros.ts#L23-L28)

### B2. La condición de carrera del buscador

| Tiempo | Sin limpieza | Biblioteca IPF |
| --- | --- | --- |
| 0 ms | Aparece «bor» y arranca la primera petición. Todavía no hay resultados. | Aparece «bor» y el indicador. |
| 200 ms | Aparece «borges» y hay dos pedidos pendientes. | Aparece «borges» y el indicador. El efecto de «bor» queda invalidado. |
| 500 ms | Se muestra Ficciones, que coincide con «borges». | Se muestra Ficciones bajo «borges». |
| 1.400 ms | El pedido de «bor» reemplaza la lista. Aparece también Cumbres borrascosas bajo «borges». | Se mantiene Ficciones. |

Cada ejecución tiene su propio `vigente`. Al cambiar `q` o el intento, React limpia el efecto anterior antes de ejecutar el nuevo. El callback tardío lee `false` y descarta su resultado. El render también exige que coincidan la consulta y el intento. Probé en Chrome forzando la inversión de demoras y Cumbres borrascosas no apareció bajo «borges». [useBusqueda.ts, líneas 8–30](src/hooks/useBusqueda.ts#L8-L30)

Comparar `texto === q` dentro del `.then()` no alcanza si ambos valores vienen del mismo render. La clausura de «bor» sigue comparando «bor» con «bor» aunque ya se haya escrito «borges». Una ref podría dar acceso al valor actual, pero se necesitaría también identificar cada pedido si hay dos intentos para el mismo texto.

`router.setParams({ q: texto })` cambia la URL en la entrada actual. Atrás sale de la búsqueda sin recorrer las letras. `push` podría agregar una entrada por cambio y montar otro buscador. [buscar.tsx, líneas 9–30](src/app/buscar.tsx#L9-L30)

### B3. Mutar o reemplazar

1. Después de los tres toques el texto sigue mostrando 0. La instancia cambió, pero ningún toque llamó a un setter de React.
2. El cambio del `TextInput` controlado provoca otro render. Entonces se vuelve a leer esa misma cola, que ya contiene tres personas. Depender de una interacción distinta para revelar el fallo dificulta reproducirlo.
3. Mi Context crea una cola a partir de `aArray()`, opera sobre la copia y publica un estado nuevo. Mantiene también una ref al último estado para que dos acciones seguidas lean la versión actual antes del próximo render. Copiar cuesta O(n) por espera y preserva el estado que leyeron renders anteriores. Un contador de versión podría evitar la copia, pero exige actualizarlo en cada mutación y deja referencias que cambian por detrás. `useReducer` permitiría expresar las transiciones como acciones y seguir usando copias. [biblioteca.ts, líneas 51–80](src/lib/biblioteca.ts#L51-L80) · [BibliotecaContext.tsx, líneas 32–45](src/context/BibliotecaContext.tsx#L32-L45)

### B4. Dónde vive cada dato

| Dato | Ubicación | Motivo |
| --- | --- | --- |
| Texto del buscador | URL, en `q` | El input y los enlaces usan la misma consulta. |
| Préstamos y reservas | Context | Detalle, confirmación y Mis reservas comparten las operaciones. La reserva en espera se deriva de la posición. |
| Listas de espera | Context, cola por ISBN | Lector y mostrador necesitan ver el mismo orden. |
| Vistos recientemente | Context, pila | El detalle registra la visita y el catálogo lee el tope. |
| Sesión del personal | Context | La consultan el Stack raíz y el botón Personal. |
| Ejemplares disponibles | Valor calculado | Se obtiene del stock inicial, los ajustes de mostrador y el préstamo activo. |
| Permiso de cámara | Sistema, con una lectura reciente en el hook | Ajustes puede modificarlo mientras la pantalla sigue montada. |
| ID de la notificación | Dentro del préstamo, en el Context | Se usa para encontrar y cancelar el aviso al devolver o desactivar. |

Cuando cambia la identidad de `value` se vuelven a renderizar sus consumidores. El catálogo también puede renderizar al activar un recordatorio, aunque cambien datos que su lista no necesita. `useMemo` conserva el valor mientras sus dependencias tengan la misma identidad. Separar sesión, catálogo y préstamos en contextos o usar selectores permitiría reducir esos renders. Con 15 libros, separaría los contextos si el Profiler mostrara un costo visible. [BibliotecaContext.tsx, líneas 121–134](src/context/BibliotecaContext.tsx#L121-L134) · [biblioteca.ts, líneas 16–36](src/lib/biblioteca.ts#L16-L36)

## Parte C · Navegación y rutas

### C1. La pila en mi app

La tabla muestra las pilas de base a tope. La fila de Atrás en Android se deduce de la configuración. En Chrome sí comprobé que Atrás no vuelve al modal y que al elegir Catálogo desde Mis reservas se recupera el detalle abierto.

| Paso | Stack raíz | Tab activa | Stack del Catálogo |
| --- | --- | --- | --- |
| 1. Abre la app | `(tabs)` | Catálogo | `index` |
| 2. Abre un libro | `(tabs)` | Catálogo | `index → libro/[isbn]` |
| 3. Toca Reservar | `(tabs) → reservar/[isbn]` | Catálogo debajo del modal | `index → libro/[isbn]` |
| 4. Confirma | `(tabs)` | Mis reservas | `index → libro/[isbn]` |
| 5. Atrás en Android | `(tabs)` | Catálogo por `backBehavior="initialRoute"` | `index → libro/[isbn]` |
| 6. Toca Catálogo, ya activa | `(tabs)` | Catálogo | `index`, por la reselección de la tab |

La confirmación registra la operación y usa `router.dismissTo('/reservas')` para salir del modal y enfocar Mis reservas. `push` puede dejar la confirmación detrás del destino y permitir reabrirla. `replace` sustituye la entrada actual. `dismissTo` expresa que quiero volver a un destino del navegador y contempla reemplazar si no hay coincidencia. [Confirmación, líneas 39–44](src/app/reservar/%5Bisbn%5D.tsx#L39-L44) · [Tabs](src/app/%28tabs%29/_layout.tsx#L5-L26) · [Stack de Expo Router](https://docs.expo.dev/router/advanced/stack/)

Si elige Catálogo directamente desde Mis reservas, vuelve al detalle y puede retomar la ficha que estaba consultando. Si ya está en Catálogo, tocar la tab otra vez la lleva al listado. Me parece adecuado porque se puede conservar la ficha y volver al inicio con un toque.

### C2. El escáner que dispara de más

Sin protección, cada cuadro que detecta el código podría encolar otro `push` antes del cambio de pantalla. La pila podría contener la misma ficha varias veces. Uso `navegando.current = true` antes de navegar. Una ref cambia de inmediato. `setState(true)` depende de otro render, por lo que callbacks ya emitidos pueden seguir leyendo `false`.

`replace` sustituye el escáner por la ficha y permite volver al catálogo sin reabrir la cámara. Con `push`, Atrás reabriría el escáner y podría detectar la misma contratapa. Si el ISBN es desconocido, se muestra un aviso y `ultimoInvalido` descarta los cuadros siguientes con ese valor. Se puede presentar otro código o escribir el ISBN. [escanear.tsx, líneas 19–50](src/app/escanear.tsx#L19-L50)

### C3. Deep links y rutas protegidas

Verifiqué los equivalentes en Chrome. Queda por probar el historial nativo y el estado real de la cámara en Expo Go. Las URLs de Expo Go están en el [README](README.md#deep-links-de-prueba).

| Link | Qué muestra | Qué queda debajo, según la configuración | Código |
| --- | --- | --- | --- |
| `bibliotecaipf://libro/9780142437230` | Ficha de Don Quijote de la Mancha. | Catálogo dentro de su Stack. | [Ancla](src/app/%28tabs%29/%28catalogo%29/_layout.tsx#L5-L15) · [Detalle](src/app/%28tabs%29/%28catalogo%29/libro/%5Bisbn%5D.tsx#L14-L37) |
| `bibliotecaipf://libro/123` | «No encontramos ese libro» y Volver al Catálogo. | Catálogo. | [Validación](src/lib/catalogo.ts#L5-L7) · [Detalle](src/app/%28tabs%29/%28catalogo%29/libro/%5Bisbn%5D.tsx#L22-L30) |
| `bibliotecaipf://buscar?q=borges` | Consulta «borges» y Ficciones cuando responde la API. | `(tabs)` en el Stack raíz. | [Ancla raíz](src/app/_layout.tsx#L4-L7) · [Parámetro](src/app/buscar.tsx#L9-L12) |
| `bibliotecaipf://mostrador` sin sesión | Vuelve al Catálogo, desde donde está disponible Personal. | El navegador de pestañas queda activo. | [Guardas](src/components/NavegacionRaiz.tsx#L18-L23) |
| `bibliotecaipf://reserva` | Mis reservas. | Quedan las pestañas, con Catálogo accesible en la barra. | [Redirect](src/app/reserva.tsx#L3-L5) |
| `bibliotecaipf://escanear` con cámara bloqueada | Aviso de bloqueo, acceso a Ajustes e ingreso manual. En Chrome se verificó el ingreso manual. | `(tabs)` debajo del escáner. | [Ancla raíz](src/app/_layout.tsx#L4-L7) · [Escáner](src/app/escanear.tsx#L54-L85) |

`[isbn]` admite cualquier segmento en esa posición. El detalle se encarga de validar que tenga 13 dígitos y exista en el catálogo. `+not-found.tsx` se usa cuando el patrón de ninguna ruta coincide, por ejemplo `/ruta-inexistente`. [Validador](src/lib/catalogo.ts#L3-L8) · [404](src/app/+not-found.tsx)

### C4. Foco, montaje y primer plano

| Herramienta | Evento que detecta |
| --- | --- |
| `useEffect(..., [])` | Inicio de los efectos de la instancia, normalmente al montar. |
| `useFocusEffect` | Entrada al foco de navegación y salida con su limpieza. |
| `AppState` | Cambios de primer plano y segundo plano de toda la app. |

Al volver de Ajustes suele seguir enfocada la misma pantalla, de modo que el evento relevante es `AppState` con valor `active`. Al pasar a otra tab y volver dentro de la app, se vuelve a ejecutar `useFocusEffect`. Uso ambos en `usePermiso`. La suscripción dura mientras hay foco y el contador de consultas descarta lecturas viejas que puedan llegar después de una nueva. [usePermiso.ts, líneas 25–52](src/hooks/usePermiso.ts#L25-L52)

## Parte D · Permisos en la app

### D1. Recorrido completo de la cámara

Recorrido esperado en Android 14 con la app recién instalada. **Escanear** muestra el ingreso manual y el estado de la cámara. **Habilitar cámara** abre la previa. [Escáner, líneas 54–85](src/app/escanear.tsx#L54-L85) · [Permisos en Android](https://developer.android.com/training/permissions/requesting)

| Paso | Qué muestra la app | `status` esperado | `canAskAgain` esperado |
| --- | --- | --- | --- |
| 1. Toca Escanear | Indicador breve y luego Habilitar cámara. Al tocarlo se abre la previa con Continuar. | `undetermined` después de la consulta | `true` |
| 2. Continuar y primera denegación | Cierra la previa y vuelve al escáner con el ingreso manual. | `denied` | `true` |
| 3. Abre el escáner de nuevo | Habilitar cámara vuelve a abrir la previa con Continuar. | `denied` | `true` |
| 4. Continuar y segunda denegación | Cierra la previa y el escáner indica que la cámara está bloqueada. | `denied` | `false` |
| 5. Abre el escáner de nuevo | Ver ajustes de cámara abre la previa con Abrir Ajustes. | `denied` | `false` |
| 6. Habilita la cámara en Ajustes y vuelve | La previa se cierra y el escáner muestra el visor. | `granted` | `true` |

En iOS el cambio ocurre desde la primera denegación. El sistema recuerda esa decisión y la próxima visita muestra el estado bloqueado y permite abrir Ajustes desde la previa. El campo de ISBN sigue disponible. [Autorización de captura en iOS](https://developer.apple.com/documentation/avfoundation/requesting-authorization-to-capture-and-save-media)

~~~tsx
<Boton texto={abrirAjustes ? 'Abrir Ajustes' : 'Continuar'}
~~~

El estado `bloqueado` viene de `canAskAgain === false` cuando `granted` también es falso. Las dos denegaciones pueden compartir `status: 'denied'` mientras difieren en la posibilidad de volver a abrir el diálogo. [Botón de la previa](src/app/permisos/%5Brecurso%5D.tsx#L111) · [Clasificación](src/hooks/usePermiso.ts#L11-L14)

Al volver de Ajustes, `AppState` vuelve a leer el permiso. Si ahora está concedido, la previa detecta el cambio y se cierra. Sin esa relectura podría mantenerse **Abrir Ajustes** hasta salir y volver a enfocar la pantalla. [Listener](src/hooks/usePermiso.ts#L43-L51) · [Regreso de Ajustes](src/app/permisos/%5Brecurso%5D.tsx#L41-L52)

### D2. Notificaciones y consistencia

a) Si devolviera sin cancelar, podría llegar a los 15 segundos un aviso sobre un préstamo ya devuelto. Se cancela antes de eliminar el préstamo. Si cancelar falla, queda disponible para reintentar y se muestra un aviso. Mientras se procesa una operación para ese ISBN se deshabilitan los dos controles del préstamo. [BibliotecaContext.tsx, líneas 51–86](src/context/BibliotecaContext.tsx#L51-L86)

b) El identificador está en `prestamos[isbn].recordatorio`. El sistema puede conservar lo programado al cerrar el proceso, mientras el identificador en memoria se pierde al reiniciar la app. Persistiría los dos datos juntos, esperaría a leerlos antes de mostrar Mis reservas y reconciliaría los identificadores con el listado del sistema. [Tipo Prestamo](src/types/index.ts#L9-L13) · [Actualización del préstamo](src/context/BibliotecaContext.tsx#L66-L79)

c) En Android 13 en adelante existe `POST_NOTIFICATIONS` en tiempo de ejecución y Expo indica preparar el canal antes de pedir el permiso. En Android 12 no existe ese permiso en tiempo de ejecución. El canal sigue siendo necesario para definir cómo se muestra el aviso y se puede desactivar en Ajustes. [Orden en el código](src/lib/notificaciones.ts#L20-L46) · [Expo Notifications](https://docs.expo.dev/versions/v58.0.0/sdk/notifications/#permissions) · [Android](https://developer.android.com/develop/ui/compose/notifications/notification-permission)

d) Al entregar, `notificarEntrega` llama a `consultarNotificaciones()` en ese instante y devuelve `false` si el permiso no está concedido. Si devuelve `false` o falla, la app agrega el aviso al Context y lo muestra en Mis reservas. La consulta actual importa si la persona cambió el permiso en Ajustes durante la sesión. [Consulta y notificación](src/lib/notificaciones.ts#L64-L72) · [Aviso alternativo](src/context/BibliotecaContext.tsx#L99-L113) · [Avisos de entrega](src/app/%28tabs%29/reservas.tsx#L58-L62)

### D3. Lo que la app declara

| Plataforma | Permiso o clave | Uso | Quién lo agrega |
| --- | --- | --- | --- |
| Android | `CAMERA` | Lee la contratapa con cámara trasera. | Plugin y módulo `expo-camera`. |
| Android 13+ | `POST_NOTIFICATIONS` | Recordatorio de devolución y aviso de entrega. | Manifiesto de `expo-notifications`. |
| Android | `RECEIVE_BOOT_COMPLETED` | El módulo puede restaurar avisos programados al reiniciar el teléfono. | Manifiesto de `expo-notifications`. Permiso de instalación. |
| Android | `INTERNET` y `VIBRATE` | Comunicación con Metro durante el desarrollo y vibración según la configuración de notificaciones. | Manifiesto base de Expo. Permisos de instalación. |
| iOS | `NSCameraUsageDescription` | Explica para qué se abre la cámara. | Plugin `expo-camera` con la frase de `app.json`. |
| iOS | Autorización para avisos locales | Habilita los avisos que solicita la aplicación. | `requestPermissionsAsync` de `expo-notifications`. El sistema muestra su texto estándar. |

La configuración de cámara tiene `"microphonePermission": false` y `"recordAudioAndroid": false`. Además, `blockedPermissions` elimina `android.permission.RECORD_AUDIO` de la unión de manifiestos. Solo se necesitan imágenes en vivo para analizar el EAN-13. [app.json, líneas 14–34](app.json#L14-L34)

Para elegir una portada usaría `expo-image-picker` con `launchImageLibraryAsync` y solo imágenes. El selector del sistema concede acceso a la imagen elegida sin pedir acceso general a la galería. Se necesita una build nueva porque la versión instalada de la app todavía no incluye ese módulo nativo. Una OTA distribuye solo JavaScript y recursos que el binario instalado pueda usar. [Expo ImagePicker](https://docs.expo.dev/versions/v58.0.0/sdk/imagepicker/) · [Selector de fotos de Android](https://developer.android.com/privacy-and-security/minimize-permission-requests)

Expo Go usa su propio binario y configuración. Con una instalación de desarrollo propia verificaría la frase del diálogo de iOS, el manifiesto combinado de Android, el canal `prestamos` y el esquema `bibliotecaipf://`. Verifiqué la frase de cámara y las exclusiones del manifiesto con la configuración de Expo. El comportamiento del canal y de los diálogos queda pendiente en el teléfono.

## Parte E · Buenas prácticas y decisiones de diseño

### E1. Revisión de código

| Línea del ejemplo | Clasificación | Problema y corrección |
| --- | --- | --- |
| 10 | Mala práctica | `any[]` borra la forma del objeto. Con `Libro[]`, TypeScript detecta campos inexistentes. |
| 11–16 | Mala práctica | Pide cámara y notificaciones al montar. Pediría cada recurso después de su previa y a partir de una interacción relacionada. |
| 13–16 | Advertencia | El efecto captura `pedirPermiso` con dependencias vacías. Quitaría la petición del efecto y la movería al botón de la previa. |
| 15 | Error de ejecución | La promesa queda sin manejar si el módulo falla. Capturaría el error y mantendría disponibles los avisos dentro de la app. |
| 18–20 | Rendimiento | El efecto sin dependencias se ejecuta después de cada commit. Usaría un hook que dependa del contador de reintentos. |
| 19 | Error de ejecución | La API puede rechazar y dejar la promesa sin manejar. Mostraría error y Reintentar. |
| 18–20 | Mala práctica | Una respuesta puede llegar después de salir o reintentar. Invalidaría el pedido en la limpieza del efecto. |
| 22 | Rendimiento | Declarar `Fila` dentro del componente crea un tipo nuevo en cada render. La declararía a nivel de módulo en otro archivo. |
| 22 | Mala práctica | `libro: any` elimina la comprobación de props. Usaría `Libro`. |
| 24 | Mala práctica | La concatenación pierde la relación tipada entre ruta y parámetros. Pasaría un objeto con `pathname` y `params`. |
| 24–25 | Mala práctica | La fila interactiva no declara rol ni tamaño táctil suficiente. Pondría un botón accesible con una altura mínima de 44. |
| 25 | Mala práctica | El estilo en línea mezcla presentación y lógica. Usaría `StyleSheet.create` y el tema. |
| 33–36 | Rendimiento | `ScrollView` monta todas las filas. Usaría la virtualización de `FlatList`. |
| 35 | Mala práctica | La clave con el índice identifica la posición. Si se reordena la lista, React puede reutilizar la fila equivocada. Usaría el ISBN. |
| 33–39 | Mala práctica | Faltan estados de carga, error y vacío. Los mostraría en `ListEmptyComponent`. |
| 37–38 | Mala práctica | El botón de cámara tiene solo un ícono y carece de nombre accesible. Lo rotularía **Escanear**. |

Al montar se muestran la lista vacía y los diálogos de los permisos, y se inicia el pedido. Si a los 800 ms responde, publica un array nuevo. Eso vuelve a renderizar, vuelve a disparar el efecto y así se encadenan pedidos. La cadena continúa mientras haya éxitos. En cuanto hay un rechazo, se corta esa secuencia por la promesa sin manejar. Otro render puede iniciar más pedidos y superponerlos. Con la misma referencia de array, React omite actualizaciones de estado al comparar identidades con `Object.is`. Cualquier actualización ajena que cause un commit todavía ejecutaría el efecto sin dependencias.

La pantalla reescrita completa está en [index.tsx](src/app/%28tabs%29/%28catalogo%29/index.tsx). Usa `useLibros`, `EncabezadoCatalogo`, `FilaLibro`, `EstadoVista` y el tema. Este fragmento muestra cómo conecta la API, la lista y los estados.

~~~tsx
const { libros, cargando, error, reintentar } = useLibros();

<FlatList
  data={libros}
  keyExtractor={(libro) => libro.isbn}
  ListHeaderComponent={EncabezadoCatalogo}
  ListEmptyComponent={cargando
    ? <EstadoVista titulo="Cargando el catálogo…" cargando />
    : error
      ? <EstadoVista titulo={error} icono="cloud-offline-outline"
          boton={{ texto: 'Reintentar', accion: reintentar }} />
      : <EstadoVista titulo="Todavía no hay libros en el catálogo." />}
  renderItem={({ item }) => <FilaLibro libro={item} />}
/>
~~~

La versión del proyecto también calcula la disponibilidad de cada libro. Pedir recursos sensibles al ingresar al Catálogo podría provocar observaciones de revisión por falta de contexto. Para quien intenta consultar un libro, el fallo más frustrante sería que la red dé error y quede una pantalla vacía sin mensaje ni reintento.

### E2. Organización y acoplamiento

~~~text
app         → components, hooks, context, lib, data, types, constants
components  → context, types, constants
context     → lib, data, types, constants
hooks       → lib, types
lib         → estructuras, data, types
data        → types
estructuras → tipos genéricos propios
~~~

Ningún hook importa pantallas desde `src/app`. Si lo hiciera, dependería de quién lo usa y sería más difícil reutilizarlo o cambiar la navegación sin tocarlo.

Para cambiar solo las consultas de lista y búsqueda mantendría las firmas y reemplazaría [api.ts](src/lib/api.ts). Para que el catálogo remoto también alimente el escáner, el inventario y el mostrador, cambiaría [catalogo.ts](src/lib/catalogo.ts) y los consumidores que leen `LIBROS` directamente. Que intervengan más de dos archivos revela que abstraje las consultas, mientras el inventario todavía supone datos síncronos en memoria. Una fuente de catálogo compartida con una consulta por ISBN reduciría ese acoplamiento.

Un `<ConPermiso recurso="camara">` podría encapsular el visor con su carga y sus mensajes. Si también pidiera el permiso al montarse, complicaría la previa y el ingreso manual. En notificaciones, el interruptor debe identificar el préstamo y programar ese aviso específico. Prefiero que cada acción conserve su contexto, con la lógica de lectura y la previa reutilizadas. [Hook](src/hooks/usePermiso.ts) · [Previa](src/app/permisos/%5Brecurso%5D.tsx) · [Recordarme](src/app/%28tabs%29/reservas.tsx#L22-L37)

### E3. Mapa de fallas

| Situación | Qué ve o puede hacer | Dónde se maneja |
| --- | --- | --- |
| Falla `obtenerLibros()` | «No pudimos cargar el catálogo» y Reintentar. | [Captura del fallo](src/hooks/useLibros.ts#L19-L21) · [Catálogo](src/app/%28tabs%29/%28catalogo%29/index.tsx#L23-L27) |
| Abre `/libro/abc` | Aviso y Volver al Catálogo. | [Detalle](src/app/%28tabs%29/%28catalogo%29/libro/%5Bisbn%5D.tsx#L14-L30) |
| Escanea un ISBN desconocido | Aviso con el ISBN, visor disponible para otro código e ingreso manual. | [Escáner](src/app/escanear.tsx#L29-L43) |
| Cámara bloqueada | Ver ajustes de cámara e ingreso manual. | [Bloqueo](src/app/escanear.tsx#L61-L71) · [Ajustes](src/app/permisos/%5Brecurso%5D.tsx#L60-L64) |
| Notificaciones denegadas | Vencimientos y avisos de entrega en Mis reservas. | [Previa](src/app/permisos/%5Brecurso%5D.tsx#L65-L71) · [Mis reservas](src/app/%28tabs%29/reservas.tsx#L49-L62) |
| Reserva repetida | Botón deshabilitado en la ficha. Un enlace directo a la confirmación informa «Ya reservaste este libro». | [Confirmación](src/app/reservar/%5Bisbn%5D.tsx#L24-L43) · [Guarda de la operación](src/lib/biblioteca.ts#L51-L53) |
| Entrega con la lista vacía | La fila desaparece. Un toque antes de actualizar la pantalla devuelve el mensaje de que ya no queda nadie. | [Mostrador](src/app/mostrador.tsx#L10-L38) · [Context](src/context/BibliotecaContext.tsx#L99-L102) |
| Login con clave incorrecta | «Revisá el usuario y la clave» y puede volver a ingresar sus datos. | [Login](src/app/login.tsx#L13-L29) |

### E4. Decisiones con argumentos

a) Uso ISBN como parámetro y key porque el catálogo identifica ediciones y el escáner ya devuelve ese valor. Dos ediciones de un título pueden tener ISBN distintos. Trato el parámetro como texto y lo valido en tiempo de ejecución, incluso si `useLocalSearchParams` está tipado como `string` para esta ruta. Si hubiera libros sin ISBN, usaría un ID propio para fichas y claves y mantendría el ISBN como índice secundario. [Validación](src/lib/catalogo.ts#L3-L8) · [Key](src/app/%28tabs%29/%28catalogo%29/index.tsx#L19-L22)

b) La clase `Pila` encapsula el orden LIFO y sus datos privados. Un array más `slice` alcanzaría con menos código, mientras la clase hace explícito el tope y el punto de mutación. Al combinarla con React tengo que copiar a una instancia nueva y luego publicar el resultado. Cada ISBN aparece una sola vez entre los recientes. [Pila](src/estructuras/Pila.ts) · [Registrar visita](src/lib/biblioteca.ts#L44-L49) · [Tres del tope](src/components/EncabezadoCatalogo.tsx#L10-L12)

c) `useMemo` estabiliza las acciones, entre ellas `visitar`, que el detalle usa en su efecto de foco. Si cambiara en cada render, el efecto podría repetirse en la misma ficha. Memorizar el texto de disponibilidad de una fila agregaría dependencias por un cálculo trivial. Compararía los commits con el Profiler de React DevTools al navegar y activar un recordatorio. [Acciones y value](src/context/BibliotecaContext.tsx#L41-L125) · [Foco del detalle](src/app/%28tabs%29/%28catalogo%29/libro/%5Bisbn%5D.tsx#L14-L21)

d) Calculo `ejemplares + ajustesStock − préstamo activo`. Si guardara por separado el contador y los préstamos, quitar un préstamo sin actualizar el contador dejaría una ficha con disponibilidad vieja. Los ajustes de mostrador representan ejemplares que vuelven desde fuera del préstamo del lector o se entregan a otras personas. La función reúne todos los datos cuando se lee el stock. [Disponibilidad](src/lib/biblioteca.ts#L30-L32) · [Entrega](src/lib/biblioteca.ts#L62-L80)
