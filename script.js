// La misma secuencia del ejemplo de temperatura: fetch -> verificar -> JSON -> DOM.
// Cada sección tiene su propio estado; finally siempre vuelve a habilitar el botón.
function mostrarEstado(seccion, mensaje, error = false) {
    const estado = document.getElementById(`estado-${seccion}`);
    estado.textContent = mensaje;
    estado.classList.toggle('error', error);
}

async function consultarSeccion(seccion, url, mostrarDatos) {
    const boton = document.getElementById(`boton-${seccion}`);
    if (boton.disabled) return;
    boton.disabled = true;
    document.getElementById(seccion).setAttribute('aria-busy', 'true');
    mostrarEstado(seccion, 'Cargando…');
    const controlador = new AbortController();
    const limite = setTimeout(() => controlador.abort(), 15000);
    try {
        // no-store evita reutilizar la respuesta de una consulta anterior.
        const respuesta = await fetch(url, { cache: 'no-store', signal: controlador.signal });
        if (!respuesta.ok) {
            throw new Error(`La API respondió con HTTP ${respuesta.status}`);
        }
        const datos = await respuesta.json();
        await mostrarDatos(datos);
        mostrarEstado(seccion, 'Contenido actualizado.');
    } catch (error) {
        console.error(`Error en ${seccion}:`, error);
        mostrarEstado(seccion, 'No se pudo cargar el contenido. Revisa tu conexión y pulsa el botón para reintentar.', true);
    } finally {
        clearTimeout(limite);
        boton.disabled = false;
        document.getElementById(seccion).setAttribute('aria-busy', 'false');
    }
}

function validarTexto(valor) {
    if (typeof valor !== 'string' || !valor.trim()) {
        throw new Error('La API no devolvió el campo esperado.');
    }
    return valor;
}

// La descarga de la imagen también puede fallar aunque el JSON haya llegado bien.
function cargarImagen(idImagen, url) {
    const imagen = document.getElementById(idImagen);
    imagen.hidden = true;
    return new Promise((resolve, reject) => {
        const limite = setTimeout(() => terminar(new Error('La imagen tardó demasiado.')), 15000);
        function terminar(error) {
            clearTimeout(limite);
            imagen.onload = null;
            imagen.onerror = null;
            if (error) {
                imagen.removeAttribute('src');
                reject(error);
            } else {
                imagen.hidden = false;
                resolve();
            }
        }
        imagen.onload = () => terminar();
        imagen.onerror = () => terminar(new Error('No se pudo descargar la imagen.'));
        imagen.src = url;
    });
}

async function cargarCita() {
    await consultarSeccion('cita', 'https://dummyjson.com/quotes/random', (datos) => {
        const cita = validarTexto(datos.quote);
        const autor = validarTexto(datos.author);
        document.getElementById('textoCita').textContent = cita;
        document.getElementById('autorCita').textContent = `— ${autor}`;
    });
}

async function cargarPerro() {
    await consultarSeccion('perro', 'https://dog.ceo/api/breeds/image/random', async (datos) => {
        await cargarImagen('imagenPerro', validarTexto(datos.message));
    });
}

async function cargarGato() {
    await consultarSeccion('gato', 'https://cataas.com/cat?json=true', async (datos) => {
        // JSON inspeccionado: contiene id, url, tags, created_at y mimetype.
        const url = datos.url
            ? new URL(validarTexto(datos.url), 'https://cataas.com').href
            : `https://cataas.com/cat/${encodeURIComponent(validarTexto(datos.id))}`;
        await cargarImagen('imagenGato', url);
    });
}

async function cargarDato() {
    await consultarSeccion('dato', 'https://uselessfacts.jsph.pl/api/v2/facts/random?language=en', (datos) => {
        document.getElementById('textoDato').textContent = validarTexto(datos.text);
    });
}

// script defer permite acceder al HTML cuando ya se ha cargado.
document.getElementById('boton-cita').addEventListener('click', cargarCita);
document.getElementById('boton-perro').addEventListener('click', cargarPerro);
document.getElementById('boton-gato').addEventListener('click', cargarGato);
document.getElementById('boton-dato').addEventListener('click', cargarDato);
// Se inician por separado: una API lenta o caída no bloquea las demás.
cargarCita();
cargarPerro();
cargarGato();
cargarDato();
