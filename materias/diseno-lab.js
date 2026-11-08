/* =====================================================================
   CIMA · DISEÑO EXPERIMENTAL · Laboratorio de análisis (motor compartido)
   Casos de alimentos, análisis (DCA, DBCA, 2², 2³), salida estilo SPSS y
   las 6 pestañas: Cuándo · Organiza · Analiza · Salida · Interpreta · Datos.
   ===================================================================== */
window.DLAB=(function(){
"use strict";
const ALPHA=0.05;
/* número estilo SPSS en español: ,003  12,450  -,250 */
function sp(x,d=3){if(!Number.isFinite(x))return'';let s=Math.abs(x).toFixed(d).replace('.',',');if(s.startsWith('0,'))s=s.slice(1);const z=+Math.abs(x).toFixed(d)===0;return(x<0&&!z?'-':'')+s;}
const spP=p=>sp(p,3);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const DN={dca:'DCA',dbca:'DBCA',f2:'Factorial 2²',f3:'Factorial 2³'};
const DLONG={dca:'Diseño completamente al azar (DCA)',dbca:'Diseño en bloques completos al azar (DBCA)',f2:'Diseño factorial 2²',f3:'Diseño factorial 2³'};

/* ---------------- Banco de casos ---------------- */
const B_DCA=[
 {ctx:'Una quesera artesanal compara <b>3 tipos de cuajo</b> en la elaboración de queso fresco. Cada tipo se asigna al azar a 5 moldes de la misma leche y se mide la <b>firmeza</b>.',fac:{n:'Tipo de cuajo',var:'cuajo',lv:['Animal','Microbiano','Vegetal']},resp:{n:'Firmeza',u:'N',var:'firmeza',dec:1,goal:'max'},n:5,mu:14,sd:0.9,eff:2.2},
 {ctx:'Se prueban <b>4 enzimas pectinolíticas</b> para extraer pulpa de maracuyá. Cada enzima se aplica al azar a 4 lotes de fruta homogénea y se registra el <b>rendimiento</b>.',fac:{n:'Enzima',var:'enzima',lv:['E1','E2','E3','E4']},resp:{n:'Rendimiento',u:'%',var:'rendimiento',dec:1,goal:'max'},n:4,mu:62,sd:1.6,eff:3.5},
 {ctx:'Se evalúan <b>3 edulcorantes</b> en una mermelada de guayaba light. Cada formulación se prepara 6 veces en orden aleatorio y un panel entrenado califica el <b>sabor</b> (puntaje medio).',fac:{n:'Edulcorante',var:'edulcorante',lv:['Stevia','Sucralosa','Eritritol']},resp:{n:'Puntaje de sabor',u:'puntos',var:'sabor',dec:2,goal:'max'},n:6,mu:6.5,sd:0.45,eff:0.8},
 {ctx:'Se comparan <b>4 recubrimientos comestibles</b> en mango Tommy almacenado 10 días. Cada recubrimiento se aplica al azar a 4 cajas y se mide la <b>pérdida de peso</b>.',fac:{n:'Recubrimiento',var:'recub',lv:['Sin recubrir','Quitosano','Almidón','Cera']},resp:{n:'Pérdida de peso',u:'%',var:'perdida',dec:2,goal:'min'},n:4,mu:8,sd:0.6,eff:1.6},
 {ctx:'Una panificadora prueba <b>3 conservantes</b> en pan de molde. Cada conservante se asigna al azar a 5 tandas y se registra la <b>vida útil</b> hasta la aparición de moho.',fac:{n:'Conservante',var:'conservante',lv:['Propionato','Sorbato','Vinagre']},resp:{n:'Vida útil',u:'días',var:'vidautil',dec:1,goal:'max'},n:5,mu:9,sd:0.8,eff:1.8},
];
const B_DBCA=[
 {ctx:'Se comparan <b>3 estabilizantes</b> en yogur batido. Cada lote de leche alcanza solo para 3 envases, así que se usan <b>4 lotes</b> como bloques y en cada lote se prueban los 3 estabilizantes. Se mide la <b>viscosidad</b>.',fac:{n:'Estabilizante',var:'estab',lv:['Gelatina','Pectina','Almidón']},blk:{n:'Lote de leche',var:'lote',lv:['Lote 1','Lote 2','Lote 3','Lote 4']},resp:{n:'Viscosidad',u:'cP',var:'viscosidad',dec:0,goal:'max'},mu:1850,sd:40,eff:90,beff:120},
 {ctx:'Una atunera compara <b>4 métodos de fileteado</b>. Como cada operario trabaja distinto, los <b>5 operarios</b> son bloques y cada uno aplica los 4 métodos en orden aleatorio. Se mide el <b>rendimiento</b> de lomo.',fac:{n:'Método',var:'metodo',lv:['M1','M2','M3','M4']},blk:{n:'Operario',var:'operario',lv:['Op. 1','Op. 2','Op. 3','Op. 4','Op. 5']},resp:{n:'Rendimiento',u:'%',var:'rendimiento',dec:1,goal:'max'},mu:48,sd:0.9,eff:2,beff:2.5},
 {ctx:'Se prueban <b>3 cultivos iniciadores</b> en la fermentación de cacao. El cacao de cada finca es distinto, así que <b>4 fincas</b> son bloques y en cada una se prueban los 3 cultivos. Se mide la <b>acidez</b> final.',fac:{n:'Cultivo',var:'cultivo',lv:['Natural','Levadura','Mixto']},blk:{n:'Finca',var:'finca',lv:['Finca A','Finca B','Finca C','Finca D']},resp:{n:'Acidez',u:'%',var:'acidez',dec:2,goal:'min'},mu:1.4,sd:0.06,eff:0.15,beff:0.18},
 {ctx:'Se comparan <b>3 secadores</b> para camarón. Los <b>4 días de producción</b> traen camarón de distinto tamaño, por eso cada día es un bloque y en él se usan los 3 secadores. Se mide el <b>tiempo de secado</b>.',fac:{n:'Secador',var:'secador',lv:['Bandejas','Túnel','Solar']},blk:{n:'Día',var:'dia',lv:['Día 1','Día 2','Día 3','Día 4']},resp:{n:'Tiempo de secado',u:'h',var:'tiempo',dec:1,goal:'min'},mu:7,sd:0.3,eff:0.8,beff:0.8},
];
const B_F2=[
 {ctx:'En la pasteurización de jugo de naranja se estudian la <b>temperatura</b> y el <b>tiempo</b> de retención, cada uno en dos niveles, con 3 repeticiones por combinación. Se mide la <b>reducción microbiana</b>.',fac:[{n:'Temperatura',var:'temp',lv:['72 °C','80 °C']},{n:'Tiempo',var:'tiempo',lv:['15 s','30 s']}],resp:{n:'Reducción microbiana',u:'log UFC/mL',var:'reduccion',dec:2,goal:'max'},r:3,mu:4.5,sd:0.18},
 {ctx:'En el horneado de galletas integrales se estudian la <b>temperatura</b> del horno y el <b>tiempo</b> de horneado, en dos niveles cada uno, con 3 repeticiones. Se mide la <b>humedad final</b>.',fac:[{n:'Temperatura',var:'temp',lv:['160 °C','180 °C']},{n:'Tiempo',var:'tiempo',lv:['10 min','14 min']}],resp:{n:'Humedad final',u:'%',var:'humedad',dec:2,goal:'min'},r:3,mu:5.2,sd:0.15},
 {ctx:'En la deshidratación de piña se estudian la <b>temperatura</b> del aire y el <b>espesor</b> de las rodajas, en dos niveles, con 4 repeticiones. Se mide el <b>contenido de vitamina C</b> retenido.',fac:[{n:'Temperatura',var:'temp',lv:['50 °C','65 °C']},{n:'Espesor',var:'espesor',lv:['3 mm','6 mm']}],resp:{n:'Vitamina C retenida',u:'mg/100 g',var:'vitc',dec:1,goal:'max'},r:4,mu:28,sd:1},
 {ctx:'En la elaboración de yogur se estudian el <b>porcentaje de cultivo</b> y la <b>temperatura de incubación</b>, en dos niveles, con 3 repeticiones. Se mide la <b>acidez titulable</b> a las 4 h.',fac:[{n:'Cultivo',var:'cultivo',lv:['1 %','2 %']},{n:'Incubación',var:'incub',lv:['40 °C','44 °C']}],resp:{n:'Acidez titulable',u:'% ác. láctico',var:'acidez',dec:3,goal:'max'},r:3,mu:0.75,sd:0.02},
];
const B_F3=[
 {ctx:'Para clarificar jugo de manzana se estudian la <b>dosis de enzima</b>, la <b>temperatura</b> y el <b>tiempo</b> de tratamiento, en dos niveles cada uno, con 2 repeticiones. Se mide la <b>turbidez</b>.',fac:[{n:'Enzima',var:'enzima',lv:['0,05 %','0,10 %']},{n:'Temperatura',var:'temp',lv:['40 °C','50 °C']},{n:'Tiempo',var:'tiempo',lv:['30 min','60 min']}],resp:{n:'Turbidez',u:'NTU',var:'turbidez',dec:1,goal:'min'},r:2,mu:45,sd:1.5},
 {ctx:'En un encurtido de vegetales se estudian la <b>sal</b>, el <b>vinagre</b> y los <b>días de maduración</b>, en dos niveles, con 2 repeticiones. Un panel califica la <b>aceptabilidad</b>.',fac:[{n:'Sal',var:'sal',lv:['2 %','4 %']},{n:'Vinagre',var:'vinagre',lv:['3 %','5 %']},{n:'Maduración',var:'dias',lv:['5 días','10 días']}],resp:{n:'Aceptabilidad',u:'puntos',var:'aceptab',dec:2,goal:'max'},r:2,mu:6.4,sd:0.2},
 {ctx:'En el freído de chifles se estudian la <b>temperatura</b> del aceite, el <b>tiempo</b> de fritura y el <b>espesor</b> de la lámina, en dos niveles, con 2 repeticiones. Se mide el <b>contenido de aceite</b> absorbido.',fac:[{n:'Temperatura',var:'temp',lv:['160 °C','180 °C']},{n:'Tiempo',var:'tiempo',lv:['2 min','4 min']},{n:'Espesor',var:'espesor',lv:['1 mm','2 mm']}],resp:{n:'Contenido de aceite',u:'%',var:'aceite',dec:2,goal:'min'},r:2,mu:30,sd:0.7},
];
/* ---- Más casos (v1.1): variedad ---- */
B_DCA.push(
 {ctx:'Se comparan <b>4 variedades de mango</b> para elaborar néctar. Cada variedad se procesa 5 veces en orden aleatorio y se miden los <b>sólidos solubles</b>.',fac:{n:'Variedad',var:'variedad',lv:['Tommy','Kent','Ataulfo','Criollo']},resp:{n:'Sólidos solubles',u:'°Brix',var:'brix',dec:1,goal:'max'},n:5,mu:14,sd:0.6,eff:1.3},
 {ctx:'Una quesera mide el <b>rendimiento</b> de queso fresco elaborado con <b>3 tipos de leche</b>, con 6 tinas por tipo asignadas al azar.',fac:{n:'Tipo de leche',var:'leche',lv:['Vaca','Cabra','Mezcla']},resp:{n:'Rendimiento',u:'kg/100 L',var:'rendqueso',dec:2,goal:'max'},n:6,mu:13,sd:0.5,eff:1.1},
 {ctx:'Se evalúa el <b>color L*</b> de camarón cocido con <b>3 tiempos de cocción</b>; cada tiempo se aplica a 5 lotes iguales de camarón.',fac:{n:'Tiempo de cocción',var:'tcoccion',lv:['2 min','3 min','4 min']},resp:{n:'Luminosidad L*',u:'unidades',var:'color',dec:1,goal:'max'},n:5,mu:58,sd:1.4,eff:3},
 {ctx:'Se prueban <b>4 cultivos iniciadores</b> en chorizo fermentado, con 4 tandas por cultivo, y se mide el <b>pH</b> a las 48 h.',fac:{n:'Cultivo',var:'cultivo',lv:['C1','C2','C3','C4']},resp:{n:'pH',u:'unidades',var:'ph',dec:2,goal:'min'},n:4,mu:5.2,sd:0.08,eff:0.2},
 {ctx:'Se elaboran fideos con <b>3 tipos de harina</b> (6 lotes por harina, al azar) y se mide la <b>absorción de agua</b> al cocinarlos.',fac:{n:'Harina',var:'harina',lv:['Trigo duro','Trigo común','Trigo-quinua']},resp:{n:'Absorción de agua',u:'%',var:'absorcion',dec:1,goal:'min'},n:6,mu:150,sd:4,eff:9},
 {ctx:'Una galletera compara <b>4 grasas</b> en su masa. Cada grasa se usa en 4 tandas al azar y se mide la <b>dureza</b> de la galleta.',fac:{n:'Grasa',var:'grasa',lv:['Manteca','Margarina','Palma','Coco']},resp:{n:'Dureza',u:'N',var:'dureza',dec:1,goal:'min'},n:4,mu:42,sd:2,eff:4.5},
 {ctx:'Se comparan <b>3 sanitizantes</b> en la superficie de corte de queso, con 5 tablas por sanitizante, y se cuentan los <b>mohos y levaduras</b> (log UFC/cm²).',fac:{n:'Sanitizante',var:'sanit',lv:['Cloro','Ácido peracético','Amonio cuaternario']},resp:{n:'Mohos y levaduras',u:'log UFC/cm²',var:'mohos',dec:2,goal:'min'},n:5,mu:2.4,sd:0.2,eff:0.45},
 {ctx:'Se prepara una bebida de cacao con <b>4 porcentajes de cacao</b>; cada fórmula se prepara 6 veces y un panel califica la <b>aceptabilidad</b>.',fac:{n:'Cacao',var:'cacao',lv:['20 %','30 %','40 %','50 %']},resp:{n:'Aceptabilidad',u:'puntos',var:'aceptab',dec:2,goal:'max'},n:6,mu:6.2,sd:0.4,eff:0.7},
 {ctx:'Una atunera prueba <b>3 líquidos de cobertura</b> en lata, con 5 latas por líquido, y mide el <b>peso drenado</b>.',fac:{n:'Líquido de cobertura',var:'liquido',lv:['Aceite','Agua','Salsa']},resp:{n:'Peso drenado',u:'g',var:'drenado',dec:1,goal:'max'},n:5,mu:112,sd:1.8,eff:3.5},
 {ctx:'Se comparan <b>3 métodos de pasteurización</b> en jugo de naranjilla (5 lotes cada uno) midiendo la <b>vitamina C</b> retenida.',fac:{n:'Pasteurización',var:'pasteur',lv:['Lenta (LTLT)','Rápida (HTST)','Ohmica']},resp:{n:'Vitamina C',u:'mg/100 mL',var:'vitc',dec:1,goal:'max'},n:5,mu:30,sd:1.3,eff:2.8}
);
B_DBCA.push(
 {ctx:'Se comparan <b>4 marinadas</b> en pechuga de pollo. Como cada lote de aves es distinto, se usan <b>4 lotes</b> como bloques y en cada uno se prueban las 4 marinadas. Se mide la <b>terneza</b> (fuerza de corte).',fac:{n:'Marinada',var:'marinada',lv:['Salmuera','Fosfato','Cítrica','Testigo']},blk:{n:'Lote de aves',var:'lote',lv:['Lote 1','Lote 2','Lote 3','Lote 4','Lote 5']},resp:{n:'Fuerza de corte',u:'N',var:'corte',dec:1,goal:'min'},mu:32,sd:1.2,eff:3,beff:2.5},
 {ctx:'Se prueban <b>3 empaques</b> para plátano verde de exportación. El fruto de cada finca madura distinto, así que las <b>fincas</b> son bloques. Se mide la <b>pérdida de peso</b> a los 14 días.',fac:{n:'Empaque',var:'empaque',lv:['Polietileno','Atmósfera modificada','Sin empaque']},blk:{n:'Finca',var:'finca',lv:['Finca 1','Finca 2','Finca 3','Finca 4','Finca 5']},resp:{n:'Pérdida de peso',u:'%',var:'perdida',dec:2,goal:'min'},mu:4,sd:0.2,eff:0.6,beff:0.4},
 {ctx:'Se comparan <b>4 perfiles de tostado</b> de café. Cada <b>lote de grano</b> alcanza para los 4 perfiles, por eso los lotes son bloques. Un panel califica la <b>taza</b> (puntaje SCA).',fac:{n:'Tostado',var:'tostado',lv:['Claro','Medio','Medio-oscuro','Oscuro']},blk:{n:'Lote de grano',var:'lote',lv:['Lote A','Lote B','Lote C','Lote D']},resp:{n:'Puntaje de taza',u:'puntos',var:'taza',dec:2,goal:'max'},mu:82,sd:0.5,eff:1.3,beff:1.2},
 {ctx:'Se evalúan <b>3 formulaciones de mortadela</b>. Cada <b>panelista</b> califica con su propio criterio, así que los 6 panelistas son bloques y cada uno prueba las 3. Se mide el <b>sabor</b>.',fac:{n:'Formulación',var:'formula',lv:['F1','F2','F3']},blk:{n:'Panelista',var:'panelista',lv:['P1','P2','P3','P4','P5','P6']},resp:{n:'Sabor',u:'puntos',var:'sabor',dec:1,goal:'max'},mu:6.5,sd:0.35,eff:0.7,beff:0.8},
 {ctx:'Se comparan <b>3 detergentes</b> para la limpieza CIP. Cada <b>línea de llenado</b> se ensucia distinto, por eso las 4 líneas son bloques. Se mide la <b>proteína residual</b> en superficie.',fac:{n:'Detergente',var:'deterg',lv:['Alcalino','Enzimático','Ácido']},blk:{n:'Línea',var:'linea',lv:['Línea 1','Línea 2','Línea 3','Línea 4']},resp:{n:'Proteína residual',u:'µg/cm²',var:'proteina',dec:2,goal:'min'},mu:3,sd:0.15,eff:0.4,beff:0.35},
 {ctx:'Una panadería prueba <b>3 levaduras</b>. Como la temperatura del local cambia de un <b>día</b> a otro, cada día es un bloque y en él se hornean las 3. Se mide el <b>volumen</b> del pan.',fac:{n:'Levadura',var:'levadura',lv:['Fresca','Seca activa','Instantánea']},blk:{n:'Día',var:'dia',lv:['Lunes','Martes','Miércoles','Jueves','Viernes']},resp:{n:'Volumen',u:'cm³',var:'volumen',dec:0,goal:'max'},mu:1450,sd:25,eff:55,beff:45}
);
B_F2.push(
 {ctx:'En el escaldado de brócoli se estudian la <b>temperatura</b> y el <b>tiempo</b>, en dos niveles, con 3 repeticiones. Se mide la <b>retención de clorofila</b>.',fac:[{n:'Temperatura',var:'temp',lv:['85 °C','95 °C']},{n:'Tiempo',var:'tiempo',lv:['1 min','3 min']}],resp:{n:'Retención de clorofila',u:'%',var:'clorofila',dec:1,goal:'max'},r:3,mu:78,sd:1.2},
 {ctx:'En una mermelada de mora se estudian la <b>pectina</b> y el <b>azúcar</b>, en dos niveles, con 3 repeticiones. Se mide la <b>firmeza del gel</b>.',fac:[{n:'Pectina',var:'pectina',lv:['0,5 %','1,0 %']},{n:'Azúcar',var:'azucar',lv:['60 %','65 %']}],resp:{n:'Firmeza del gel',u:'g',var:'firmeza',dec:1,goal:'max'},r:3,mu:120,sd:3},
 {ctx:'En salchichas se estudian el <b>fosfato</b> y el <b>almidón</b> agregados, en dos niveles, con 4 repeticiones. Se mide la <b>pérdida por cocción</b>.',fac:[{n:'Fosfato',var:'fosfato',lv:['0,2 %','0,4 %']},{n:'Almidón',var:'almidon',lv:['2 %','4 %']}],resp:{n:'Pérdida por cocción',u:'%',var:'perdida',dec:2,goal:'min'},r:4,mu:6,sd:0.25},
 {ctx:'En café filtrado se estudian el <b>grado de tostado</b> y la <b>molienda</b>, en dos niveles, con 3 repeticiones. Se miden los <b>sólidos extraídos</b>.',fac:[{n:'Tostado',var:'tostado',lv:['Medio','Oscuro']},{n:'Molienda',var:'molienda',lv:['Gruesa','Fina']}],resp:{n:'Sólidos extraídos',u:'%',var:'extraccion',dec:2,goal:'max'},r:3,mu:19,sd:0.35},
 {ctx:'En pan de molde se estudian la <b>levadura</b> y el <b>tiempo de fermentación</b>, en dos niveles, con 3 repeticiones. Se mide el <b>volumen específico</b>.',fac:[{n:'Levadura',var:'levadura',lv:['1 %','2 %']},{n:'Fermentación',var:'ferm',lv:['60 min','90 min']}],resp:{n:'Volumen específico',u:'cm³/g',var:'volesp',dec:2,goal:'max'},r:3,mu:4.2,sd:0.1},
 {ctx:'En un helado se estudian el <b>estabilizante</b> y el <b>contenido de grasa</b>, en dos niveles, con 3 repeticiones. Se mide el <b>overrun</b> (aire incorporado).',fac:[{n:'Estabilizante',var:'estab',lv:['0,2 %','0,4 %']},{n:'Grasa',var:'grasa',lv:['8 %','12 %']}],resp:{n:'Overrun',u:'%',var:'overrun',dec:1,goal:'max'},r:3,mu:70,sd:2}
);
B_F3.push(
 {ctx:'En un néctar de mango se estudian la <b>pulpa</b>, el <b>azúcar</b> y el <b>CMC</b>, en dos niveles, con 2 repeticiones. Se mide la <b>viscosidad</b>.',fac:[{n:'Pulpa',var:'pulpa',lv:['20 %','30 %']},{n:'Azúcar',var:'azucar',lv:['8 °Brix','12 °Brix']},{n:'CMC',var:'cmc',lv:['0,1 %','0,2 %']}],resp:{n:'Viscosidad',u:'cP',var:'viscosidad',dec:0,goal:'max'},r:2,mu:180,sd:5},
 {ctx:'En yogur batido se estudian el <b>cultivo</b>, la <b>temperatura</b> de incubación y los <b>sólidos lácteos</b>, en dos niveles, con 2 repeticiones. Se mide la <b>sinéresis</b> (suero liberado).',fac:[{n:'Cultivo',var:'cultivo',lv:['1 %','2 %']},{n:'Temperatura',var:'temp',lv:['40 °C','44 °C']},{n:'Sólidos',var:'solidos',lv:['12 %','15 %']}],resp:{n:'Sinéresis',u:'%',var:'sineresis',dec:1,goal:'min'},r:2,mu:22,sd:0.8},
 {ctx:'En hamburguesas se estudian la <b>grasa</b>, la <b>sal</b> y la <b>proteína de soya</b>, en dos niveles, con 2 repeticiones. Se mide la <b>pérdida por cocción</b>.',fac:[{n:'Grasa',var:'grasa',lv:['15 %','25 %']},{n:'Sal',var:'sal',lv:['1 %','2 %']},{n:'Soya',var:'soya',lv:['0 %','5 %']}],resp:{n:'Pérdida por cocción',u:'%',var:'perdida',dec:1,goal:'min'},r:2,mu:28,sd:0.8},
 {ctx:'En el salado de pescado se estudian la <b>sal</b> de la salmuera, el <b>tiempo</b> y la <b>temperatura</b>, en dos niveles, con 2 repeticiones. Se mide la <b>dureza</b> del filete.',fac:[{n:'Sal',var:'sal',lv:['10 %','20 %']},{n:'Tiempo',var:'tiempo',lv:['1 h','3 h']},{n:'Temperatura',var:'temp',lv:['5 °C','15 °C']}],resp:{n:'Dureza',u:'N',var:'dureza',dec:1,goal:'max'},r:2,mu:24,sd:0.7}
);
const MINI_EXTRA=[
 ['dca','Se compara la vida útil de un queso con 4 tipos de empaque, usando quesos del mismo lote asignados al azar a cada empaque.'],
 ['dca','Se miden los grados Brix de jugo de caña extraído con 3 tipos de molino, con 5 corridas por molino en orden aleatorio.'],
 ['dbca','Se prueban 3 conservantes en salsa de tomate; cada día de producción se elaboran las 3 versiones, durante 5 días.'],
 ['dbca','4 operarios aplican 3 métodos de deshuesado de pollo; se sabe que cada operario tiene su propia habilidad.'],
 ['dbca','Se comparan 4 fertilizantes en cacao; el terreno tiene zonas de distinta fertilidad, así que en cada zona se prueban los 4.'],
 ['f2','Se estudian la temperatura de fritura (160 y 180 °C) y el tiempo (3 y 5 min) sobre el color de papas fritas.'],
 ['f2','Se prueban dos dosis de enzima (baja y alta) y dos tiempos de maceración (1 y 2 h) en el rendimiento de jugo de piña.'],
 ['f3','En la elaboración de queso se estudian la dosis de cuajo, la temperatura de coagulación y el tamaño de corte, cada uno en dos niveles.'],
 ['f3','En una bebida isotónica se estudian el sodio, el potasio y el azúcar, cada uno en dos niveles, sobre la aceptabilidad.'],
];

const LAST={};function pickNew(key,arr){let i;do{i=Math.floor(Math.random()*arr.length);}while(arr.length>1&&i===LAST[key]);LAST[key]=i;return arr[i];}
const gauss=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};

/* ---------------- Generadores ---------------- */
function genDCA(){const b=pickNew('dca',B_DCA),k=b.fac.lv.length;b.n=clamp(b.n0=(b.n0||b.n),3,8);const nn=clamp(b.n0+rint(-1,1),3,7),sig=Math.random()<0.75;
  const eff=shuffle(Array.from({length:k},(_,i)=>(i-(k-1)/2)*b.eff*(sig?rnd(0.7,1.3):rnd(0,0.15))));const rows=[];
  for(let i=0;i<k;i++)for(let r=0;r<nn;r++)rows.push({f:[i],b:null,y:round(b.mu+eff[i]+gauss()*b.sd,b.resp.dec)});
  return{design:'dca',ctx:b.ctx.replace(/\b\d+ (moldes|lotes|veces|cajas|tandas|tinas|latas|tablas)/,(m,w)=>nn+' '+w).replace(/con \d+ (tandas|tinas|latas|tablas|lotes)/,(m,w)=>'con '+nn+' '+w),resp:b.resp,fac:[{...b.fac,codes:b.fac.lv.map((_,i)=>i+1)}],blk:null,rows,r:nn};}
function genDBCA(){const b0=pickNew('dbca',B_DBCA),nb=rint(Math.min(4,b0.blk.lv.length),b0.blk.lv.length),b={...b0,blk:{...b0.blk,lv:b0.blk.lv.slice(0,nb)}},t=b.fac.lv.length,sig=Math.random()<0.75,bsig=Math.random()<0.7;
  const te=shuffle(Array.from({length:t},(_,i)=>(i-(t-1)/2)*b.eff*(sig?rnd(0.7,1.3):rnd(0,0.15)))),be=Array.from({length:nb},()=>gauss()*b.beff*(bsig?1:0.1));const rows=[];
  for(let j=0;j<nb;j++)for(let i=0;i<t;i++)rows.push({f:[i],b:j,y:round(b.mu+te[i]+be[j]+gauss()*b.sd,b.resp.dec)});
  return{design:'dbca',ctx:b.ctx.replace(/\b\d+ (lotes|operarios|fincas|días de producción|panelistas|líneas)/g,(m,w)=>nb+' '+w),resp:b.resp,fac:[{...b.fac,codes:b.fac.lv.map((_,i)=>i+1)}],blk:{...b.blk,codes:b.blk.lv.map((_,i)=>i+1)},rows,r:1};}
function genFact(k){const b0=pickNew('f'+k,k===2?B_F2:B_F3),b={...b0,r:k===2?pick([2,3,4]):pick([2,2,3])},sd=b.sd;
  const terms=k===2?['A','B','AB']:['A','B','C','AB','AC','BC','ABC'];const half={};
  terms.forEach(t=>{const main=t.length===1;const on=main?Math.random()<0.8:(t.length===2?Math.random()<0.45:Math.random()<0.1);half[t]=(Math.random()<0.5?-1:1)*sd*(on?rnd(1.6,4):rnd(0,0.3));});
  const rows=[];
  for(let c=0;c<2**k;c++){const lv=Array.from({length:k},(_,i)=>(c>>i)&1),s=lv.map(v=>v?1:-1);
    let m=b.mu;terms.forEach(t=>{let sg=1;for(const ch of t)sg*=s['ABC'.indexOf(ch)];m+=half[t]*sg;});
    for(let r=0;r<b.r;r++)rows.push({f:lv,b:null,y:round(m+gauss()*sd,b.resp.dec)});}
  return{design:k===2?'f2':'f3',ctx:b.ctx.replace(/con \d+ repeticiones/,'con '+b.r+' repeticiones'),resp:b.resp,fac:b.fac.map(f=>({...f,codes:[-1,1]})),blk:null,rows,r:b.r};}
const GEN={dca:genDCA,dbca:genDBCA,f2:()=>genFact(2),f3:()=>genFact(3)};

/* ---------------- Análisis ---------------- */
function analyze(C){const ys=C.rows.map(r=>r.y),N=ys.length,gm=ST.mean(ys),sst=ST.sum(ys.map(v=>(v-gm)**2)),A={N,gm,sst,sumY:ST.sum(ys),sumY2:ST.sum(ys.map(v=>v*v))};
  const F0=C.fac[0];
  if(C.design==='dca'||C.design==='dbca'){
    const k=F0.lv.length,groups=F0.lv.map((_,i)=>C.rows.filter(r=>r.f[0]===i).map(r=>r.y));
    A.groups=groups;A.means=groups.map(ST.mean);A.n=groups[0].length;A.k=k;
    A.desc=groups.map(g=>({N:g.length,m:ST.mean(g),sd:ST.sd(g),se:ST.sd(g)/Math.sqrt(g.length),min:Math.min(...g),max:Math.max(...g),sum:ST.sum(g)}));
    const ssTr=ST.sum(groups.map(g=>g.length*(ST.mean(g)-gm)**2));A.trSum=groups.map(ST.sum);
    if(C.design==='dca'){const ow=ST.oneway(groups);A.rows=[{key:'tr',src:F0.n,ss:ow.ssb,df:ow.d1,ms:ow.msb,F:ow.F,p:ow.p},{key:'err',src:'Error',ss:ow.ssw,df:ow.d2,ms:ow.msw}];
      A.err={ss:ow.ssw,df:ow.d2,ms:ow.msw};A.levene=ST.levene(groups);A.resid=C.rows.map(r=>r.y-A.means[r.f[0]]);}
    else{const nb=C.blk.lv.length,bg=C.blk.lv.map((_,j)=>C.rows.filter(r=>r.b===j).map(r=>r.y)),bm=bg.map(ST.mean);A.bmeans=bm;A.bSum=bg.map(ST.sum);A.nb=nb;
      const ssB=ST.sum(bm.map(m=>k*(m-gm)**2)),sse=sst-ssTr-ssB,dfT=k-1,dfB=nb-1,dfE=dfT*dfB,mse=sse/dfE;
      A.rows=[{key:'tr',src:F0.n,ss:ssTr,df:dfT,ms:ssTr/dfT,F:ssTr/dfT/mse,p:ST.pF(ssTr/dfT/mse,dfT,dfE)},{key:'bl',src:C.blk.n,ss:ssB,df:dfB,ms:ssB/dfB,F:ssB/dfB/mse,p:ST.pF(ssB/dfB/mse,dfB,dfE)},{key:'err',src:'Error',ss:sse,df:dfE,ms:mse}];
      A.err={ss:sse,df:dfE,ms:mse};A.resid=C.rows.map(r=>r.y-A.means[r.f[0]]-bm[r.b]+gm);}
    A.tukey=ST.tukey(A.means,F0.lv,A.err.ms,A.err.df,A.n);A.letters=ST.letters(A.means,A.tukey.hsd);
  }else{const k=C.fac.length,nc=2**k,cells=[];
    for(let c=0;c<nc;c++){const lv=Array.from({length:k},(_,i)=>(c>>i)&1);const v=C.rows.filter(r=>r.f.every((x,i)=>x===lv[i])).map(r=>r.y);cells.push({lv,y:v,m:ST.mean(v),sd:ST.sd(v)});}
    A.cells=cells;const terms=k===2?['A','B','AB']:['A','B','C','AB','AC','BC','ABC'];const sse=ST.sum(cells.map(c=>ST.sum(c.y.map(v=>(v-c.m)**2)))),dfE=N-nc,mse=sse/dfE;
    A.err={ss:sse,df:dfE,ms:mse};A.rows=[];A.effects={};
    terms.forEach(t=>{let ct=0;C.rows.forEach(r=>{let s=1;for(const ch of t)s*=r.f['ABC'.indexOf(ch)]?1:-1;ct+=s*r.y;});const ss=ct*ct/N,F=ss/mse;
      A.effects[t]={contrast:ct,effect:ct/(N/2),ss};A.rows.push({key:t,src:t.split('').map(ch=>C.fac['ABC'.indexOf(ch)].n).join(' * '),ss,df:1,ms:ss,F,p:ST.pF(F,1,dfE)});});
    A.rows.push({key:'err',src:'Error',ss:sse,df:dfE,ms:mse});A.levene=C.r>=3?ST.levene(cells.map(c=>c.y)):null;A.resid=C.rows.map(r=>r.y-cells.find(c=>c.lv.every((x,i)=>x===r.f[i])).m);
    const best=cells.reduce((a,b)=>(C.resp.goal==='max'?b.m>a.m:b.m<a.m)?b:a);A.best=best;}
  A.mc={ss:sst-A.err.ss,df:N-1-A.err.df};A.mc.ms=A.mc.ss/A.mc.df;A.mc.F=A.mc.ms/A.err.ms;A.mc.p=ST.pF(A.mc.F,A.mc.df,A.err.df);
  A.R2=1-A.err.ss/sst;A.R2a=1-(A.err.ss/A.err.df)/(sst/(N-1));A.sw=ST.shapiro(A.resid);A.fc=A.sumY**2/N;
  A.main=A.rows[0];return A;}

/* ---------------- Utilidades de presentación ---------------- */
const cellName=(C,lv)=>lv.map((v,i)=>`${C.fac[i].n} ${C.fac[i].lv[v]}`).join(', ');
const goalTxt=C=>C.resp.goal==='max'?'mayor':'menor';
function sigTxt(p){return p<ALPHA?`Sig. = ${spP(p)} &lt; 0,05`:`Sig. = ${spP(p)} &gt; 0,05`;}
/* tabla estilo SPSS: spec {title, sub, head:[[{t,cs,rs}]], rows:[[{t,k,cls,cs,rs}]], foot:[]} */
function spssTable(sp){return`<div class="spss-t"><div class="spss-title">${sp.title}</div>${sp.sub?`<div class="spss-sub">${sp.sub}</div>`:''}<table>${sp.head.map(r=>`<tr>${r.map(c=>`<th${c.cs?` colspan="${c.cs}"`:''}${c.rs?` rowspan="${c.rs}"`:''}>${c.t}</th>`).join('')}</tr>`).join('')}
  ${sp.rows.map(r=>`<tr>${r.map(c=>`<td${c.k?` data-k="${c.k}" tabindex="0"`:''}${c.cs?` colspan="${c.cs}"`:''}${c.rs?` rowspan="${c.rs}"`:''} class="${c.cls||(c.lab?'sl':'sn')}">${c.t}</td>`).join('')}</tr>`).join('')}</table>${(sp.foot||[]).map(f=>`<div class="spss-foot"${f.k?` data-k="${f.k}" tabindex="0"`:''}>${f.t}</div>`).join('')}</div>`;}
const L=t=>({t,lab:true}),Nm=(t,k)=>({t,k});

function spssOutput(C,A){const F0=C.fac[0],o=[];const dv=`Variable dependiente: ${C.resp.n} (${C.resp.u})`;
  const tk=()=>{const head=[[{t:`(I) ${F0.n}`},{t:`(J) ${F0.n}`},{t:'Diferencia de medias (I-J)'},{t:'Desv. Error'},{t:'Sig.'},{t:'Intervalo de confianza al 95%',cs:2}],[{t:''},{t:''},{t:''},{t:''},{t:''},{t:'Límite inferior'},{t:'Límite superior'}]];
    const rows=[];for(let i=0;i<A.k;i++){A.tukey.pairs.filter(p=>p.i===i).forEach((p,idx)=>rows.push([...(idx===0?[{t:F0.lv[i],lab:true,rs:A.k-1}]:[]),L(F0.lv[p.j]),Nm(sp(p.d,3)+(p.p<ALPHA?'*':''),`tk.${Math.min(i,p.j)}.${Math.max(i,p.j)}.d`),Nm(sp(p.se,3)),Nm(spP(p.p),`tk.${Math.min(i,p.j)}.${Math.max(i,p.j)}.p`),Nm(sp(p.lo,3)),Nm(sp(p.hi,3))]));}
    o.push(spssTable({title:'Comparaciones múltiples',sub:`${dv}<br>HSD Tukey`,head,rows,foot:[{t:'*. La diferencia de medias es significativa en el nivel 0.05.'}]}));
    const sets=A.letters.sets,ord=A.letters.order;
    o.push(spssTable({title:C.resp.n,sub:'HSD Tukey<sup>a</sup>',head:[[{t:F0.n,rs:2},{t:'N',rs:2},{t:'Subconjunto para alfa = 0.05',cs:sets.length}],sets.map((_,i)=>({t:String(i+1)}))],
      rows:[...ord.map(i=>[L(F0.lv[i]),Nm(String(A.n)),...sets.map((s,si)=>s.includes(i)?Nm(sp(A.means[i],3),`sub.${si}.${i}`):Nm(''))]),[L('Sig.'),Nm(''),...sets.map(s=>{const ms=s.map(i=>A.means[i]),q=(Math.max(...ms)-Math.min(...ms))/A.tukey.se;return Nm(spP(1-ST.ptukey(q,A.k,A.err.df)));})]],
      foot:[{t:'Se visualizan las medias para los grupos en los subconjuntos homogéneos.'},{t:`a. Utiliza el tamaño de la muestra de la media armónica = ${sp(A.n,3)}.`}]}));};
  const sw=()=>spssTable({title:'Pruebas de normalidad',head:[[{t:'',rs:2},{t:'Shapiro-Wilk',cs:3}],[{t:'Estadístico'},{t:'gl'},{t:'Sig.'}]],rows:[[L(`Residuo para ${C.resp.var}`),Nm(sp(A.sw.W,3),'sw.w'),Nm(String(A.N)),Nm(spP(A.sw.p),'sw.p')]]});
  if(C.design==='dca'){const d=A.desc,tot=C.rows.map(r=>r.y);
    o.push(spssTable({title:'Descriptivos',sub:`${C.resp.n} (${C.resp.u})`,head:[[{t:''},{t:'N'},{t:'Media'},{t:'Desv. Desviación'},{t:'Desv. Error'},{t:'Mínimo'},{t:'Máximo'}]],
      rows:[...d.map((x,i)=>[L(F0.lv[i]),Nm(String(x.N),`desc.N.${i}`),Nm(sp(x.m,4),`desc.m.${i}`),Nm(sp(x.sd,4),`desc.sd.${i}`),Nm(sp(x.se,4)),Nm(sp(x.min,C.resp.dec)),Nm(sp(x.max,C.resp.dec))]),[L('Total'),Nm(String(A.N),'desc.N.t'),Nm(sp(A.gm,4),'desc.m.t'),Nm(sp(ST.sd(tot),4)),Nm(sp(ST.sd(tot)/Math.sqrt(A.N),4)),Nm(sp(Math.min(...tot),C.resp.dec)),Nm(sp(Math.max(...tot),C.resp.dec))]]}));
    o.push(spssTable({title:'Prueba de homogeneidad de varianzas',head:[[{t:''},{t:'Estadístico de Levene'},{t:'gl1'},{t:'gl2'},{t:'Sig.'}]],rows:[[L(`${C.resp.n} · Se basa en la media`),Nm(sp(A.levene.F,3),'lev.f'),Nm(String(A.levene.d1)),Nm(String(A.levene.d2)),Nm(spP(A.levene.p),'lev.p')]]}));
    const t=A.rows[0],e=A.rows[1];
    o.push(spssTable({title:'ANOVA',sub:`${C.resp.n} (${C.resp.u})`,head:[[{t:''},{t:'Suma de cuadrados'},{t:'gl'},{t:'Media cuadrática'},{t:'F'},{t:'Sig.'}]],
      rows:[[L('Entre grupos'),Nm(sp(t.ss,3),'an.tr.ss'),Nm(String(t.df),'an.tr.df'),Nm(sp(t.ms,3),'an.tr.ms'),Nm(sp(t.F,3),'an.tr.f'),Nm(spP(t.p),'an.tr.p')],[L('Dentro de grupos'),Nm(sp(e.ss,3),'an.err.ss'),Nm(String(e.df),'an.err.df'),Nm(sp(e.ms,3),'an.err.ms'),Nm(''),Nm('')],[L('Total'),Nm(sp(A.sst,3),'an.tot.ss'),Nm(String(A.N-1),'an.tot.df'),Nm(''),Nm(''),Nm('')]]}));
    o.push(sw());tk();return o;}
  // Univariado
  const fct=[...C.fac.map(f=>f.lv.map((l,i)=>[f.n,f.codes[i],l,C.rows.filter(r=>r.f[C.fac.indexOf(f)]===i).length])),...(C.blk?[C.blk.lv.map((l,i)=>[C.blk.n,C.blk.codes[i],l,C.rows.filter(r=>r.b===i).length])]:[])];
  o.push(spssTable({title:'Factores inter-sujetos',head:[[{t:''},{t:''},{t:'Etiqueta de valor'},{t:'N'}]],rows:fct.flatMap(g=>g.map((r,i)=>[...(i===0?[{t:r[0],lab:true,rs:g.length}]:[]),Nm(String(r[1]).replace('-','-')),L(r[2]),Nm(String(r[3]),'fis.n')]))}));
  if(C.design!=='dbca'){
    o.push(spssTable({title:'Estadísticos descriptivos',sub:dv,head:[[...C.fac.map(f=>({t:f.n})),{t:'Media'},{t:'Desv. Desviación'},{t:'N'}]],rows:A.cells.map((c,ci)=>[...c.lv.map((v,i)=>L(C.fac[i].lv[v])),Nm(sp(c.m,4),`cell.m.${ci}`),Nm(sp(c.sd,4)),Nm(String(c.y.length),'cell.n')])}));
    if(A.levene)o.push(spssTable({title:'Prueba de igualdad de Levene de varianzas de error<sup>a</sup>',sub:dv,head:[[{t:''},{t:'Estadístico de Levene'},{t:'gl1'},{t:'gl2'},{t:'Sig.'}]],rows:[[L('Se basa en la media'),Nm(sp(A.levene.F,3),'lev.f'),Nm(String(A.levene.d1)),Nm(String(A.levene.d2)),Nm(spP(A.levene.p),'lev.p')]],foot:[{t:'Prueba la hipótesis nula de que la varianza de error de la variable dependiente es igual entre grupos.'}]}));}
  const rows=[[L('Modelo corregido'),Nm(sp(A.mc.ss,3)+'<sup>a</sup>','an.mc.ss'),Nm(String(A.mc.df)),Nm(sp(A.mc.ms,3)),Nm(sp(A.mc.F,3)),Nm(spP(A.mc.p),'an.mc.p')],
    [L('Intersección'),Nm(sp(A.fc,3)),Nm('1'),Nm(sp(A.fc,3)),Nm(sp(A.fc/A.err.ms,3)),Nm(spP(ST.pF(A.fc/A.err.ms,1,A.err.df)),'an.int.p')],
    ...A.rows.filter(r=>r.key!=='err').map(r=>[L(r.src),Nm(sp(r.ss,3),`an.${r.key}.ss`),Nm(String(r.df),`an.${r.key}.df`),Nm(sp(r.ms,3),`an.${r.key}.ms`),Nm(sp(r.F,3),`an.${r.key}.f`),Nm(spP(r.p),`an.${r.key}.p`)]),
    [L('Error'),Nm(sp(A.err.ss,3),'an.err.ss'),Nm(String(A.err.df),'an.err.df'),Nm(sp(A.err.ms,3),'an.err.ms'),Nm(''),Nm('')],
    [L('Total'),Nm(sp(A.sumY2,3)),Nm(String(A.N)),Nm(''),Nm(''),Nm('')],[L('Total corregido'),Nm(sp(A.sst,3),'an.tot.ss'),Nm(String(A.N-1),'an.tot.df'),Nm(''),Nm(''),Nm('')]];
  o.push(spssTable({title:'Pruebas de efectos inter-sujetos',sub:dv,head:[[{t:'Origen'},{t:'Tipo III de suma de cuadrados'},{t:'gl'},{t:'Media cuadrática'},{t:'F'},{t:'Sig.'}]],rows,foot:[{t:`a. R al cuadrado = ${sp(A.R2,3)} (R al cuadrado ajustada = ${sp(A.R2a,3)})`,k:'r2'}]}));
  o.push(sw());if(C.design==='dbca')tk();return o;}

/* Gráfico de perfil (interacción) */
function profile(C,A,W,fa=0,fb=1){const cl=A.cells.filter(c=>C.fac.length===2||c.lv.every((v,i)=>i===fa||i===fb||true));
  const m=(va,vb)=>{const v=A.cells.filter(c=>c.lv[fa]===va&&c.lv[fb]===vb).flatMap(c=>c.y);return ST.mean(v);};
  const pts=[0,1].map(vb=>[[0,m(0,vb)],[1,m(1,vb)]]),all=pts.flat().map(p=>p[1]),lo=Math.min(...all),hi=Math.max(...all),pad=(hi-lo)*0.25||1;
  return chart({W,H:240,xmin:-0.25,xmax:1.25,ymin:lo-pad,ymax:hi+pad,xticks:[0,1],xfmt:v=>C.fac[fa].lv[v],xlabel:C.fac[fa].n,curves:pts.map((p,i)=>({pts:p,cls:'s'+i})),points:pts.flatMap((p,i)=>p.map(q=>({x:q[0],y:q[1],cls:'sc s'+i}))),ml:58,yfmt:v=>nf(v,2)})
   +`<div class="legend">${[0,1].map(vb=>`<span><i class="lg s${vb}"></i>${C.fac[fb].n}: ${C.fac[fb].lv[vb]}</span>`).join('')}</div>`;}

/* ---------------- Datos para descargar ---------------- */
function csv(C,dec){const sep=dec===','?';':',';const head=[...C.fac.map(f=>f.var),...(C.blk?[C.blk.var]:[]),C.resp.var];
  const num=v=>dec===','?String(v).replace('.',','):String(v);
  return[head.join(sep),...C.rows.map(r=>[...r.f.map((v,i)=>C.fac[i].codes[v]),...(C.blk?[C.blk.codes[r.b]]:[]),num(r.y.toFixed(C.resp.dec))].join(sep))].join('\r\n');}
function syntax(C){const fv=C.fac.map(f=>f.var),lab=[...C.fac,...(C.blk?[C.blk]:[])].map(f=>`  ${f.var} ${f.codes.map((c,i)=>`${c} '${f.lv[i].replace(/'/g,'')}'`).join(' ')}`).join('\n  /');
  const vl=`VALUE LABELS\n${lab}.\nVARIABLE LEVEL ${[...fv,...(C.blk?[C.blk.var]:[])].join(' ')} (NOMINAL) /${C.resp.var} (SCALE).\n`;
  if(C.design==='dca')return vl+`ONEWAY ${C.resp.var} BY ${fv[0]}\n  /STATISTICS DESCRIPTIVES HOMOGENEITY\n  /POSTHOC=TUKEY ALPHA(0.05).\nUNIANOVA ${C.resp.var} BY ${fv[0]}\n  /SAVE=RESID\n  /DESIGN=${fv[0]}.\nEXAMINE VARIABLES=RES_1\n  /PLOT NPPLOT.`;
  if(C.design==='dbca')return vl+`UNIANOVA ${C.resp.var} BY ${fv[0]} ${C.blk.var}\n  /METHOD=SSTYPE(3)\n  /POSTHOC=${fv[0]}(TUKEY)\n  /SAVE=RESID\n  /DESIGN=${fv[0]} ${C.blk.var}.\nEXAMINE VARIABLES=RES_1\n  /PLOT NPPLOT.`;
  return vl+`UNIANOVA ${C.resp.var} BY ${fv.join(' ')}\n  /METHOD=SSTYPE(3)\n  /PLOT=PROFILE(${fv[0]}*${fv[1]})\n  /PRINT=DESCRIPTIVE HOMOGENEITY\n  /SAVE=RESID\n  /DESIGN=${fv.join(' ')} ${fv.length===2?`${fv[0]}*${fv[1]}`:`${fv[0]}*${fv[1]} ${fv[0]}*${fv[2]} ${fv[1]}*${fv[2]} ${fv.join('*')}`}.\nEXAMINE VARIABLES=RES_1\n  /PLOT NPPLOT.`;}
