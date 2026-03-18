import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../api/axios";

export default function CompletarRegistroGoogle() {
  const location = useLocation();
  const navigate = useNavigate();

  const correoInicial = location.state?.correo || "";
  const nombreInicial = location.state?.nombre || "";

  const [nombre, setNombre] = useState(nombreInicial);
  const [correo] = useState(correoInicial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleComplete = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/google/complete", {
        nombre,
        correo,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("usuario", JSON.stringify(res.data.user));

      // Redirección por rol
      if (res.data.user.id_rol === 1) {
        navigate("/admin");
      } else if (res.data.user.id_rol === 2) {
        navigate("/docente");
      } else {
        navigate("/acudiente");
      }

    } catch (err) {
      setError("Error al completar el registro. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };
  //hola
  // Si alguien entra manualmente sin Google
  if (!correoInicial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-6 rounded-2xl shadow-lg backdrop-blur-md flex flex-col items-center">
          <svg className="w-12 h-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold mb-2">Acceso no autorizado</h2>
          <p className="text-sm">Por favor, inicia sesión a través de la página principal.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-xl transition-colors"
          >
            Regresar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-[30%] left-[-10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[10%] right-[10%] w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Main Glassmorphism Card */}
      <div className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] z-10 transition-all duration-500 hover:shadow-[0_8px_40px_0_rgba(0,0,0,0.45)]">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-500/20 mb-4 ring-1 ring-blue-400/30">
            <svg className="w-7 h-7 text-blue-300" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200 tracking-tight">
            Casi terminamos
          </h2>
          <p className="text-indigo-200 mt-2 text-sm font-medium opacity-80">
            Confirma tus datos para continuar
          </p>
        </div>

        {error && (
          <div className="animate-fade-in-down flex items-center bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-xl mb-6 text-sm text-center shadow-inner">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleComplete} className="space-y-6">

          {/* Nombre */}
          <div className="space-y-1 group">
            <label className="block text-xs font-semibold text-indigo-200 uppercase tracking-wider ml-1 mb-1 group-focus-within:text-white transition-colors">
              Nombre asignado
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-indigo-300/50 focus:bg-white/10 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 focus:outline-none transition-all duration-300 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Correo (Disabled) */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-indigo-200/50 uppercase tracking-wider ml-1 mb-1">
              Correo vinculado
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-indigo-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                type="email"
                value={correo}
                disabled
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-transparent rounded-xl text-indigo-200/60 cursor-not-allowed backdrop-blur-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-6"
          >
            <span className="relative z-10 flex items-center justify-center">
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : "Finalizar y Entrar"}
            </span>
          </button>
        </form>

      </div>
    </div>
  );
}