/* =====================================================================
   CIMA · Configuración
   1) Pega aquí la dirección (Project URL) y la clave pública
      (anon public key) de tu proyecto de Supabase.
      Mientras estén vacías, la plataforma funciona en modo demostración.
   2) Para publicar una versión nueva: cambia "version" y agrega una
      entrada al inicio de "novedades".
   ===================================================================== */
window.CIMA_CONFIG = {
  supabaseUrl: 'https://kxowpfkmimtwusbpsvov.supabase.co',
  supabaseKey: 'sb_publishable_-GOaNVGfDbtri33OVe4xLg_jf0jUsuU',

  version: '1.1.1',
  docenteNombre: 'Ing. Héctor Espinoza',
  carrera: 'Alimentos',
  institucion: 'ULEAM',
  aprobacion: 7,            // nota mínima para aprobar un tema (sobre 10)

  proximamente: [],

  novedades: [
    { v: '1.1.1', fecha: 'noviembre de 2026', items: [
      'Modo práctica para el docente: botón Practicar para ver y usar CIMA como estudiante sin salir de la cuenta.'
    ]},
    { v: '1.1', fecha: 'noviembre de 2026', items: [
      'Nueva materia: Diseño Experimental (7 temas) con DCA, DBCA y factoriales 2² y 2³, salida estilo SPSS y datos descargables.',
      'Nueva materia: Gestión de la Calidad (8 temas) con Ishikawa, Pareto y dispersión interactivos, gráficos de control, capacidad, muestreo y HACCP.',
      'Estadística: unidades 3 y 4 (8 temas): intervalos, hipótesis, pruebas t, correlación, regresión, chi-cuadrado y ANOVA, con Excel y JASP.',
      'Fundamentos de Métodos Numéricos: unidades 3 y 4 (7 temas): funciones, sistemas y matrices.',
      'Laboratorios por pestañas: cuándo usar cada análisis, organizar datos, paso a paso, leer la salida e interpretar.',
      'Modo proyector y hojas de ejercicios imprimibles con solucionario para el docente.'
    ]},
    { v: '1.0.1', fecha: 'noviembre de 2026', items: [
      'Logros: cada nivel muestra la altura y un dato curioso de su montaña.',
      'Aviso especial al subir de nivel.'
    ]},
    { v: '1.0', fecha: 'noviembre de 2026', items: [
      'Lanzamiento de CIMA: todas las materias en una sola plataforma.',
      'Estadística: 9 temas de estadística descriptiva y probabilidad.',
      'Fundamentos de Métodos Numéricos: unidades 1 y 2 (8 temas).',
      'Niveles, insignias, rachas y certificados por materia.'
    ]}
  ]
};
