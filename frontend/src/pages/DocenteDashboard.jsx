import { useEffect, useState, useRef } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import API from "../api/axios";

import {
  AcademicCapIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#22c55e", "#ef4444", "#eab308"];

export default function DocenteDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("dashboard");
  
  // Datos del dashboard
  const [grupo, setGrupo] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [reportes, setReportes] = useState([]);
  
  // Estados para asistencia
  const [fechaAsistencia, setFechaAsistencia] = useState(new Date().toISOString().split('T')[0]);
  const [estudiantesAsistencia, setEstudiantesAsistencia] = useState([]);
  const [asistenciaCargada, setAsistenciaCargada] = useState(false);
  
  // Estados para importar Excel
  const [file, setFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);
  
  // Estados para reportes
  const [reporteTitulo, setReporteTitulo] = useState("");
  const [reporteDescripcion, setReporteDescripcion] = useState("");
  const [reporteTipo, setReporteTipo] = useState("general");
  const [reporteSuccess, setReporteSuccess] = useState("");
  const [reporteError, setReporteError] = useState("");

  // Handlers para el sidebar
  const handleDashboardClick = () => setActiveView("dashboard");
  const handleGestionClick = () => setActiveView("gestion");
  const handleReportesClick = () => setActiveView("reportes");

  // Cargar datos del dashboard
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/docente/dashboard");
        setGrupo(res.data.grupo);
        setEstudiantes(res.data.estudiantes);
        setEstadisticas(res.data.estadisticas);
        setReportes(res.data.reportes);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cargar estudiantes para asistencia
  const loadEstudiantesAsistencia = async (fecha) => {
    try {
      const res = await API.get(`/docente/estudiantes?fecha=${fecha}`);
      setEstudiantesAsistencia(res.data.estudiantes);
      setAsistenciaCargada(true);
    } catch (error) {
      console.error("Error loading students:", error);
    }
  };

  // Cambiar fecha de asistencia
  const handleFechaChange = (e) => {
    const nuevaFecha = e.target.value;
    setFechaAsistencia(nuevaFecha);
    setAsistenciaCargada(false);
    loadEstudiantesAsistencia(nuevaFecha);
  };

  // Marcar asistencia de un estudiante
  const handleAsistencia = async (idMatricula, estado) => {
    try {
      await API.post("/docente/asistencia", {
        id_matricula: idMatricula,
        fecha: fechaAsistencia,
        estado,
        observacion: "",
      });
      
      // Actualizar la lista
      loadEstudiantesAsistencia(fechaAsistencia);
    } catch (error) {
      console.error("Error registering attendance:", error);
    }
  };

  // Importar estudiantes desde Excel
  const handleImport = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setImportResult({ errores: ["Selecciona un archivo primero"] });
      return;
    }

    if (!grupo) {
      setImportResult({ errores: ["No tienes un grupo asignado"] });
      return;
    }

    setImporting(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append("archivo", file);
    formData.append("id_grupo", grupo.id_grupo);

    try {
      const res = await API.post("/docente/importar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setImportResult(res.data.resultados);
      
      // Recargar datos del dashboard
      const dashRes = await API.get("/docente/dashboard");
      setEstudiantes(dashRes.data.estudiantes);
      
      // Recargar estudiantes de asistencia
      loadEstudiantesAsistencia(fechaAsistencia);
      
    } catch (error) {
      setImportResult({ errores: [error.response?.data?.message || "Error al importar"] });
    } finally {
      setImporting(false);
    }
  };

  // Crear reporte
  const handleCrearReporte = async (e) => {
    e.preventDefault();
    setReporteError("");
    setReporteSuccess("");

    try {
      await API.post("/docente/reportes", {
        titulo: reporteTitulo,
        descripcion: reporteDescripcion,
        tipo: reporteTipo,
      });

      setReporteSuccess("Reporte enviado exitosamente");
      setReporteTitulo("");
      setReporteDescripcion("");
      setReporteTipo("general");
      
      // Recargar reportes
      const res = await API.get("/docente/dashboard");
      setReportes(res.data.reportes);
      
    } catch (error) {
      setReporteError(error.response?.data?.message || "Error al enviar reporte");
    }
  };

  // Datos para gráficos
  const chartData = [
    { name: "Presentes", value: estadisticas.presentes || 0 },
    { name: "Ausentes", value: estadisticas.ausentes || 0 },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Panel Docente">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Cargando datos...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={
        activeView === "gestion"
          ? "Gestión - " + (grupo?.nombre || "Mi Grupo")
          : activeView === "reportes"
          ? "Reportes y Quejas"
          : "Dashboard - " + (grupo?.nombre || "Mi Grupo")
      }
      onDashboardClick={handleDashboardClick}
      onGestionClick={handleGestionClick}
      onReportesClick={handleReportesClick}
    >
      {/* ===== VISTA DASHBOARD ===== */}
      {activeView === "dashboard" && (
        <>
          {grupo ? (
            <>
              {/* Info del Grupo */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 mb-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{grupo.nombre}</h2>
                    <p className="text-blue-100 mt-1">
                      Edades: {grupo.edad_minima} - {grupo.edad_maxima} años
                    </p>
                    <p className="text-blue-100">
                      Horario: {grupo.horario || "No definido"}
                    </p>
                  </div>
                  <div className="text-center bg-white/20 rounded-xl p-4">
                    <p className="text-4xl font-bold">{grupo.total_estudiantes}</p>
                    <p className="text-blue-100 text-sm">Estudiantes</p>
                  </div>
                </div>
              </div>

              {/* Tarjetas de estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatCard
                  title="Total Registros"
                  value={estadisticas.total_asistencias}
                  Icon={CalendarIcon}
                  color="text-blue-600"
                />
                <StatCard
                  title="Presentes"
                  value={estadisticas.presentes}
                  Icon={CheckCircleIcon}
                  color="text-green-600"
                />
                <StatCard
                  title="Ausentes"
                  value={estadisticas.ausentes}
                  Icon={XCircleIcon}
                  color="text-red-600"
                />
                <StatCard
                  title="% Asistencia"
                  value={`${estadisticas.porcentaje_asistencia}%`}
                  Icon={AcademicCapIcon}
                  color="text-indigo-600"
                />
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Asistencia del Mes
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer>
                      <BarChart
                        data={[
                          { name: "Presentes", cantidad: estadisticas.presentes },
                          { name: "Ausentes", cantidad: estadisticas.ausentes },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="cantidad" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    Porcentaje de Asistencia
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Lista de estudiantes */}
              <div className="mt-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Mis Estudiantes ({estudiantes.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">Nombres</th>
                        <th className="px-4 py-3">Apellidos</th>
                        <th className="px-4 py-3">Fecha Nacimiento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estudiantes.map((est) => (
                        <tr key={est.id_matricula} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{est.nombres}</td>
                          <td className="px-4 py-3">{est.apellidos}</td>
                          <td className="px-4 py-3">{est.fecha_nacimiento}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
              <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-yellow-800">
                Sin grupo asignado
              </h3>
              <p className="text-yellow-600 mt-2">
                Contacta al administrador para que te asigne un grupo.
              </p>
            </div>
          )}
        </>
      )}

      {/* ===== VISTA GESTIÓN ===== */}
      {activeView === "gestion" && grupo && (
        <div className="space-y-6">
          {/* Sección: Importar Excel */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <ArrowUpTrayIcon className="w-6 h-6 mr-2 text-blue-600" />
              Importar Estudiantes desde Excel
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              El archivo debe tener las columnas: nombres, apellidos, fecha_nacimiento, documento
            </p>
            
            <form onSubmit={handleImport} className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setFile(e.target.files[0])}
                  ref={fileInputRef}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <button
                  type="submit"
                  disabled={importing}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                >
                  {importing ? "Importando..." : "Importar"}
                </button>
              </div>
            </form>

            {importResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-green-600 font-medium">
                  ✓ Estudiantes creados: {importResult.creados}
                </p>
                <p className="text-blue-600">
                  ✓ Estudiantes existentes: {importResult.existentes}
                </p>
                {importResult.errores && importResult.errores.length > 0 && (
                  <div className="mt-2">
                    <p className="text-red-600 font-medium">Errores:</p>
                    <ul className="text-sm text-red-500 list-disc ml-5">
                      {importResult.errores.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sección: Tomar Asistencia */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <CalendarIcon className="w-6 h-6 mr-2 text-green-600" />
              Tomar Asistencia
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha:
              </label>
              <input
                type="date"
                value={fechaAsistencia}
                onChange={handleFechaChange}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {!asistenciaCargada ? (
              <button
                onClick={() => loadEstudiantesAsistencia(fechaAsistencia)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Cargar Lista de Estudiantes
              </button>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">Estudiante</th>
                      <th className="px-4 py-3">Estado Actual</th>
                      <th className="px-4 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estudiantesAsistencia.map((est) => (
                      <tr key={est.id_matricula} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{est.nombres} {est.apellidos}</td>
                        <td className="px-4 py-3">
                          {est.asistencia_estado === "presente" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Presente
                            </span>
                          )}
                          {est.asistencia_estado === "ausente" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Ausente
                            </span>
                          )}
                          {!est.asistencia_estado && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Sin registrar
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleAsistencia(est.id_matricula, "presente")}
                              className={`px-3 py-1 rounded text-white text-xs ${
                                est.asistencia_estado === "presente"
                                  ? "bg-green-600"
                                  : "bg-green-500 hover:bg-green-600"
                              }`}
                            >
                              Presente
                            </button>
                            <button
                              onClick={() => handleAsistencia(est.id_matricula, "ausente")}
                              className={`px-3 py-1 rounded text-white text-xs ${
                                est.asistencia_estado === "ausente"
                                  ? "bg-red-600"
                                  : "bg-red-500 hover:bg-red-600"
                              }`}
                            >
                              Ausente
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== VISTA REPORTES ===== */}
      {activeView === "reportes" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulario de reportes */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <DocumentTextIcon className="w-6 h-6 mr-2 text-orange-600" />
              Nuevo Reporte / Queja
            </h3>

            {reporteSuccess && (
              <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">
                {reporteSuccess}
              </div>
            )}

            {reporteError && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                {reporteError}
              </div>
            )}

            <form onSubmit={handleCrearReporte} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Reporte
                </label>
                <select
                  value={reporteTipo}
                  onChange={(e) => setReporteTipo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="general">General</option>
                  <option value="queja">Queja</option>
                  <option value="sugerencia">Sugerencia</option>
                  <option value="emergencia">Emergencia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={reporteTitulo}
                  onChange={(e) => setReporteTitulo(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Breve descripción del reporte"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={reporteDescripcion}
                  onChange={(e) => setReporteDescripcion(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Describe detalladamente el reporte o queja..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg transition duration-300"
              >
                Enviar Reporte
              </button>
            </form>
          </div>

          {/* Lista de reportes enviados */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Mis Reportes Enviados
            </h3>

            {reportes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No has enviado ningún reporte aún.
              </p>
            ) : (
              <div className="space-y-4">
                {reportes.map((reporte) => (
                  <div
                    key={reporte.id_reporte}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800">{reporte.titulo}</h4>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          reporte.estado === "pendiente"
                            ? "bg-yellow-100 text-yellow-800"
                            : reporte.estado === "atendido"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {reporte.estado}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{reporte.descripcion}</p>
                    <p className="text-xs text-gray-400">
                      Fecha: {new Date(reporte.fecha).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function StatCard({ title, value, Icon, color }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </div>
  );
}