const MENU={
 dca:[['Importa los datos','Archivo → Importar datos → Datos CSV','File → Import Data → CSV Data'],['Revisa la vista de variables','Medida: el factor <b>Nominal</b> y la respuesta <b>Escala</b>. En <b>Valores</b> pon las etiquetas (1 = …).','Variable View: Measure, Values'],['Corre el ANOVA','Analizar → Comparar medias → ANOVA de un factor. Lista de dependientes: la respuesta; Factor: el tratamiento.','Analyze → Compare Means → One-Way ANOVA'],['Pide Tukey y Levene','Botón <b>Post hoc</b> → Tukey. Botón <b>Opciones</b> → Descriptivos y Prueba de homogeneidad de varianzas.','Post Hoc → Tukey · Options → Homogeneity of variance test'],['Revisa la normalidad de los residuos','Analizar → Modelo lineal general → Univariado → <b>Guardar</b> → Residuos no tipificados. Luego Analizar → Estadísticos descriptivos → Explorar → Gráficos → <b>Gráficos de normalidad con pruebas</b>, con la variable RES_1.','Save → Unstandardized residuals · Explore → Normality plots with tests']],
 dbca:[['Importa los datos','Archivo → Importar datos → Datos CSV','File → Import Data → CSV Data'],['Revisa la vista de variables','Tratamiento y bloque: <b>Nominal</b>. Respuesta: <b>Escala</b>. Pon etiquetas en <b>Valores</b>.','Variable View'],['Abre Univariado','Analizar → Modelo lineal general → Univariado. Variable dependiente: la respuesta. <b>Factores fijos</b>: el tratamiento y el bloque.','Analyze → General Linear Model → Univariate'],['Quita la interacción','Botón <b>Modelo</b> → Personalizado (Generar términos) → tipo <b>Efectos principales</b>, y pasa el tratamiento y el bloque. En un DBCA no hay interacción tratamiento × bloque.','Model → Custom → Main effects'],['Tukey y residuos','<b>Post hoc</b> → Tukey solo para el tratamiento. <b>Guardar</b> → Residuos no tipificados, y revísalos con Explorar → Gráficos de normalidad con pruebas.','Post Hoc · Save → Unstandardized residuals']],
 f:[['Importa los datos','Archivo → Importar datos → Datos CSV. Los niveles vienen codificados −1 (bajo) y 1 (alto).','File → Import Data → CSV Data'],['Revisa la vista de variables','Factores: <b>Nominal</b>, con etiquetas en <b>Valores</b> (−1 = nivel bajo, 1 = nivel alto). Respuesta: <b>Escala</b>.','Variable View'],['Abre Univariado','Analizar → Modelo lineal general → Univariado. Variable dependiente: la respuesta. <b>Factores fijos</b>: todos los factores.','Analyze → General Linear Model → Univariate'],['Modelo factorial completo','Botón <b>Modelo</b> → <b>Factorial completo</b> (incluye las interacciones).','Model → Full factorial'],['Gráfico y supuestos','<b>Gráficos</b>: un factor en el eje horizontal y otro en líneas separadas → Añadir. <b>Opciones</b>: Estadísticos descriptivos y Pruebas de homogeneidad. <b>Guardar</b> → Residuos no tipificados.','Plots → Profile plots · Options · Save']]};

