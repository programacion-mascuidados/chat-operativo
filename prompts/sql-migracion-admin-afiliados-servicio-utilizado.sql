BEGIN;

-- ============================================================
-- Área Admin y Renov - JEF.Denise
-- Sheet: Afiliados que usaron el servicio
-- ============================================================
CREATE TABLE IF NOT EXISTS area_admin_y_renov_jef_denise_afiliados_servicio_utilizado (
  id SERIAL PRIMARY KEY,
  sede VARCHAR(50),
  afiliado TEXT,
  servicio_utilizado TEXT,
  plan TEXT,
  fecha_de_ingreso DATE,
  dias_utilizados TEXT
);

CREATE INDEX IF NOT EXISTS idx_admin_afiliados_servicio_fecha
  ON area_admin_y_renov_jef_denise_afiliados_servicio_utilizado (fecha_de_ingreso);

CREATE INDEX IF NOT EXISTS idx_admin_afiliados_servicio_sede
  ON area_admin_y_renov_jef_denise_afiliados_servicio_utilizado (sede);

CREATE INDEX IF NOT EXISTS idx_admin_afiliados_servicio_plan
  ON area_admin_y_renov_jef_denise_afiliados_servicio_utilizado (plan);

COMMIT;
