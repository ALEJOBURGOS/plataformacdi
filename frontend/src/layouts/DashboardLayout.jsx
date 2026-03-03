import { useNavigate } from "react-router-dom";

export default function DashboardLayout({ children, title, onDashboardClick, onGestionClick, onReportesClick }) {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col">

        <div className="p-6 text-center border-b border-blue-800">
          <h1 className="text-xl font-bold">Plataforma CDI</h1>
          <p className="text-xs text-blue-200 mt-1">
            Sistema Académico
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">

          <button onClick={onDashboardClick} className="w-full text-left px-4 py-2 rounded-lg hover:bg-blue-800 transition">
            Dashboard
          </button>

          <button onClick={onGestionClick} className="w-full text-left px-4 py-2 rounded-lg hover:bg-blue-800 transition">
            Gestión
          </button>

          <button onClick={onReportesClick} className="w-full text-left px-4 py-2 rounded-lg hover:bg-blue-800 transition">
            Reportes
          </button>

        </nav>

        <div className="p-4 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 py-2 rounded-lg text-sm transition"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

      {/* Header / Navbar */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 shadow-lg px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">
          {title}
        </h2>

        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <button className="relative p-2 text-blue-200 hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3 bg-blue-800/50 px-3 py-2 rounded-full">
            <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-blue-900 font-bold">
              {usuario?.nombre?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="text-sm">
              <p className="text-white font-medium">{usuario?.nombre}</p>
              <p className="text-blue-200 text-xs">
                {usuario?.id_rol === 1 ? "Administrador" : usuario?.id_rol === 2 ? "Docente" : "Acudiente"}
              </p>
            </div>
          </div>
        </div>
      </header>

        {/* Content */}
        <main className="p-6 flex-1">
          {children}
        </main>

      </div>
    </div>
  );
}