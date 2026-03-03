const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const { verifyToken, hasRole } = require("../middlewares/auth.middleware");
const {
  getDashboardDocente,
  importarEstudiantes,
  getEstudiantesAsistencia,
  registrarAsistencia,
  crearReporte,
  getReportesAdmin,
  actualizarReporte
} = require("../controllers/docente.controller");

// Rutas para docentes (rol 2)
router.get("/dashboard", verifyToken, hasRole(2), getDashboardDocente);
router.post("/importar", verifyToken, hasRole(2), upload.single("archivo"), importarEstudiantes);
router.get("/estudiantes", verifyToken, hasRole(2), getEstudiantesAsistencia);
router.post("/asistencia", verifyToken, hasRole(2), registrarAsistencia);
router.post("/reportes", verifyToken, hasRole(2), crearReporte);

// Rutas para admin (rol 1)
router.get("/reportes/admin", verifyToken, hasRole(1), getReportesAdmin);
router.put("/reportes/:id", verifyToken, hasRole(1), actualizarReporte);

module.exports = router;

