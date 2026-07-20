// Supervisiones — Google Sheets → Postgres (formulario completo)
// Mode del nodo Code: "Run Once for All Items"
// Postgres Transferir4: Execute Query → {{ $json.query }} (con fx activado)

const TEST_MODE = false;
const items = $input.all();

if (items.length === 0) {
  return [{ json: { query: '-- No hay datos en supervisiones' } }];
}

function txt(val) {
  return (val ?? '').toString().replace(/'/g, "''").trim();
}

function nullable(val) {
  const cleaned = txt(val);
  return cleaned ? `'${cleaned}'` : 'NULL';
}

function normKey(k) {
  return (k ?? '')
    .toString()
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

function buildLookup(raw) {
  const lookup = {};
  for (const [key, value] of Object.entries(raw || {})) {
    lookup[normKey(key)] = value;
  }
  return lookup;
}

function pick(lookup, ...aliases) {
  for (const alias of aliases) {
    const val = lookup[normKey(alias)];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      return val;
    }
  }
  return '';
}

function pickContains(lookup, fragment) {
  const frag = normKey(fragment);
  for (const [k, v] of Object.entries(lookup)) {
    if (k.includes(frag) && v !== undefined && v !== null && String(v).trim() !== '') {
      return v;
    }
  }
  return '';
}

function tsOrNull(val) {
  const raw = (val ?? '').toString().trim();
  if (!raw) return 'NULL';
  if (/^\d+(\.\d+)?$/.test(raw)) {
    return `TO_TIMESTAMP(${raw} * 86400 + TIMESTAMPTZ '1899-12-30')`;
  }
  return `'${raw.replace(/'/g, "''")}'::TIMESTAMP`;
}

function dateOrNull(val) {
  const raw = (val ?? '').toString().trim();
  return raw ? `'${raw.replace(/'/g, "''")}'::DATE` : 'NULL';
}

function rowValues(lookup) {
  const marcaRaw =
    pick(lookup, 'o', 'Marca temporal', 'marca_temporal', 'Timestamp') ||
    pickContains(lookup, 'MARCA TEMPORAL');

  const responsable =
    pick(lookup, 'RESPONSABLE AL MOMENTO DE LA SUPERVISIÓN', 'RESPONSABLE AL MOMENTO DE LA SUPERVISION') ||
    pickContains(lookup, 'RESPONSABLE AL MOMENTO');

  const supervisor =
    pick(lookup, 'SUPERVISOR/A', 'SUPERVISOR') || responsable;

  const beneficiario =
    pick(lookup, 'NOMBRE DEL BENEFICIARIO', 'BENEFICIARIO') ||
    pickContains(lookup, 'NOMBRE DEL BENEFICIARIO');

  const prestador =
    pick(lookup, 'NOMBRE DEL PRESTADOR/A', 'NOMBRE DEL PRESTADOR') ||
    pickContains(lookup, 'NOMBRE DEL PRESTADOR');

  const observaciones =
    pick(lookup, 'OBSERVACIONES - DETALLAR', 'OBSERVACIONES - DETALLAR ', 'OBSERVACIONES') ||
    pick(lookup, 'DETALLAR SITUACIÓN DETECTADA', 'DETALLAR SITUACION DETECTADA');

  return [
    // Identificación y contexto
    tsOrNull(marcaRaw),
    nullable(beneficiario),
    nullable(prestador),
    dateOrNull(pick(lookup, 'FECHA DE SUPERVISÍÓN', 'FECHA DE SUPERVISION')),
    nullable(supervisor),
    nullable(responsable),
    nullable(pick(lookup, 'SEDE', 'SEDE ') || pickContains(lookup, 'SEDE')),
    nullable(
      pick(lookup, 'DOMICILIO/INSTITUCIÓN', 'DOMICILIO/INSTITUCION') ||
        pickContains(lookup, 'DOMICILIO')
    ),
    nullable(pick(lookup, 'PATOLOGÍA', 'PATOLOGIA') || pickContains(lookup, 'PATOLOGIA')),
    nullable(
      pick(
        lookup,
        'TIPO DE MEDICACIÓN \n¿Que vía? ¿Quién la suministra?',
        'TIPO DE MEDICACION \n¿Que vía? ¿Quién la suministra?',
        'TIPO DE MEDICACION'
      ) || pickContains(lookup, 'TIPO DE MEDICACION')
    ),
    nullable(pick(lookup, 'MOVILIDAD') || pickContains(lookup, 'MOVILIDAD')),
    nullable(pick(lookup, 'LUCIDEZ') || pickContains(lookup, 'LUCIDEZ')),
    nullable(pick(lookup, 'ESTADO ANÍMICO', 'ESTADO ANIMICO') || pickContains(lookup, 'ESTADO ANIMICO')),
    nullable(
      pick(
        lookup,
        '¿PRESENTA DOLORES O MOLESTIAS ACTUALMENTE? Detallar',
        'PRESENTA DOLORES O MOLESTIAS'
      ) || pickContains(lookup, 'DOLORES O MOLESTIAS')
    ),
    nullable(pick(lookup, 'HIGIENE') || pickContains(lookup, 'HIGIENE')),
    nullable(pick(lookup, 'ALIMENTACIÓN', 'ALIMENTACION', 'ALIMENTACIÓN ') || pickContains(lookup, 'ALIMENTACION')),
    nullable(pick(lookup, 'DORMITORIO') || pickContains(lookup, 'DORMITORIO')),
    nullable(pick(lookup, 'BAÑO', 'BANO') || pickContains(lookup, 'BANO')),
    nullable(pick(lookup, 'COCINA') || pickContains(lookup, 'COCINA')),
    nullable(
      pick(lookup, 'ELEMENTOS HIGIENE PERSONAL') || pickContains(lookup, 'ELEMENTOS HIGIENE PERSONAL')
    ),
    nullable(pick(lookup, 'ELEMENTOS DE LIMPIEZA') || pickContains(lookup, 'ELEMENTOS DE LIMPIEZA')),
    nullable(observaciones),
    nullable(pick(lookup, 'ÁREA DE COORDINACIÓN', 'AREA DE COORDINACION') || pickContains(lookup, 'AREA DE COORDINACION')),
    nullable(pick(lookup, 'ÁREA DE COMERCIAL', 'AREA DE COMERCIAL') || pickContains(lookup, 'AREA DE COMERCIAL')),
    // Evaluación del prestador (formulario actual)
    nullable(pick(lookup, 'PRESENCIA') || pickContains(lookup, 'PRESENCIA')),
    nullable(pick(lookup, 'AMBO DE LA EMPRESA') || pickContains(lookup, 'AMBO DE LA EMPRESA')),
    nullable(pick(lookup, 'UÑAS', 'UNAS') || pickContains(lookup, 'UNAS')),
    nullable(pick(lookup, 'HIGIENE PERSONAL') || pickContains(lookup, 'HIGIENE PERSONAL')),
    nullable(pick(lookup, 'PIERCINGS / BIJUTERIE') || pickContains(lookup, 'PIERCINGS')),
    nullable(pick(lookup, 'CALZADO') || pickContains(lookup, 'CALZADO')),
    nullable(pick(lookup, 'ACTITUD') || pickContains(lookup, 'ACTITUD')),
    nullable(pick(lookup, 'PREDISPOSICIÓN', 'PREDISPOSICION') || pickContains(lookup, 'PREDISPOSICION')),
    nullable(pick(lookup, 'COMUNICACIÓN', 'COMUNICACION') || pickContains(lookup, 'COMUNICACION')),
    nullable(pick(lookup, 'PROFESIONALISMO') || pickContains(lookup, 'PROFESIONALISMO')),
    nullable(
      pick(lookup, 'VÍNCULO CON EL PACIENTE', 'VINCULO CON EL PACIENTE') ||
        pickContains(lookup, 'VINCULO CON EL PACIENTE')
    ),
    nullable(
      pick(lookup, 'VÍNCULO CON LA FAMILIA', 'VINCULO CON LA FAMILIA') ||
        pickContains(lookup, 'VINCULO CON LA FAMILIA')
    ),
    nullable(
      pick(lookup, 'ÓRDEN DEL ESPACIO DE TRABAJO', 'ORDEN DEL ESPACIO DE TRABAJO') ||
        pickContains(lookup, 'ORDEN DEL ESPACIO')
    ),
    nullable(
      pick(lookup, 'CUMPLIMIENTO DE INDICACIONES') || pickContains(lookup, 'CUMPLIMIENTO DE INDICACIONES')
    ),
    nullable(pick(lookup, 'PUNTUALIDAD') || pickContains(lookup, 'PUNTUALIDAD')),
    nullable(
      pick(lookup, '¿SE DETECTÓ UNA SITUACION CRÍTICA?', '¿SE DETECTÓ UNA SITUACION CRITICA?') ||
        pickContains(lookup, 'SITUACION CRITICA')
    ),
    nullable(
      pick(lookup, 'TIPO DE SITUACIÓN (Responder solo si corresponde)', 'TIPO DE SITUACION (Responder solo si corresponde)') ||
        pickContains(lookup, 'TIPO DE SITUACION')
    ),
    nullable(pick(lookup, 'ACCIÓN REQUERIDA', 'ACCION REQUERIDA') || pickContains(lookup, 'ACCION REQUERIDA')),
    nullable(
      pick(lookup, 'DETALLAR SITUACIÓN DETECTADA', 'DETALLAR SITUACION DETECTADA') ||
        pickContains(lookup, 'DETALLAR SITUACION')
    ),
  ];
}

if (TEST_MODE) {
  return [
    {
      json: {
        query: `BEGIN;
INSERT INTO supervisiones_formulario_paciente_prestador_respuestas (marca_temporal, actitud)
VALUES (NOW(), 'PRUEBA_SYNC_OK');
COMMIT;`,
      },
    },
  ];
}

const firstLookup = buildLookup(items[0].json);
const firstValues = rowValues(firstLookup);

const filasSQL = items
  .map(function (item) {
    return '(' + rowValues(buildLookup(item.json)).join(', ') + ')';
  })
  .join(',\n');

const queryFinal = `
BEGIN;
SET datestyle = 'ISO, DMY';
TRUNCATE TABLE supervisiones_formulario_paciente_prestador_respuestas;
INSERT INTO supervisiones_formulario_paciente_prestador_respuestas (
  marca_temporal,
  nombre_del_beneficiario,
  nombre_del_prestador_a,
  fecha_de_supervision,
  supervisor_a,
  responsable_al_momento_de_la_supervision,
  sede,
  domicilio_institucion,
  patologia,
  tipo_medicacion_via_suministro,
  movilidad,
  lucidez,
  estado_animico,
  presenta_dolores_molestias_detallar,
  higiene,
  alimentacion,
  dormitorio,
  banio,
  cocina,
  elementos_higiene_personal,
  elementos_de_limpieza,
  observaciones_detallar,
  area_de_coordinacion,
  area_de_comercial,
  presencia,
  ambo_de_la_empresa,
  unas,
  higiene_personal,
  piercings_bijuterie,
  calzado,
  actitud,
  predisposicion,
  comunicacion,
  profesionalismo,
  vinculo_con_el_paciente,
  vinculo_con_la_familia,
  orden_del_espacio_de_trabajo,
  cumplimiento_de_indicaciones,
  puntualidad,
  se_detecto_situacion_critica,
  tipo_de_situacion,
  accion_requerida,
  detallar_situacion_detectada
) VALUES
${filasSQL};
COMMIT;
`;

return [
  {
    json: {
      query: queryFinal,
      debug_filas: items.length,
      debug_todas_las_claves_del_sheet: Object.keys(items[0].json || {}),
      debug_beneficiario: pick(firstLookup, 'NOMBRE DEL BENEFICIARIO') || '(no viene en esta fila)',
      debug_prestador: pick(firstLookup, 'NOMBRE DEL PRESTADOR/A') || '(no viene en esta fila)',
      debug_actitud: pick(firstLookup, 'ACTITUD'),
      debug_responsable: pick(firstLookup, 'RESPONSABLE AL MOMENTO DE LA SUPERVISIÓN'),
      debug_nota:
        'ACTITUD del Sheet → columna actitud. RESPONSABLE → responsable_al_momento_de_la_supervision. Son distintos de nombre_del_beneficiario.',
    },
  },
];
