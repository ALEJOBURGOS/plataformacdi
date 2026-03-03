-- ============================================
-- TABLAS ADICIONALES PARA PLATAFORMA CDI
-- ============================================

-- Agregar columnas necesarias a tablas existentes
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS id_grupo INTEGER REFERENCES grupos(id_grupo);
ALTER TABLE grupos ADD COLUMN IF NOT EXISTS horario VARCHAR(100);

-- Tabla de reportes para el sistema CDI
CREATE TABLE IF NOT EXISTS reportes (
    id_reporte SERIAL PRIMARY KEY,
    id_docente INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'general', -- general, queja, sugerencia, emergencia
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, atendido, rechazado
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE reportes IS 'Tabla para almacenar reportes y quejas enviados por docentes';

