// Afiliados que usaron el servicio — Google Sheets → Postgres
// Sheet: Área Admin y Renov - JEF.Denise (Afiliados que usaron el servicio)
// Mode del nodo Code: "Run Once for All Items"
// Postgres siguiente nodo: Execute Query → {{ $json.query }}

const items = $input.all();

if (items.length === 0) {
  return [{ json: { query: '-- No hay datos en afiliados servicio utilizado' } }];
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

const filasSQL = items
  .map((item) => {
    const lookup = buildLookup(item.json);
    const afiliado = pick(lookup, 'AFILIADO', 'NOMBRE DEL AFILIADO');
    if (!afiliado) return null;

    return `(
    ${nullable(pick(lookup, 'SEDE'))},
    ${nullable(afiliado)},
    ${nullable(pick(lookup, 'SERVICIO UTILIZADO', 'SERVICIO'))},
    ${nullable(pick(lookup, 'PLAN'))},
    ${dateOrNull(pick(lookup, 'FECHA DE INGRESO'))},
    ${nullable(pick(lookup, 'DIAS UTILIZADOS', 'DÍAS UTILIZADOS'))}
  )`;
  })
  .filter(Boolean);

if (filasSQL.length === 0) {
  return [{ json: { query: '-- Sin filas válidas (faltaba AFILIADO)' } }];
}

const query = `
TRUNCATE TABLE area_admin_y_renov_jef_denise_afiliados_servicio_utilizado;
INSERT INTO area_admin_y_renov_jef_denise_afiliados_servicio_utilizado (
  sede,
  afiliado,
  servicio_utilizado,
  plan,
  fecha_de_ingreso,
  dias_utilizados
) VALUES
${filasSQL.join(',\n')};
`;

return [{ json: { query } }];
