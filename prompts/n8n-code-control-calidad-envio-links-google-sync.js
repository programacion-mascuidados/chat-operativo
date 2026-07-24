// Envío Links Google — Google Sheets → Postgres
// Sheet: Área Control de Calidad (Envio de Links de Google)
// Mode del nodo Code: "Run Once for All Items"
// Postgres siguiente nodo: Execute Query → {{ $json.query }}

const items = $input.all();

if (items.length === 0) {
  return [{ json: { query: '-- No hay datos en envio links google' } }];
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

const filasSQL = items.map((item) => {
  const lookup = buildLookup(item.json);
  return `(
    ${nullable(pick(lookup, 'NOMBRE DEL CLIENTE'))},
    ${nullable(pick(lookup, 'TIPO DE SERVICIO'))},
    ${nullable(pick(lookup, 'SEDE'))},
    ${nullable(pick(lookup, 'RESPONSABLE'))},
    ${nullable(pick(lookup, 'FECHA DE ENVÍO DE LINK', 'FECHA DE ENVIO DE LINK'))},
    ${nullable(pick(lookup, '¿DEJO RESEÑA?', 'DEJO RESEÑA'))}
  )`;
});

const query = `
TRUNCATE TABLE area_control_calidad_envio_links_google;
INSERT INTO area_control_calidad_envio_links_google (
  nombre_del_cliente,
  tipo_de_servicio,
  sede,
  responsable,
  fecha_de_envio_de_link,
  dejo_resena
) VALUES
${filasSQL.join(',\n')};
`;

return [{ json: { query } }];