/* ---------------- Pestaña 1: ¿Cuándo se usa? ---------------- */
const WHEN={
 dca:{use:'Comparar <b>un factor</b> con varios tratamientos cuando las unidades experimentales son <b>homogéneas</b> (misma materia prima, mismo día, mismo equipo).',not:'Si hay una fuente de variación conocida que no puedes eliminar (lotes, días, operarios), usa DBCA.',model:'y<sub>ij</sub> = μ + τ<sub>i</sub> + ε<sub>ij</sub>'},
 dbca:{use:'Comparar <b>un factor</b> cuando existe una fuente de variación <b>conocida que no interesa</b> pero se puede agrupar: lotes de materia prima, días, operarios, equipos. Cada bloque recibe <b>todos</b> los tratamientos.',not:'El bloque no es un segundo factor de estudio: no se busca “el mejor bloque”, solo quitar su ruido.',model:'y<sub>ij</sub> = μ + τ<sub>i</sub> + β<sub>j</sub> + ε<sub>ij</sub>'},
 f2:{use:'Estudiar <b>dos factores a la vez</b>, cada uno en <b>dos niveles</b> (bajo y alto), con repeticiones. Permite ver si los factores <b>interactúan</b>.',not:'Si un factor tiene 3 o más niveles, es un factorial general a × b.',model:'y = μ + A + B + AB + ε'},
 f3:{use:'Estudiar <b>tres factores</b> en dos niveles cada uno (8 combinaciones). Es ideal para identificar qué variables de proceso importan.',not:'Con muchos factores y pocas repeticiones conviene un factorial fraccionado (fuera de este curso).',model:'y = μ + A + B + C + AB + AC + BC + ABC + ε'}};
