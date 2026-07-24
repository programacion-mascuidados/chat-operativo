BEGIN;

-- ============================================================
-- Sheet: Área Control de Calidad (Protocolo Fallecimiento)
-- ============================================================
CREATE TABLE IF NOT EXISTS area_control_calidad_protocolo_fallecimiento (
  id SERIAL PRIMARY KEY,
  nombre_del_cliente TEXT,
  tipo_de_servicio TEXT,
  sede VARCHAR(100),
  responsable TEXT,
  fecha_de_fallecimiento DATE,
  receptor TEXT,
  envio_de_condolencias VARCHAR(20),
  respuesta TEXT
);

CREATE INDEX IF NOT EXISTS idx_cc_protocolo_fallecimiento_fecha
  ON area_control_calidad_protocolo_fallecimiento (fecha_de_fallecimiento);

CREATE INDEX IF NOT EXISTS idx_cc_protocolo_fallecimiento_sede
  ON area_control_calidad_protocolo_fallecimiento (sede);

-- ============================================================
-- Sheet: Área Control de Calidad (Envio de Links de Google)
-- ============================================================
CREATE TABLE IF NOT EXISTS area_control_calidad_envio_links_google (
  id SERIAL PRIMARY KEY,
  nombre_del_cliente TEXT,
  tipo_de_servicio TEXT,
  sede VARCHAR(100),
  responsable TEXT,
  fecha_de_envio_de_link TEXT,
  dejo_resena TEXT
);

CREATE INDEX IF NOT EXISTS idx_cc_envio_links_sede
  ON area_control_calidad_envio_links_google (sede);

COMMIT;
