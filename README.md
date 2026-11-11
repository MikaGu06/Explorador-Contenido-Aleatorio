# Explorador de contenido aleatorio

Materia: Programación Web III — Conexión API


- Mikaela Gutierrez Urquiza.

## Respuestas de reflexión

### 1. ¿Qué es un endpoint y cuál utilizaste para cada API?

Un endpoint es una dirección de un servicio a la que enviamos una solicitud para obtener o modificar recursos. En este trabajo todos utilizan el método GET:

| API | Endpoint | Campos utilizados |
| --- | --- | --- |
| DummyJSON | https://dummyjson.com/quotes/random | `quote` y `author` |
| Dog CEO | https://dog.ceo/api/breeds/image/random | `message` |
| CATAAS | https://cataas.com/cat?json=true | `url`, o `id` si no hay URL |
| Useless Facts | https://uselessfacts.jsph.pl/api/v2/facts/random?language=en | `text` |

Antes de implementar CATAAS se inspeccionó su respuesta JSON: contiene `id`, `tags`, `created_at`, `url` y `mimetype`. Se utiliza `url`; si falta, se construye `https://cataas.com/cat/{id}` con el identificador recibido. No hay URLs fijas de fotos ni contenido escrito manualmente para simular respuestas.

### 2. ¿Qué diferencia existe entre recibir JSON y recibir directamente una imagen?

JSON es texto estructurado con campos y valores; JavaScript puede convertirlo en un objeto y acceder a propiedades como `datos.quote`. Una imagen contiene los datos del archivo gráfico y se muestra, por ejemplo, asignando su dirección al atributo `src` de un elemento `img`. No se debe intentar interpretar una imagen con `response.json()`. Por eso se consulta CATAAS con `?json=true` y después se carga la URL de la foto.

### 3. ¿Qué función cumplen await y response.json()?

`await` pausa la ejecución de la función asíncrona hasta que se resuelva una promesa, sin bloquear toda la página. `response.json()` lee el cuerpo de la respuesta y lo interpreta como JSON; también devuelve una promesa. Con `const datos = await respuesta.json()` obtenemos el objeto para acceder a sus campos.

### 4. ¿Por qué se debe verificar response.ok además de utilizar try/catch?

`fetch` normalmente no rechaza su promesa ante errores HTTP como 404 o 500: entrega una respuesta. `response.ok` indica si el estado está entre 200 y 299. Cuando es falso, lanzamos un error con `throw`, que captura `catch`. El bloque también captura fallos de red, JSON inválido y errores de imágenes. `finally` vuelve a habilitar el botón, tanto si hubo éxito como si ocurrió un error.

### 5. ¿Cómo lograste actualizar una sección sin recargar toda la página?

Cada botón tiene un listener que llama solamente a su función. La función consulta la API con `fetch` y cambia los elementos de su tarjeta usando `textContent` o `src`. No se navega a otra página ni se envía un formulario. Las cuatro funciones se inician de manera independiente al abrir la página, así que el fallo de una no impide trabajar a las otras.
