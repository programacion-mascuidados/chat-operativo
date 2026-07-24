// Bajas prestadores — Google Sheets → Postgres
// Sheet: Área Operativa - REF.Candela (Bajas prestadores)
// Mode del nodo Code: "Run Once for All Items"
// Postgres siguiente nodo: Execute Query → {{ $json.query }}

const items = $input.all();

if (items.length === 0) {
  return [{ json: { query: '-- No hay datos en bajas prestadores' } }];
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
    ${nullable(pick(lookup, 'MES DE BAJA'))},
    ${nullable(pick(lookup, 'SEDE'))},
    ${dateOrNull(pick(lookup, 'FECHA DE ALTA'))},
    ${dateOrNull(pick(lookup, 'FECHA DE BAJA'))},
    ${nullable(pick(lookup, 'RECLUTADORA'))},
    ${nullable(pick(lookup, 'NOMBRE DEL PRESTADOR'))},
    ${nullable(pick(lookup, 'TIPO DE ENTREVISTA'))},
    ${nullable(pick(lookup, 'MOTIVO'))}
  )`;
});

const query = `
TRUNCATE TABLE area_operativa_ref_candela_bajas;
INSERT INTO area_operativa_ref_candela_bajas (
  mes_de_baja,
  sede,
  fecha_de_alta,
  fecha_de_baja,
  reclutadora,
  nombre_del_prestador,
  tipo_de_entrevista,
  motivo
) VALUES
${filasSQL.join(',\n')};
`;

return [{ json: { query } }];
