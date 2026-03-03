import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import API from "../api/axios";

import {
  AcademicCapIcon,
  UserGroupIcon,
  UsersIcon,
  PlusIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalNinos: 0,
    totalDocentes: 0,
    totalUsuarios: 0,
  });

  const [loading, setLoading] = useState(true);

  // Estado para la vista activa
  const [activeView, setActiveView] = useState("dashboard");

  // Handlers para los botones del sidebar
  const handleDashboardClick = () => setActiveView("dashboard");
  const handleGestionClick = () => setActiveView("gestion");
  const handleReportesClick = () => setActiveView("reportes");

  // Estados para reportes
  const [reportes, setReportes] = useState([]);
  const [reportesLoading, setReportesLoading] = useState(false);

  // Estados para gestión de docentes
  const [docentes, setDocentes] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [docentesLoading, setDocentesLoading] = useState(false);

  // Estados para el formulario de crear docente
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estado para modal de asignar grupo
  const [showModal, setShowModal] = useState(false);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState(null);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("");
  const [asignando, setAsignando] = useState(false);

  // Cargar reportes cuando se seleccione la vista de reportes
  useEffect(() => {
    if (activeView === "reportes") {
      const fetchReportes = async () => {
        setReportesLoading(true);
        try {
          const res = await API.get("/docente/reportes/admin");
          setReportes(res.data);
        } catch (error) {
          console.error("Error obteniendo reportes", error);
        } finally {
          setReportesLoading(false);
        }
      };
      fetchReportes();
    }
  }, [activeView]);

  // Cargar stats y docentes cuando se seleccione gestión
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/admin/stats");
        setStats(res.data);
      } catch (error) {
        console.error("Error obteniendo estadísticas", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cargar docentes y grupos cuando se seleccione gestión
  useEffect(() => {
    if (activeView === "gestion") {
      const fetchGestionData = async () => {
        setDocentesLoading(true);
        try {
          const [docentesRes, gruposRes] = await Promise.all([
            API.get("/admin/docentes"),
            API.get("/admin/grupos")
          ]);
          setDocentes(docentesRes.data);
          setGrupos(gruposRes.data);
        } catch (error) {
          console.error("Error obteniendo datos de gestión", error);
        } finally {
          setDocentesLoading(false);
        }
      };
      fetchGestionData();
    }
  }, [activeView]);

  // Actualizar estado del reporte
  const handleActualizarReporte = async (id, estado) => {
    try {
      await API.put(`/docente/reportes/${id}`, { estado });
      // Recargar reportes
      const res = await API.get("/docente/reportes/admin");
      setReportes(res.data);
    } catch (error) {
      console.error("Error actualizando reporte", error);
    }
  };

  const handleCreateDocente = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await API.post("/admin/docentes", {
        nombre,
        correo,
        password,
      });

      setSuccess("Docente creado correctamente");
      setNombre("");
      setCorreo("");
      setPassword("");

      // Refresh stats y docentes
      const [statsRes, docentesRes] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/admin/docentes")
      ]);
      setStats(statsRes.data);
      setDocentes(docentesRes.data);

    } catch (error) {
      setError(error.response?.data?.message || "Error creando docente");
    }
  };

  // Abrir modal para asignar grupo
  const openAsignarGrupoModal = (docente) => {
    setDocenteSeleccionado(docente);
    setGrupoSeleccionado(docente.id_grupo || "");
    setShowModal(true);
  };

  // Asignar grupo al docente
  const handleAsignarGrupo = async (e) => {
    e.preventDefault();
    setAsignando(true);
    setError("");

    try {
      await API.put("/admin/docentes/asignar-grupo", {
        id_docente: docenteSeleccionado.id_usuario,
        id_grupo: grupoSeleccionado ? parseInt(grupoSeleccionado) : null
      });

      // Recargar lista de docentes
      const res = await API.get("/admin/docentes");
      setDocentes(res.data);
      setShowModal(false);
      setSuccess("Grupo asignado correctamente");
      setTimeout(() => setSuccess(""), 3000);

    } catch (error) {
      setError(error.response?.data?.message || "Error asignando grupo");
    } finally {
      setAsignando(false);
    }
  };

  // Datos para el gráfico
  const chartData = [
    { name: "Niños", cantidad: stats.totalNinos },
    { name: "Docentes", cantidad: stats.totalDocentes },
    { name: "Usuarios", cantidad: stats.totalUsuarios },
  ];

  return (
    <DashboardLayout 
      title={activeView === "gestion" ? "Gestión de Docentes" : activeView === "reportes" ? "Reportes" : "Dashboard Administrador"}
      onDashboardClick={handleDashboardClick}
      onGestionClick={handleGestionClick}
      onReportesClick={handleReportesClick}
    >
      {/* Modal para asignar grupo */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Asignar Grupo a {docenteSeleccionado?.nombre}</h3>
            
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleAsignarGrupo}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seleccionar Grupo
                </label>
                <select
                  value={grupoSeleccionado}
                  onChange={(e) => setGrupoSeleccionado(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Sin grupo asignado</option>
                  {grupos.map((grupo) => (
                    <option key={grupo.id_grupo} value={grupo.id_grupo}>
                      {grupo.nombre} ({grupo.edad_minima}-{grupo.edad_maxima} años)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={asignando}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition disabled:opacity-50"
                >
                  {asignando ? "Asignando..." : "Asignar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Cargando estadísticas...</p>
      ) : (
        <>
          {/* Vista Principal: Dashboard */}
          {activeView === "dashboard" && (
            <>
              {/* Tarjetas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

                <StatCard
                  title="Niños Activos"
                  value={stats.totalNinos}
                  Icon={AcademicCapIcon}
                  color="text-blue-900"
                  iconColor="text-blue-200"
                />

                <StatCard
                  title="Docentes"
                  value={stats.totalDocentes}
                  Icon={UserGroupIcon}
                  color="text-indigo-900"
                  iconColor="text-indigo-200"
                />

                <StatCard
                  title="Usuarios Totales"
                  value={stats.totalUsuarios}
                  Icon={UsersIcon}
                  color="text-slate-900"
                  iconColor="text-slate-300"
                />

              </div>

              {/* Gráfico */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-700 mb-6">
                  Resumen General
                </h3>

                <div className="w-full h-80">
                  <ResponsiveContainer>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="cantidad" fill="#1e3a8a" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* Vista de Gestión: Docentes */}
          {activeView === "gestion" && (
            <div className="space-y-6">
              {/* Crear Docente */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-700 mb-6 flex items-center">
                  <PlusIcon className="w-6 h-6 mr-2 text-blue-600" />
                  Crear Nuevo Docente
                </h3>

                {error && !showModal && (
                  <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                    {error}
                  </div>
                )}

                {success && !showModal && (
                  <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">
                    {success}
                  </div>
                )}

                <form onSubmit={handleCreateDocente} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                      placeholder="Nombre completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Correo
                    </label>
                    <input
                      type="email"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                      placeholder="Contraseña"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-300 shadow-md flex items-center justify-center"
                    >
                      <PlusIcon className="w-5 h-5 mr-2" />
                      Crear
                    </button>
                  </div>
                </form>
              </div>

              {/* Lista de Docentes con asignación de grupo */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-700 mb-6 flex items-center">
                  <UserGroupIcon className="w-6 h-6 mr-2 text-green-600" />
                  Docentes y Grupos
                </h3>

                {docentesLoading ? (
                  <p className="text-gray-500">Cargando docentes...</p>
                ) : docentes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay docentes registrados.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th className="px-4 py-3">Nombre</th>
                          <th className="px-4 py-3">Correo</th>
                          <th className="px-4 py-3">Grupo Asignado</th>
                          <th className="px-4 py-3 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {docentes.map((docente) => (
                          <tr key={docente.id_usuario} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{docente.nombre}</td>
                            <td className="px-4 py-3">{docente.correo}</td>
                            <td className="px-4 py-3">
                              {docente.nombre_grupo ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {docente.nombre_grupo}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Sin asignar
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => openAsignarGrupoModal(docente)}
                                className="inline-flex items-center px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition"
                              >
                                <PencilSquareIcon className="w-4 h-4 mr-1" />
                                Asignar Grupo
                              </button>
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

          {/* Vista de Reportes */}
          {activeView === "reportes" && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-700 mb-6 flex items-center">
                <DocumentTextIcon className="w-6 h-6 mr-2 text-orange-600" />
                Reportes de Docentes
              </h3>

              {reportesLoading ? (
                <p className="text-gray-500">Cargando reportes...</p>
              ) : reportes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay reportes pendientes.</p>
              ) : (
                <div className="space-y-4">
                  {reportes.map((reporte) => (
                    <div
                      key={reporte.id_reporte}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-800">{reporte.titulo}</h4>
                          <p className="text-sm text-gray-500">
                            Docente: {reporte.docente_nombre} | Fecha: {new Date(reporte.fecha).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs rounded-full ${
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
                      <p className="text-sm text-gray-600 mb-3">{reporte.descripcion}</p>
                      
                      {reporte.estado === "pendiente" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleActualizarReporte(reporte.id_reporte, "atendido")}
                            className="flex items-center px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition"
                          >
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            Atender
                          </button>
                          <button
                            onClick={() => handleActualizarReporte(reporte.id_reporte, "rechazado")}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

function StatCard({ title, value, Icon, color, iconColor }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-500 text-sm">{title}</h3>
          <p className={`text-3xl font-bold mt-2 ${color}`}>
            {value}
          </p>
        </div>
        <Icon className={`w-12 h-12 ${iconColor}`} />
      </div>
    </div>
  );
}
