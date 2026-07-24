BEGIN;

-- ============================================================
-- PASO 1: Renombrar tabla existente (bajas)
-- Antes: area_operativa_ref_candela
-- Ahora: area_operativa_ref_candela_bajas
-- ============================================================
ALTER TABLE IF EXISTS area_operativa_ref_candela
  RENAME TO area_operativa_ref_candela_bajas;

-- Si ya ejecutaste una migración previa con otro nombre, limpiar:
-- DROP TABLE IF EXISTS area_operativa_ref_candela_altas_prestadores;

-- ============================================================
-- PASO 2: Columna nueva en bajas (Sheet: Bajas prestadores)
-- ============================================================
ALTER TABLE area_operativa_ref_candela_bajas
  ADD COLUMN IF NOT EXISTS tipo_de_entrevista VARCHAR(100);

-- ============================================================
-- PASO 3: Tabla nueva de altas
-- Sheet: Área Operativa - REF.Candela (Altasprestadores)
-- ============================================================
CREATE TABLE IF NOT EXISTS area_operativa_ref_candela_altas (
  id SERIAL PRIMARY KEY,
  fecha_de_ingreso DATE,
  sede VARCHAR(50),
  sigue_activo VARCHAR(20),
  reclutadora TEXT,
  nombre_del_prestador TEXT,
  tipo_de_entrevista VARCHAR(100),
  motivo TEXT
);

CREATE INDEX IF NOT EXISTS idx_operativa_altas_fecha
  ON area_operativa_ref_candela_altas (fecha_de_ingreso);

CREATE INDEX IF NOT EXISTS idx_operativa_altas_sede
  ON area_operativa_ref_candela_altas (sede);

COMMIT;
