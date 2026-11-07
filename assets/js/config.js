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

  version: '1.0',
  docenteNombre: 'Ing. Héctor Espinoza',
  carrera: 'Alimentos',
  institucion: 'ULEAM',
  aprobacion: 7,            // nota mínima para aprobar un tema (sobre 10)

  proximamente: ['Diseño Experimental', 'Gestión de la Calidad'],

  novedades: [
    { v: '1.0', fecha: 'noviembre de 2026', items: [
      'Lanzamiento de CIMA: todas las materias en una sola plataforma.',
      'Estadística: 9 temas de estadística descriptiva y probabilidad.',
      'Fundamentos de Métodos Numéricos: unidades 1 y 2 (8 temas).',
      'Niveles, insignias, rachas y certificados por materia.'
    ]}
  ]
};
