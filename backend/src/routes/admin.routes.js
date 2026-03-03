const express = require("express");
const router = express.Router();

const { 
  getAdminStats, 
  createDocente, 
  getAllDocentes, 
  getAllGrupos,
  asignarGrupoDocente 
} = require("../controllers/admin.controller");

// 👇 Importación correcta
const { verifyToken, hasRole } = require("../middlewares/auth.middleware");

// Solo admin puede ver stats
router.get("/stats", verifyToken, hasRole(1), getAdminStats);

// Solo admin puede crear docentes
router.post("/docentes", verifyToken, hasRole(1), createDocente);

// Obtener todos los docentes
router.get("/docentes", verifyToken, hasRole(1), getAllDocentes);

// Obtener todos los grupos
router.get("/grupos", verifyToken, hasRole(1), getAllGrupos);

// Asignar grupo a docente
router.put("/docentes/asignar-grupo", verifyToken, hasRole(1), asignarGrupoDocente);

module.exports = router;