const MINI=[
 ['dca','Se comparan 4 marcas de harina para pan. Todos los panes se hacen el mismo día, con el mismo horno y la misma receta, asignando las marcas al azar a 20 masas.'],
 ['dca','Se mide el color de 3 variedades de pitahaya almacenadas en la misma cámara, con 6 frutas por variedad elegidas al azar.'],
 ['dca','Se prueban 5 dosis de nitrito en salchichas elaboradas con la misma pasta cárnica, con 4 repeticiones por dosis.'],
 ['dbca','Se comparan 3 estabilizantes en helado. Cada lote de leche solo alcanza para 3 mezclas, así que en 5 lotes se prueban los 3 estabilizantes.'],
 ['dbca','4 panelistas califican 3 formulaciones de bebida de avena; se sabe que cada panelista califica con su propio criterio.'],
 ['dbca','Se comparan 4 tiempos de escaldado de brócoli. Como el brócoli cambia cada semana, en cada una de 4 semanas se prueban los 4 tiempos.'],
 ['f2','Se estudia el efecto de la temperatura (60 y 70 °C) y el tiempo (10 y 20 min) de escaldado sobre el color de zanahoria, con 3 repeticiones por combinación.'],
 ['f2','Se quiere saber si la concentración de sal (2 y 3 %) y el tipo de envase (vidrio y plástico) influyen en la vida útil de una salsa, y si interactúan.'],
 ['f3','Se estudian la sal (2 y 4 %), el tiempo de salmuera (1 y 3 h) y la temperatura (5 y 15 °C) sobre la textura de un pescado, en las 8 combinaciones.'],
 ['f3','Para un néctar se prueban la pulpa (20 y 30 %), el azúcar (8 y 12 °Brix) y el CMC (0,1 y 0,2 %), con dos repeticiones de cada combinación.'],
];
MINI.push(...MINI_EXTRA);
function renderWhen(p,design){const W=WHEN[design];
  p.innerHTML=`<div class="when"><div class="when-c ok"><b>Se usa cuando…</b><p>${W.use}</p></div><div class="when-c"><b>Ojo</b><p>${W.not}</p></div><div class="when-c"><b>Modelo</b><p class="mono">${W.model}</p></div></div>
   <h3 class="sub">¿Este caso es un ${DN[design]}?</h3><p class="ctx">Lee cada situación y elige el diseño que corresponde.</p><div id="mini"></div><div class="btn-row"><button type="button" class="btn btn-ghost" id="mini-new">Otros casos</button></div>`;
  const draw=()=>{const cs=shuffle([shuffle(MINI.filter(m=>m[0]===design))[0],...shuffle(MINI.filter(m=>m[0]!==design)).slice(0,2)]);
    $('#mini',p).innerHTML=cs.map((c,i)=>`<div class="mini" data-a="${c[0]}"><p>${c[1]}</p><div class="seg">${Object.entries(DN).map(([k,v])=>`<button type="button" data-k="${k}">${v}</button>`).join('')}</div><p class="fb"></p></div>`).join('');
    p.querySelectorAll('.mini').forEach(m=>m.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{const ok=b.dataset.k===m.dataset.a;m.querySelectorAll('button').forEach(x=>{x.disabled=true;x.classList.toggle('is-ok',x.dataset.k===m.dataset.a);});if(!ok)b.classList.add('is-bad');
      m.querySelector('.fb').innerHTML=`${ok?'<strong>Bien.</strong>':'<strong>No.</strong>'} Es <b>${DLONG[m.dataset.a]}</b>: ${WHEN[m.dataset.a].use.replace(/<[^>]+>/g,'')}`;})));};
  draw();$('#mini-new',p).addEventListener('click',draw);}

