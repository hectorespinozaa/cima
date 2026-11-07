# CIMA · Calidad · Industria · Matemática · Alimentos

Plataforma de práctica con simuladores para la carrera de Alimentos.
Desarrollada por **Ing. Héctor Espinoza**.

## Estructura

| Carpeta / archivo | Qué contiene |
|---|---|
| `index.html` | Página única de la plataforma |
| `assets/js/config.js` | **Lo único que editas a mano**: datos de Supabase, versión y novedades |
| `assets/js/app.js` | Portal, ingreso, seguimiento de tiempo, pruebas, niveles, insignias y certificados |
| `assets/js/docente.js` | Dashboard docente |
| `assets/js/data.js` | Conexión con la base de datos (y modo demostración) |
| `assets/js/lib.js` | Utilidades de cálculo y gráficos compartidas |
| `materias/*.js` | Un archivo por materia con sus simuladores y preguntas |
| `assets/css/cima.css` | Estilos |
| `assets/img/` | Logo, ícono y sello |
| `supabase/schema.sql` | Base de datos: se ejecuta una sola vez en Supabase |

## Agregar o cambiar contenido

Cada materia vive en su archivo dentro de `materias/`. Para sumar una materia nueva se crea otro archivo
y se agrega una línea `<script src="materias/nueva.js"></script>` en `index.html`.
Los identificadores de los temas (`id`) no deben cambiar una vez publicados, porque las notas de los
estudiantes quedan asociadas a ellos.

Después de agregar temas, entra una vez al dashboard docente: así la base de datos actualiza el
catálogo que se usa para emitir certificados.
