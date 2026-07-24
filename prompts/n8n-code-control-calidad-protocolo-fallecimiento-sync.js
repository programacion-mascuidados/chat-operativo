// Protocolo Fallecimiento — Google Sheets → Postgres
// Sheet: Área Control de Calidad (Protocolo Fallecimiento)
// Mode del nodo Code: "Run Once for All Items"
// Postgres siguiente nodo: Execute Query → {{ $json.query }}

const items = $input.all();

if (items.length === 0) {
  return [{ json: { query: '-- No hay datos en protocolo fallecimiento' } }];
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

function dateOrNull(val) {
  const raw = (val ?? '').toString().trim();
  if (!raw) return 'NULL';
  const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const dd = m[1].padStart(2, '0');
    const mm = m[2].padStart(2, '0');
    const yyyy = m[3];
    return `'${yyyy}-${mm}-${dd}'::DATE`;
  }
  return `'${raw.replace(/'/g, "''")}'::DATE`;
}

const filasSQL = items.map((item) => {
  const lookup = buildLookup(item.json);
  return `(
    ${nullable(pick(lookup, 'NOMBRE DEL CLIENTE'))},
    ${nullable(pick(lookup, 'TIPO DE SERVICIO'))},
    ${nullable(pick(lookup, 'SEDE'))},
    ${nullable(pick(lookup, 'RESPONSABLE'))},
    ${dateOrNull(pick(lookup, 'FECHA DE FALLECIMIENTO'))},
    ${nullable(pick(lookup, 'RECEPTOR'))},
    ${nullable(pick(lookup, 'ENVIO DE CONDOLENCIAS', 'ENVÍO DE CONDOLENCIAS'))},
    ${nullable(pick(lookup, 'RESPUESTA', 'RESPUESTA '))}
  )`;
});

const query = `
TRUNCATE TABLE area_control_calidad_protocolo_fallecimiento;
INSERT INTO area_control_calidad_protocolo_fallecimiento (
  nombre_del_cliente,
  tipo_de_servicio,
  sede,
  responsable,
  fecha_de_fallecimiento,
  receptor,
  envio_de_condolencias,
  respuesta
) VALUES
${filasSQL.join(',\n')};
`;

return [{ json: { query } }];
