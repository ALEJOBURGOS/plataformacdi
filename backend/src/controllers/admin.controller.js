const pool = require("../config/db");
const bcrypt = require("bcrypt");

exports.getAdminStats = async (req, res) => {
  try {
    const totalNinos = await pool.query(
      `SELECT COUNT(*) FROM ninos WHERE estado = true`
    );

    const totalDocentes = await pool.query(
      `SELECT COUNT(*) FROM usuarios WHERE id_rol = 2 AND estado = true`
    );

    const totalUsuarios = await pool.query(
      `SELECT COUNT(*) FROM usuarios WHERE estado = true`
    );

    res.json({
      totalNinos: parseInt(totalNinos.rows[0].count),
      totalDocentes: parseInt(totalDocentes.rows[0].count),
      totalUsuarios: parseInt(totalUsuarios.rows[0].count),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo estadísticas" });
  }
};

// ==========================================
// CREAR DOCENTE
// ==========================================
exports.createDocente = async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({
        message: "Correo inválido"
      });
    }

    // Verificar si el correo ya existe
    const userExists = await pool.query(
      "SELECT * FROM usuarios WHERE correo = $1",
      [correo]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        message: "El correo ya está registrado"
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Rol 2 = Docente
    const id_rol = 2;

    const result = await pool.query(
      `INSERT INTO usuarios (nombre, correo, password, id_rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id_usuario, nombre, correo, id_rol`,
      [nombre, correo, hashedPassword, id_rol]
    );

    const docente = result.rows[0];

    res.status(201).json({
      message: "Docente creado correctamente",
      docente
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// OBTENER TODOS LOS DOCENTES
// ==========================================
exports.getAllDocentes = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.correo, u.id_rol, u.estado, u.id_grupo, g.nombre as nombre_grupo
       FROM usuarios u
       LEFT JOIN grupos g ON u.id_grupo = g.id_grupo
       WHERE u.id_rol = 2
       ORDER BY u.nombre`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo docentes" });
  }
};

// ==========================================
// OBTENER TODOS LOS GRUPOS
// ==========================================
exports.getAllGrupos = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id_grupo, nombre, edad_minima, edad_maxima, activo 
       FROM grupos 
       WHERE activo = TRUE 
       ORDER BY nombre`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo grupos" });
  }
};

// ==========================================
// ASIGNAR GRUPO A DOCENTE
// ==========================================
exports.asignarGrupoDocente = async (req, res) => {
  try {
    const { id_docente, id_grupo } = req.body;

    if (!id_docente) {
      return res.status(400).json({ message: "ID del docente es requerido" });
    }

    // Verificar que el docente exista
    const docenteExists = await pool.query(
      "SELECT id_usuario, nombre FROM usuarios WHERE id_usuario = $1 AND id_rol = 2",
      [id_docente]
    );

    if (docenteExists.rows.length === 0) {
      return res.status(404).json({ message: "Docente no encontrado" });
    }

    // Verificar que el grupo exista (si se proporciona)
    if (id_grupo) {
      const grupoExists = await pool.query(
        "SELECT id_grupo FROM grupos WHERE id_grupo = $1",
        [id_grupo]
      );

      if (grupoExists.rows.length === 0) {
        return res.status(404).json({ message: "Grupo no encontrado" });
      }
    }

    // Actualizar el grupo del docente
    const result = await pool.query(
      `UPDATE usuarios 
       SET id_grupo = $1 
       WHERE id_usuario = $2 
       RETURNING id_usuario, nombre, id_grupo`,
      [id_grupo || null, id_docente]
    );

    res.json({
      message: id_grupo ? "Grupo asignado correctamente" : "Grupo removido correctamente",
      docente: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error asignando grupo" });
  }
};