/* ---------------- Pestaña 2: Organiza los datos ---------------- */
function renderOrganize(p,C){const F0=C.fac[0];
  const items=[...C.fac.map((f,i)=>({id:'f'+i,label:`${f.n} <small>(${f.lv.join(', ')})</small>`,box:'fac'})),{id:'y',label:`${C.resp.n} <small>(${C.resp.u})</small>`,box:'resp'},...(C.blk?[{id:'b',label:`${C.blk.n} <small>(${C.blk.lv.length})</small>`,box:'blk'}]:[{id:'x',label:`Fecha del ensayo <small>(todas iguales)</small>`,box:'none'}])];
  const boxes=[{id:'fac',label:C.fac.length>1?'Factores':'Factor (tratamientos)',hint:'lo que tú cambias y quieres estudiar'},{id:'blk',label:'Bloque',hint:'variación conocida que no te interesa'},{id:'resp',label:'Variable de respuesta',hint:'lo que mides'},{id:'none',label:'No va al análisis'}];
  // tabla de cuaderno (ancha)
  let wide;if(C.design==='dca'){const g=F0.lv.map((_,i)=>C.rows.filter(r=>r.f[0]===i).map(r=>r.y));wide=`<table class="tbl nb"><thead><tr><th>${F0.n}</th>${g[0].map((_,j)=>`<th>Rep. ${j+1}</th>`).join('')}</tr></thead><tbody>${g.map((r,i)=>`<tr><td>${F0.lv[i]}</td>${r.map(v=>`<td>${nf(v,C.resp.dec)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;}
  else if(C.design==='dbca'){wide=`<table class="tbl nb"><thead><tr><th>${F0.n} \\ ${C.blk.n}</th>${C.blk.lv.map(b=>`<th>${b}</th>`).join('')}</tr></thead><tbody>${F0.lv.map((l,i)=>`<tr><td>${l}</td>${C.blk.lv.map((_,j)=>`<td>${nf(C.rows.find(r=>r.f[0]===i&&r.b===j).y,C.resp.dec)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;}
  else{const A=analyze(C);wide=`<table class="tbl nb"><thead><tr>${C.fac.map(f=>`<th>${f.n}</th>`).join('')}${A.cells[0].y.map((_,j)=>`<th>Rep. ${j+1}</th>`).join('')}</tr></thead><tbody>${A.cells.map(c=>`<tr>${c.lv.map((v,i)=>`<td>${C.fac[i].lv[v]}</td>`).join('')}${c.y.map(v=>`<td>${nf(v,C.resp.dec)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;}
  const longRows=C.rows.slice(0,6),cols=[...C.fac.map(f=>f.var),...(C.blk?[C.blk.var]:[]),C.resp.var];
  const grid=(head,rows)=>`<table class="spss-grid"><tr><th></th>${head.map(h=>`<th>${h}</th>`).join('')}</tr>${rows.map((r,i)=>`<tr><th>${i+1}</th>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}<tr><th>…</th>${head.map(()=>'<td>…</td>').join('')}</tr></table>`;
  const good=grid(cols,longRows.map(r=>[...r.f.map((v,i)=>C.fac[i].codes[v]),...(C.blk?[C.blk.codes[r.b]]:[]),sp(r.y,C.resp.dec)]));
  const bad1=C.design==='dca'||C.design==='dbca'?grid(F0.lv.map(l=>l.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,8)),[0,1,2].map(j=>F0.lv.map((_,i)=>{const v=C.rows.filter(r=>r.f[0]===i)[j];return v?sp(v.y,C.resp.dec):'';}))):grid([...C.fac.map(f=>f.var),'rep1','rep2'],analyze(C).cells.slice(0,4).map(c=>[...c.lv.map((v,i)=>C.fac[i].codes[v]),sp(c.y[0],C.resp.dec),sp(c.y[1],C.resp.dec)]));
  const bad2=grid(cols,longRows.map(r=>[...r.f.map((v,i)=>C.fac[i].lv[v]),...(C.blk?[C.blk.lv[r.b]]:[]),nf(r.y,C.resp.dec)+' '+C.resp.u]));
  const opts=shuffle([['good',good,'Una fila por cada observación, una columna por variable y números en lugar de texto. Así lo pide SPSS (formato largo).'],['bad1',bad1,'Así se ve en el cuaderno, pero SPSS necesita que el tratamiento sea <b>una columna</b>, no una columna por tratamiento.'],['bad2',bad2,'Tiene texto con unidades (“'+C.resp.u+'”) y nombres escritos: SPSS leerá la respuesta como cadena y no podrá calcular. Se codifica con números y se ponen etiquetas en <b>Valores</b>.']]);
  p.innerHTML=`<div class="part"><h3 class="sub">A. ¿Qué es cada cosa?</h3><p class="ctx">${C.ctx}</p><p class="note">Arrastra cada ficha a su caja (o tócala y luego toca la caja).</p><div id="roles"></div><div class="btn-row"><button type="button" class="btn" id="roles-ok">Comprobar</button></div><p class="fb" id="roles-fb"></p></div>
   <div class="part"><h3 class="sub">B. Del cuaderno a SPSS</h3><p class="ctx">Así anotaste los datos en el laboratorio:</p><div class="table-wrap">${wide}</div><p class="ctx"><b>¿Cuál es la base de datos correcta para SPSS?</b></p>
   <div class="grids">${opts.map((o,i)=>`<button type="button" class="gridopt" data-k="${o[0]}"><span class="gl">Opción ${'ABC'[i]}</span><div class="table-wrap">${o[1]}</div></button>`).join('')}</div><p class="fb" id="grid-fb"></p></div>
   <div class="part"><h3 class="sub">C. Vista de variables</h3><p class="ctx">En SPSS, cada variable necesita su tipo de <b>Medida</b>. Elige la correcta.</p>
   <div class="table-wrap"><table class="spss-grid vv"><tr><th></th><th>Nombre</th><th>Tipo</th><th>Decimales</th><th>Valores</th><th>Medida</th></tr>${cols.map((c,i)=>{const isY=i===cols.length-1,src=isY?null:(i<C.fac.length?C.fac[i]:C.blk);
     return`<tr><th>${i+1}</th><td>${c}</td><td>Numérico</td><td>${isY?C.resp.dec:0}</td><td class="vals">${isY?'Ninguno':src.codes.map((k,j)=>`${k} = ${src.lv[j]}`).join('; ')}</td><td><select data-a="${isY?'Escala':'Nominal'}" aria-label="Medida de ${c}"><option value="">Elige…</option><option>Escala</option><option>Ordinal</option><option>Nominal</option></select></td></tr>`;}).join('')}</table></div>
   <div class="btn-row"><button type="button" class="btn" id="vv-ok">Comprobar</button></div><p class="fb" id="vv-fb"></p></div>`;
  const D=dnd($('#roles',p),{items:items.map(i=>({id:i.id,label:i.label})),boxes});
  $('#roles-ok',p).addEventListener('click',()=>{const g=D.get(),ok={};let all=true;const empty=Object.values(g).some(v=>v===null);items.forEach(i=>{ok[i.id]=g[i.id]===i.box;if(!ok[i.id])all=false;});if(!empty)D.mark(ok);
    $('#roles-fb',p).innerHTML=all?`<strong>Correcto.</strong> ${C.fac.map(f=>`<b>${f.n}</b>`).join(' y ')} ${C.fac.length>1?'son los factores':'es el factor'}; <b>${C.resp.n}</b> es la respuesta${C.blk?`; <b>${C.blk.n}</b> es el bloque: no se estudia, pero se controla`:''}.`:empty?'Faltan fichas por ubicar.':'Revisa las fichas en rojo. Pista: el bloque es algo que no elegiste estudiar, pero que sabes que hace variar los resultados.';});
  p.querySelectorAll('.gridopt').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.k;p.querySelectorAll('.gridopt').forEach(x=>{x.classList.toggle('is-ok',x.dataset.k==='good');x.classList.remove('is-bad');});if(k!=='good')b.classList.add('is-bad');
    $('#grid-fb',p).innerHTML=(k==='good'?'<strong>Correcto.</strong> ':'<strong>Esa no.</strong> ')+opts.find(o=>o[0]===k)[2]+(k!=='good'?' La correcta está marcada en verde.':'');}));
  $('#vv-ok',p).addEventListener('click',()=>{let all=true;p.querySelectorAll('.vv select').forEach(s=>{const ok=s.value===s.dataset.a;s.classList.toggle('bad',!ok);s.classList.toggle('good',ok);if(!ok)all=false;});
    $('#vv-fb',p).innerHTML=all?'<strong>Correcto.</strong> Los tratamientos y bloques son categorías (<b>Nominal</b>), aunque estén escritos con números. La respuesta es una medición (<b>Escala</b>).':'Revisa las marcadas. Un número que solo es un código de grupo (1, 2, 3) es <b>Nominal</b>; una medición es <b>Escala</b>.';});
}

/* ---------------- Pestaña 3: Analiza paso a paso ---------------- */
function h0opts(C,eff){const F0=C.fac[0],mus=F0.lv.map((_,i)=>`μ<sub>${i+1}</sub>`);
  if(eff==='tr')return[[`H₀: ${mus.join(' = ')}<br>H₁: al menos una media es diferente`,true,'Correcto: H₀ siempre dice “no hay efecto” (todas las medias poblacionales iguales).'],
    [`H₀: ${mus.join(' ≠ ')}<br>H₁: ${mus.join(' = ')}`,false,'Está al revés: la igualdad va en H₀.'],
    [`H₀: ${F0.lv.map((_,i)=>`x̄<sub>${i+1}</sub>`).join(' = ')}<br>H₁: alguna x̄ es diferente`,false,'Las hipótesis son sobre las medias de la <b>población</b> (μ), no de la muestra (x̄): las x̄ ya las conoces.'],
    [`H₀: al menos una media es diferente<br>H₁: ${mus.join(' = ')}`,false,'Está al revés: H₀ es la de “no hay diferencias”.']];
  const nm=eff.split('').map(ch=>C.fac['ABC'.indexOf(ch)].n).join(' × ');
  if(eff.length>1)return[[`H₀: no hay interacción ${nm}<br>H₁: hay interacción ${nm}`,true,'Correcto. Que haya interacción significa que el efecto de un factor depende del nivel del otro.'],
    [`H₀: hay interacción ${nm}<br>H₁: no hay interacción`,false,'Está al revés: H₀ es “no hay efecto”.'],[`H₀: ${nm} es el mejor tratamiento<br>H₁: no lo es`,false,'Las hipótesis no comparan “el mejor”: preguntan si existe el efecto.']];
  return[[`H₀: el factor ${nm} no tiene efecto (μ<sub>bajo</sub> = μ<sub>alto</sub>)<br>H₁: sí tiene efecto (μ<sub>bajo</sub> ≠ μ<sub>alto</sub>)`,true,'Correcto.'],[`H₀: μ<sub>bajo</sub> ≠ μ<sub>alto</sub><br>H₁: μ<sub>bajo</sub> = μ<sub>alto</sub>`,false,'Está al revés.']];}
function renderAnalyze(p,C,A,W){const F0=C.fac[0],des=C.design,fact=des==='f2'||des==='f3',steps=[];const dec=C.resp.dec+2;
  const effKey=fact?(A.rows.find(r=>r.key.length>1&&r.p<ALPHA)?A.rows.filter(r=>r.key.length>1).sort((a,b)=>a.p-b.p)[0].key:'A'):'tr';
  // 1 hipótesis
  steps.push({t:'Plantea las hipótesis',body:`<p>${fact?`En un factorial hay un par de hipótesis por cada efecto (${A.rows.filter(r=>r.key!=='err').map(r=>r.src).join(', ')}). Elige el par correcto para <b>${A.rows.find(r=>r.key===effKey).src}</b>:`:`Para el factor <b>${F0.n}</b>${C.blk?' (el bloque también tiene su par de hipótesis, pero no es lo que se estudia)':''}, elige el par correcto:`}</p>`,
    q:{type:'mc',opts:shuffle(h0opts(C,effKey))}});
  // 2 supuestos
  const swOk=A.sw.p>ALPHA,levOk=A.levene?A.levene.p>ALPHA:true,ok=swOk&&levOk;
  const rp=C.rows.map((r,i)=>({x:(fact?A.cells.findIndex(c=>c.lv.every((v,j)=>v===r.f[j])):r.f[0])+(Math.random()-0.5)*0.25,y:A.resid[i]})),gx=fact?A.cells.length:F0.lv.length,ry=Math.max(...A.resid.map(Math.abs))*1.2||1;
  steps.push({t:'Revisa los supuestos',body:`<p>El ANOVA pide <b>normalidad</b> de los residuos${A.levene?' y <b>varianzas iguales</b> entre grupos (homogeneidad)':''}. Para ambos se espera <b>no rechazar</b> H₀ (Sig. &gt; 0,05). Además, las observaciones deben ser <b>independientes</b> (por eso se aleatoriza).</p>
    <div class="readouts"><div class="ro ${swOk?'':'bad'}"><span>Shapiro-Wilk (residuos)</span><b>W = ${sp(A.sw.W,3)} · Sig. = ${spP(A.sw.p)}</b></div>${A.levene?`<div class="ro ${levOk?'':'bad'}"><span>Levene (homogeneidad)</span><b>F = ${sp(A.levene.F,3)} · Sig. = ${spP(A.levene.p)}</b></div>`:`<div class="ro"><span>Levene</span><b style="font-size:13px">${C.blk?'No aplica: en DBCA hay una sola observación por celda.':'No es informativo con solo 2 repeticiones por combinación: revisa el gráfico de residuos.'}</b></div>`}</div>
    <div class="chart-wrap">${chart({W,H:200,xmin:-0.6,xmax:gx-0.4,ymin:-ry,ymax:ry,xticks:Array.from({length:gx},(_,i)=>i),xfmt:i=>fact?String(i+1):F0.lv[i]||'',points:rp.map(q=>({x:q.x,y:q.y,cls:'sc s0'})),hlines:[{y:0,cls:'acc'}],xlabel:fact?'Combinación':F0.n,yfmt:v=>nf(v,2)})}</div><p class="note">Residuos: lo que cada dato se aleja de lo que predice el modelo. Deben verse repartidos al azar alrededor de 0, con anchos parecidos en cada grupo.</p>`,
    q:{type:'mc',text:'¿Se cumplen los supuestos para confiar en el ANOVA?',opts:[['Sí',ok,ok?'Correcto: ninguna prueba rechaza su H₀.':''],['No',!ok,!ok?'Correcto: alguna prueba tiene Sig. &lt; 0,05.':'']].map(o=>[o[0],o[1],o[1]?o[2]:(ok?'Revisa: ambas Sig. son mayores que 0,05, así que no se rechaza normalidad ni homogeneidad.':'Revisa: hay una Sig. menor que 0,05.')]),after:ok?'':'<p class="note">Si un supuesto falla, se puede transformar la respuesta (logaritmo, raíz) o usar una prueba no paramétrica (Kruskal-Wallis para DCA, Friedman para DBCA). En este ejercicio seguimos con el ANOVA para practicar la lectura.</p>'}});
  // 3 cálculos
  let calc;const s3=v=>{const a=Math.abs(v);const d=a===0?0:Math.min(7,Math.max(3,3-Math.floor(Math.log10(a))));return nf(v,d);},FC=A.fc;
  if(!fact){calc=`<div class="formula">Factor de corrección: FC = (Σy)² / N = ${s3(A.sumY)}² / ${A.N} = ${s3(FC)}<br>SC<sub>Total</sub> = Σy² − FC = ${s3(A.sumY2)} − ${s3(FC)} = <b>${s3(A.sst)}</b><br>SC<sub>${F0.n}</sub> = Σ(Y<sub>i.</sub>² / ${A.n}) − FC = (${A.trSum.map(v=>s3(v)+'²').join(' + ')}) / ${A.n} − FC = <b>${s3(A.rows[0].ss)}</b>${C.blk?`<br>SC<sub>${C.blk.n}</sub> = Σ(Y<sub>.j</sub>² / ${A.k}) − FC = <b>${s3(A.rows[1].ss)}</b>`:''}<br>SC<sub>Error</sub> = SC<sub>Total</sub> − SC<sub>${F0.n}</sub>${C.blk?` − SC<sub>${C.blk.n}</sub>`:''} = <b>${s3(A.err.ss)}</b></div>`;}
  else{calc=`<div class="formula">Con niveles codificados −1 y +1, cada efecto usa su <b>contraste</b> (suma de los datos con su signo):<br>${Object.entries(A.effects).map(([t,e])=>`${t.split('').map(ch=>C.fac['ABC'.indexOf(ch)].n).join('×')}: contraste = ${s3(e.contrast)} → efecto = ${s3(e.effect)} → SC = contraste² / N = <b>${s3(e.ss)}</b>`).join('<br>')}<br>SC<sub>Error</sub> = Σ(y − media de su combinación)² = <b>${s3(A.err.ss)}</b></div>`;}
  const tbl=`<div class="table-wrap"><table class="tbl"><thead><tr><th>Fuente</th><th>SC</th><th>gl</th><th>CM = SC/gl</th><th>F = CM/CM<sub>E</sub></th><th>Sig.</th></tr></thead><tbody>${A.rows.map(r=>`<tr><td>${r.src}</td><td>${s3(r.ss)}</td><td>${r.df}</td><td>${s3(r.ms)}</td><td>${r.F!==undefined?s3(r.F):''}</td><td>${r.p!==undefined?spP(r.p):''}</td></tr>`).join('')}<tr><td>Total</td><td>${s3(A.sst)}</td><td>${A.N-1}</td><td></td><td></td><td></td></tr></tbody></table></div>`;
  const qGl={type:'num',text:`¿Cuántos grados de libertad tiene el <b>error</b>? (${fact?`N − número de combinaciones = ${A.N} − ${2**C.fac.length}`:C.blk?`(t − 1)(b − 1)`:`N − t`})`,answer:A.err.df,explain:`gl<sub>Error</sub> = ${fact?`${A.N} − ${2**C.fac.length}`:C.blk?`(${A.k} − 1)(${A.nb} − 1)`:`${A.N} − ${A.k}`} = <b>${A.err.df}</b>.`};
  steps.push({t:'Calcula la tabla ANOVA',body:calc+`<p>Con las sumas de cuadrados se arma la tabla:</p>`,q:qGl,after:tbl});
  // 4 decisión
  const er=A.rows.find(r=>r.key===effKey),rej=er.p<ALPHA,Fc=ST.qF(ALPHA,er.df,A.err.df);
  steps.push({t:'Decide',body:`<p>Regla: si <b>Sig. &lt; 0,05</b> (o si F calculado &gt; F crítico) se <b>rechaza H₀</b>. Para <b>${er.src}</b>: F = ${sp(er.F,3)}, F crítico (α = 0,05; ${er.df} y ${A.err.df} gl) = ${nf(Fc,3)}, Sig. = ${spP(er.p)}.</p>`,
    q:{type:'mc',text:'¿Qué decides?',opts:[['Se rechaza H₀',rej],['No se rechaza H₀',!rej]].map(o=>[o[0],o[1],o[1]?(rej?`Correcto: ${sigTxt(er.p)}. Hay evidencia de efecto.`:`Correcto: ${sigTxt(er.p)}. No hay evidencia suficiente de efecto (eso no prueba que sean iguales).`):(rej?`Revisa: ${sigTxt(er.p)}.`:`Revisa: ${sigTxt(er.p)}.`)])}});
  // 5 comparaciones o interacción
  if(!fact){const trRej=A.rows[0].p<ALPHA,best=A.means.reduce((b,m,i)=>(C.resp.goal==='max'?m>A.means[b]:m<A.means[b])?i:b,0),bestSet=A.letters.sets.filter(s=>s.includes(best)).flat();
    const tie=[...new Set(bestSet)].filter(i=>i!==best);
    steps.push({t:'Compara los tratamientos (Tukey)',body:trRej?`<p>Como se rechazó H₀, sabemos que <b>al menos una</b> media difiere, pero no cuál. Tukey compara todos los pares: dos medias son diferentes si su distancia supera la <b>DHS</b>.</p><div class="formula">DHS = q<sub>(0,05; ${A.k}; ${A.err.df})</sub> · √(CM<sub>E</sub> / n) = ${nf(A.tukey.qc,3)} · √(${nf(A.err.ms,4)} / ${A.n}) = <b>${nf(A.tukey.hsd,3)}</b></div>
      <div class="table-wrap"><table class="tbl"><thead><tr><th>${F0.n}</th><th>Media</th><th>Grupo</th></tr></thead><tbody>${A.letters.order.slice().reverse().map(i=>`<tr><td>${F0.lv[i]}</td><td>${nf(A.means[i],3)}</td><td>${A.letters.sets.map((s,si)=>s.includes(i)?'abcdef'[A.letters.sets.length-1-si]:'').join('')}</td></tr>`).join('')}</tbody></table></div><p class="note">Las medias que comparten letra <b>no</b> difieren significativamente. El objetivo es <b>${goalTxt(C)} ${C.resp.n.toLowerCase()}</b>.</p>`
      :`<p>Como <b>no</b> se rechazó H₀, no hay diferencias que buscar: <b>no se hace Tukey</b> (o, si SPSS lo muestra, todas las medias quedan en el mismo subconjunto).</p>`,
      q:trRej?{type:'mc',text:`¿Qué recomiendas si se busca ${goalTxt(C)} ${C.resp.n.toLowerCase()}?`,opts:[[tie.length?`${F0.lv[best]}, aunque no difiere de ${tie.map(i=>F0.lv[i]).join(' ni de ')}`:`${F0.lv[best]}: es el mejor y difiere de los demás`,true,tie.length?'Correcto: tiene la mejor media, pero comparte grupo con otros; cualquiera de ellos es estadísticamente equivalente (decide por costo o disponibilidad).':'Correcto: no comparte grupo con ningún otro.'],
        [tie.length?`${F0.lv[best]}: es el único mejor`:`Todos son iguales`,false,tie.length?`No: comparte grupo con ${tie.map(i=>F0.lv[i]).join(', ')}, así que no se puede decir que sea el único mejor.`:'No: se rechazó H₀ y Tukey separa los grupos.'],[`${F0.lv[A.means.reduce((b,m,i)=>(C.resp.goal==='max'?m<A.means[b]:m>A.means[b])?i:b,0)]}`,false,`No: ese tiene la peor media para el objetivo (${goalTxt(C)}).`]]}
        :{type:'mc',text:'¿Hace falta Tukey?',opts:[['No, porque no se rechazó H₀',true,'Correcto.'],['Sí, para saber cuál es el mejor',false,'Sin diferencias significativas, ningún tratamiento es “mejor” que otro.']]}});}
  else{const ab=A.rows.find(r=>r.key==='AB'),abSig=ab.p<ALPHA,best=A.best;
    steps.push({t:'Interpreta efectos e interacción',body:`<p>Si una <b>interacción</b> es significativa, los factores involucrados se interpretan <b>juntos</b> con el gráfico de perfil: líneas no paralelas indican interacción. Si no lo es, cada efecto principal se lee por separado.</p><div class="chart-wrap">${profile(C,A,W)}</div>
      <p class="note">Interacción ${ab.src}: Sig. = ${spP(ab.p)} → ${abSig?'<b>significativa</b>':'no significativa'}. Mejor combinación observada (${goalTxt(C)} ${C.resp.n.toLowerCase()}): <b>${cellName(C,best.lv)}</b> con media ${nf(best.m,3)}.</p>`,
      q:{type:'mc',text:'Según el gráfico y la Sig. de la interacción, ¿cómo se interpretan los dos primeros factores?',opts:[[abSig?'Juntos: el efecto de uno depende del nivel del otro':'Por separado: el efecto de uno no depende del otro',true,'Correcto.'],[abSig?'Por separado: cada uno se elige independientemente':'Juntos: el efecto de uno depende del otro',false,abSig?'No: con interacción significativa elegir cada factor por separado puede llevar a una combinación equivocada.':'No: la interacción no es significativa (líneas casi paralelas).']]}});}
  // render secuencial
  p.innerHTML=`<p class="ctx">${C.ctx}</p><ol class="lsteps" id="ls"></ol>`;const ol=$('#ls',p);let cur=0;
  function add(i){const s=steps[i],li=document.createElement('li');li.className='lstep';li.innerHTML=`<h4><span class="ln">${i+1}</span>${s.t}</h4>${s.body}<div class="lq"></div><div class="lafter" hidden></div>`;ol.appendChild(li);
    const q=s.q,box=li.querySelector('.lq'),after=li.querySelector('.lafter');const finish=()=>{if(s.after){after.innerHTML=s.after;after.hidden=false;}if(i+1<steps.length)add(i+1);else{const d=document.createElement('p');d.className='verdict ok';d.innerHTML='<b>Análisis completo.</b> Ahora practica leer la salida de SPSS (pestaña 4) y redactar la conclusión (pestaña 5).';ol.after(d);}};
    if(q.type==='mc'){box.innerHTML=`${q.text?`<p><b>${q.text}</b></p>`:''}<div class="opts">${q.opts.map((o,j)=>`<button type="button" class="opt" data-j="${j}">${o[0]}</button>`).join('')}</div><p class="fb"></p>`;
      box.querySelectorAll('.opt').forEach(b=>b.addEventListener('click',()=>{const o=q.opts[+b.dataset.j];box.querySelectorAll('.opt').forEach((x,j)=>{x.disabled=true;if(q.opts[j][1])x.classList.add('is-ok');});if(!o[1])b.classList.add('is-bad');box.querySelector('.fb').innerHTML=(o[1]?'<strong>Bien.</strong> ':'<strong>No.</strong> ')+(o[2]||'');finish();}));}
    else{box.innerHTML=`<p><b>${q.text}</b></p><div class="ans-row"><input class="inp" inputmode="decimal" aria-label="Respuesta"><button type="button" class="btn">Comprobar</button></div><p class="fb"></p>`;const inp=box.querySelector('input'),bt=box.querySelector('button');
      const go=()=>{const v=parseNum(inp.value);if(!Number.isFinite(v)){box.querySelector('.fb').textContent='Escribe un número.';return;}const ok=Math.abs(v-q.answer)<1e-6;inp.disabled=bt.disabled=true;inp.classList.add(ok?'good':'bad');box.querySelector('.fb').innerHTML=(ok?'<strong>Bien.</strong> ':'<strong>No.</strong> ')+q.explain;finish();};
      bt.addEventListener('click',go);inp.addEventListener('keydown',e=>{if(e.key==='Enter')go();});}}
  add(0);}

/* ---------------- Pestaña 4: Lee la salida ---------------- */
function readQs(C,A){const F0=C.fac[0],qs=[];const main=A.rows[0];
  if(C.design==='dca'){qs.push({t:`Toca el valor que usas para decidir si el <b>${F0.n.toLowerCase()}</b> afecta la ${C.resp.n.toLowerCase()}.`,k:['an.tr.p'],e:`Es la Sig. de “Entre grupos” en la tabla ANOVA: ${spP(main.p)}.`});
    qs.push({t:'Toca el valor que te dice si se cumple la <b>homogeneidad de varianzas</b>.',k:['lev.p'],e:`Es la Sig. de Levene: ${spP(A.levene.p)} (${A.levene.p>ALPHA?'&gt; 0,05, sí se cumple':'&lt; 0,05, no se cumple'}).`});
    qs.push({t:'Toca la <b>media cuadrática del error</b> (CM<sub>E</sub>), la que se usa en Tukey.',k:['an.err.ms'],e:'Es la media cuadrática de “Dentro de grupos”.'});
    const i=rint(0,A.k-2),j=rint(i+1,A.k-1);qs.push({t:`Toca la Sig. de Tukey que compara <b>${F0.lv[i]}</b> con <b>${F0.lv[j]}</b>.`,k:[`tk.${i}.${j}.p`],e:'Está en Comparaciones múltiples, en la fila de ese par (aparece dos veces, I-J y J-I; ambas valen).'});
    qs.push({t:'Toca el valor que indica si los residuos son <b>normales</b>.',k:['sw.p'],e:`Es la Sig. de Shapiro-Wilk: ${spP(A.sw.p)}.`});}
  else{qs.push({t:`Toca la Sig. que responde si ${C.fac.length>1?`la interacción <b>${A.rows.find(r=>r.key==='AB').src}</b> es significativa`:`el <b>${F0.n.toLowerCase()}</b> afecta la respuesta`}.`,k:[C.fac.length>1?'an.AB.p':'an.tr.p'],e:'Está en Pruebas de efectos inter-sujetos, en la fila de ese efecto, columna Sig.'});
    if(C.blk)qs.push({t:`Toca la Sig. que dice si el <b>bloque (${C.blk.n.toLowerCase()})</b> fue útil.`,k:['an.bl.p'],e:`Sig. del bloque = ${spP(A.rows[1].p)}: ${A.rows[1].p<ALPHA?'el bloque sí quitó variación importante.':'el bloque no aportó mucho, pero no invalida el experimento.'}`});
    qs.push({t:'Toca los <b>grados de libertad del error</b>.',k:['an.err.df'],e:`Fila Error, columna gl: ${A.err.df}.`});
    qs.push({t:'Toca el valor que dice qué porcentaje de la variación explica el modelo.',k:['r2'],e:`Es el R al cuadrado, al pie de la tabla: ${sp(A.R2,3)} → ${nf(A.R2*100,1)} %.`});
    qs.push({t:'Una fila de la tabla <b>no</b> se interpreta para el objetivo del experimento: tócala (su Sig.).',k:['an.int.p'],e:'La <b>Intersección</b> solo prueba si la media general es cero: no tiene interés práctico.'});
    if(C.fac.length>1)qs.push({t:`Toca la Sig. del efecto principal de <b>${C.fac[0].n}</b>.`,k:['an.A.p'],e:'Fila con el nombre del factor (sin asterisco).'});
    else qs.push({t:'Toca el valor que indica si los residuos son <b>normales</b>.',k:['sw.p'],e:`Shapiro-Wilk, Sig. = ${spP(A.sw.p)}.`});}
  return shuffle(qs).slice(0,4);}
function renderOutput(p,C,A,W){
  p.innerHTML=`<div class="spss-wrap"><div class="spss-bar"><span>Visor de resultados</span><span class="spss-menu">Archivo · Editar · Ver · Datos · Transformar · Insertar · Formato · <b>Analizar</b> · Gráficos · Utilidades</span></div><div class="spss-q" id="rq"></div><div class="spss-body" id="rout">${spssOutput(C,A).join('')}${C.fac.length>1?`<div class="spss-t"><div class="spss-title">Medias marginales estimadas de ${C.resp.n}</div><div class="spss-sub">Gráfico de perfil</div>${profile(C,A,Math.min(W,560))}</div>`:''}</div></div>
   <p class="note">SPSS en español muestra los decimales con coma y omite el cero inicial: <b>,003</b> es 0,003. Un Sig. de <b>,000</b> no es cero: significa que es menor que 0,0005.</p>`;
  const qs=readQs(C,A);let qi=0,tries=0;const rq=$('#rq',p);
  function ask(){p.querySelectorAll('[data-k]').forEach(c=>c.classList.remove('hit','miss','show'));if(qi>=qs.length){rq.innerHTML=`<b>¡Listo!</b> Respondiste las ${qs.length} preguntas. <button type="button" class="btn btn-ghost sm" id="rq-again">Repetir</button>`;$('#rq-again',p).addEventListener('click',()=>{qi=0;ask();});return;}
    tries=0;rq.innerHTML=`<span class="rq-n">${qi+1}/${qs.length}</span> ${qs[qi].t} <span class="rq-fb"></span>`;}
  p.querySelectorAll('#rout [data-k]').forEach(c=>{const h=()=>{if(qi>=qs.length)return;const q=qs[qi],k=c.dataset.k,ok=q.k.includes(k);
    if(ok){c.classList.add('hit');rq.querySelector('.rq-fb').innerHTML=`<b>Correcto.</b> ${q.e} <button type="button" class="btn sm" id="rq-next">Siguiente</button>`;$('#rq-next',p).addEventListener('click',()=>{qi++;ask();});}
    else{tries++;c.classList.add('miss');setTimeout(()=>c.classList.remove('miss'),700);if(tries>=2){p.querySelectorAll('[data-k]').forEach(x=>{if(q.k.includes(x.dataset.k))x.classList.add('show');});rq.querySelector('.rq-fb').innerHTML=`Es la celda marcada. ${q.e} <button type="button" class="btn sm" id="rq-next">Siguiente</button>`;$('#rq-next',p).addEventListener('click',()=>{qi++;ask();});}else rq.querySelector('.rq-fb').textContent='Esa no. Intenta otra vez.';}};
    c.addEventListener('click',h);c.addEventListener('keydown',e=>{if(e.key==='Enter')h();});});
  ask();}

/* ---------------- Pestaña 5: Interpreta y redacta ---------------- */
function renderInterpret(p,C,A){const F0=C.fac[0],fact=C.fac.length>1;const er=fact?A.rows.find(r=>r.key==='AB'):A.rows[0],rej=er.p<ALPHA;
  const best=fact?null:A.means.reduce((b,m,i)=>(C.resp.goal==='max'?m>A.means[b]:m<A.means[b])?i:b,0);
  const sel=(id,opts)=>`<select id="${id}" class="inl"><option value="">…</option>${opts.map(o=>`<option>${o}</option>`).join('')}</select>`;
  const subj=fact?`la interacción ${er.src}`:`el ${F0.n.toLowerCase()}`;
  const blanks=[['s1',['se rechaza','no se rechaza'],rej?'se rechaza':'no se rechaza'],['s2',['menor','mayor'],rej?'menor':'mayor'],['s3',['existe','no existe'],rej?'existe':'no existe']];
  let extra='';if(!fact&&rej){blanks.push(['s4',F0.lv,F0.lv[best]]);extra=` Según Tukey, el tratamiento con ${goalTxt(C)} ${C.resp.n.toLowerCase()} es ${sel('s4',F0.lv)}${A.letters.sets.filter(s=>s.includes(best))[0].length>1?', aunque comparte grupo con otros tratamientos':''}.`;}
  if(fact){const bc=cellName(C,A.best.lv),cands=shuffle(A.cells.map(c=>cellName(C,c.lv))).slice(0,4);if(!cands.includes(bc))cands[0]=bc;blanks.push(['s4',shuffle(cands),bc]);extra=` La combinación con ${goalTxt(C)} ${C.resp.n.toLowerCase()} fue ${sel('s4',shuffle(cands))}.`;}
  if(C.blk){const bs=A.rows[1].p<ALPHA;blanks.push(['s5',['sí fue','no fue'],bs?'sí fue':'no fue']);extra+=` El bloqueo por ${C.blk.n.toLowerCase()} ${sel('s5',['sí fue','no fue'])} significativo.`;}
  const model=fact?`Con α = 0,05, ${rej?'se rechaza':'no se rechaza'} H₀ para la interacción ${er.src} (F(${er.df}, ${A.err.df}) = ${nf(er.F,2)}; p ${er.p<0.001?'&lt; 0,001':'= '+nf(er.p,3)}), por lo que ${rej?'el efecto de un factor depende del nivel del otro y deben interpretarse juntos':'los efectos principales pueden interpretarse por separado'}. ${A.rows.filter(r=>r.key.length===1).map(r=>`${r.src}: ${r.p<ALPHA?'significativo':'no significativo'} (p ${r.p<0.001?'&lt; 0,001':'= '+nf(r.p,3)})`).join('; ')}. La combinación con ${goalTxt(C)} ${C.resp.n.toLowerCase()} fue ${cellName(C,A.best.lv)} (${nf(A.best.m,C.resp.dec+1)} ${C.resp.u}).`
    :`Con α = 0,05, ${rej?'se rechaza':'no se rechaza'} H₀ (F(${er.df}, ${A.err.df}) = ${nf(er.F,2)}; p ${er.p<0.001?'&lt; 0,001':'= '+nf(er.p,3)}). ${rej?`Existe evidencia de que el ${F0.n.toLowerCase()} afecta la ${C.resp.n.toLowerCase()}. Según Tukey, ${F0.lv[best]} presentó la ${goalTxt(C)} media (${nf(A.means[best],C.resp.dec+1)} ${C.resp.u})${A.letters.sets.filter(s=>s.includes(best))[0].length>1?`, sin diferencia significativa con ${A.letters.sets.filter(s=>s.includes(best))[0].filter(i=>i!==best).map(i=>F0.lv[i]).join(' y ')}`:', y difiere de los demás'}.`:`No existe evidencia de que el ${F0.n.toLowerCase()} afecte la ${C.resp.n.toLowerCase()}; las diferencias observadas pueden deberse al azar.`}${C.blk?` El bloqueo por ${C.blk.n.toLowerCase()} ${A.rows[1].p<ALPHA?'fue significativo, lo que confirma que controlarlo fue acertado':'no fue significativo'}.`:''}`;
  // afirmaciones con errores típicos
  const st=[[model.replace(/<[^>]+>/g,'').split('. ').slice(0,2).join('. ')+'.',true,'Es la conclusión correcta: decide con la Sig., habla de evidencia y usa el contexto.']];
  if(er.p<0.0005)st.push([`Como Sig. = ,000, la probabilidad de error es cero y el resultado es seguro.`,false,',000 no es cero: es un valor menor que 0,0005. Nunca hay certeza absoluta.']);
  else st.push([`Como F = ${nf(er.F,2)} es mayor que 1, ${rej?'se':'también se'} rechaza H₀.`,false,'F &gt; 1 no basta: se compara con el F crítico, o se mira la Sig.']);
  if(!rej)st.push([`Se acepta H₀: está demostrado que ${fact?'no hay interacción':`todos los ${F0.n.toLowerCase()}s producen exactamente la misma ${C.resp.n.toLowerCase()}`}.`,false,'No rechazar H₀ no demuestra igualdad: solo indica que no hay evidencia suficiente de diferencia.']);
  else st.push([fact?`Como cada factor es significativo, se elige el mejor nivel de cada uno por separado sin mirar la interacción.`:`Como se rechazó H₀, todos los ${F0.n.toLowerCase()}s son diferentes entre sí.`,false,fact?'Con interacción significativa, el mejor nivel de un factor depende del otro: se elige la mejor combinación.':'Rechazar H₀ significa que al menos uno difiere. Cuáles difieren lo dice Tukey.']);
  if(C.blk)st.push([`Como el bloque ${A.rows[1].p<ALPHA?'es significativo, el experimento salió mal':'no es significativo, el experimento está mal planteado'}.`,false,'El bloque no es el objetivo: si es significativo, el bloqueo ayudó; si no, simplemente no aportó mucho.']);
  else st.push([`${fact?cellName(C,A.best.lv):F0.lv[best??0]} es el mejor porque su media es la ${goalTxt(C)}, sin necesidad de prueba estadística.`,false,'Una media mayor (o menor) puede ser solo azar: hace falta la prueba y, con varios tratamientos, Tukey.']);
  p.innerHTML=`<div class="part"><h3 class="sub">A. Completa la conclusión</h3><p class="ctx">${C.ctx}</p><p class="note">Datos clave de la salida: ${A.rows.filter(r=>r.key!=='err').map(r=>`${r.src}: F = ${sp(r.F,3)}, Sig. = ${spP(r.p)}`).join(' · ')}</p>
     <p class="build">Con un nivel de significancia de 0,05, ${sel('s1',['se rechaza','no se rechaza'])} H₀ para ${subj}, porque la Sig. (${spP(er.p)}) es ${sel('s2',['menor','mayor'])} que 0,05. Por lo tanto, ${sel('s3',['existe','no existe'])} evidencia de ${fact?'interacción entre los factores':`que el ${F0.n.toLowerCase()} afecta la ${C.resp.n.toLowerCase()}`}.${extra}</p>
     <div class="btn-row"><button type="button" class="btn" id="b-ok">Comprobar</button></div><div id="b-fb"></div></div>
   <div class="part"><h3 class="sub">B. ¿Cuál conclusión está bien escrita?</h3><div class="opts" id="st">${shuffle(st).map(s=>`<button type="button" class="opt" data-ok="${s[1]}" data-e="${esc(s[2])}">${s[0]}</button>`).join('')}</div><p class="fb" id="st-fb"></p></div>`;
  $('#b-ok',p).addEventListener('click',()=>{let all=true,miss=false;blanks.forEach(([id,,ans])=>{const s=$('#'+id,p);if(!s)return;if(!s.value)miss=true;const ok=s.value===ans;s.classList.toggle('bad',!ok);s.classList.toggle('good',ok);if(!ok)all=false;});
    $('#b-fb',p).innerHTML=miss&&!all?'<p class="fb">Completa todos los espacios.</p>':all?`<p class="verdict ok"><b>Muy bien.</b> Así quedaría en un informe:</p><div class="formula" style="font-family:var(--f-body)">${model}</div>`:'<p class="fb">Revisa los espacios en rojo. Recuerda: si Sig. &lt; 0,05 se rechaza H₀.</p>';});
  p.querySelectorAll('#st .opt').forEach(b=>b.addEventListener('click',()=>{const ok=b.dataset.ok==='true';p.querySelectorAll('#st .opt').forEach(x=>{x.disabled=true;if(x.dataset.ok==='true')x.classList.add('is-ok');});if(!ok)b.classList.add('is-bad');
    $('#st-fb',p).innerHTML=(ok?'<strong>Correcto.</strong> ':'<strong>Esa tiene un error:</strong> ')+b.dataset.e;}));}

/* ---------------- Pestaña 6: Datos para SPSS ---------------- */
function renderData(p,C,A){const des=C.design,steps=MENU[des==='f2'||des==='f3'?'f':des],syn=syntax(C),er=A.rows.filter(r=>r.key!=='err');
  p.innerHTML=`<p class="ctx">Lleva este mismo caso a SPSS y comprueba que obtienes lo mismo. Descarga el archivo según cómo use los decimales tu computadora (si no sabes, revisa el tema <b>1.3</b>).</p>
   <div class="btn-row"><button type="button" class="btn" data-d=",">Descargar CSV · decimal con coma</button><button type="button" class="btn btn-ghost" data-d=".">Descargar CSV · decimal con punto</button></div><p class="fb" id="dl-fb"></p>
   <h3 class="sub">Deberías obtener</h3><div class="readouts">${er.map(r=>`<div class="ro"><span>${r.src}</span><b>F = ${sp(r.F,3)} · Sig. = ${spP(r.p)}</b></div>`).join('')}<div class="ro"><span>Error</span><b>gl = ${A.err.df} · CM = ${sp(A.err.ms,3)}</b></div></div>
   <h3 class="sub">Pasos en SPSS</h3><ol class="menu-steps">${steps.map(s=>`<li><b>${s[0]}.</b> ${s[1]} <span class="en">(${s[2]})</span></li>`).join('')}</ol>
   <details class="manual"><summary>Ver la sintaxis (Archivo → Nuevo → Sintaxis, pegar y ejecutar)</summary><pre class="code-box syn">${esc(syn)}</pre><div class="btn-row"><button type="button" class="btn btn-ghost" id="syn-c">Copiar sintaxis</button></div><p class="note">Antes de ejecutarla, importa el CSV. La sintaxis pone etiquetas y medidas, corre el análisis y revisa la normalidad de los residuos.</p></details>`;
  p.querySelectorAll('[data-d]').forEach(b=>b.addEventListener('click',()=>{const ok=downloadText(`${C.resp.var}_${des}_${b.dataset.d===','?'coma':'punto'}.csv`,csv(C,b.dataset.d));$('#dl-fb',p).textContent=ok?'Archivo descargado.':'Tu navegador no permitió la descarga.';}));
  $('#syn-c',p).addEventListener('click',async e=>{e.target.textContent=await copyText(syn)?'Copiada ✓':'Selecciona y copia manualmente';});}

/* ---------------- Laboratorio completo ---------------- */
function lab(box,design){
  box.innerHTML=`<div class="lab-head"><p class="note">Caso de práctica generado al azar. Todas las pestañas usan el mismo caso.</p><button type="button" class="btn btn-ghost sm" id="lab-new">Nuevo caso</button></div><div id="lab-t"></div>`;
  let C,A,T;const W=()=>cw(box);
  function build(){C=GEN[design]();A=analyze(C);
    T=tabsUI($('#lab-t',box),[{label:'¿Cuándo se usa?',render:p=>renderWhen(p,design)},{label:'Organiza los datos',render:p=>renderOrganize(p,C)},{label:'Analiza paso a paso',render:p=>renderAnalyze(p,C,A,W())},{label:'Lee la salida',render:p=>renderOutput(p,C,A,W())},{label:'Interpreta y redacta',render:p=>renderInterpret(p,C,A)},{label:'Datos para SPSS',render:p=>renderData(p,C,A)}]);}
  $('#lab-new',box).addEventListener('click',()=>{const cur=[...box.querySelectorAll('.ltabs button')].findIndex(b=>b.getAttribute('aria-selected')==='true');build();T.show(cur<0?0:cur);});
  build();return null;}

return{GEN,analyze,lab,sp,spP,DN,DLONG,WHEN,MINI,spssOutput,csv,syntax,profile,ALPHA};
})();
