
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import PropiedadCard from "@/components/PropiedadCard";
import ScrollToTop from "@/components/ScrollToTop";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Propiedad = {
  id: string;
  titulo: string;
  descripcion: string | null;
  precio: number;
  direccion: string;
  tipo: string;
  operacion: string;
  estado: string;
  dormitorios: number | null;
  baños: number | null;
  superficie: number | null;
  imagen_principal: string | null;
  imagenes: string[] | null;
  destacada: boolean | null;
};

type Filtros = {
  tipo: string;
  operacion: string;
  dormitorios: string;
  precioMin: string;
  precioMax: string;
};

const Inicio = () => {
  const [propiedadesDestacadas, setPropiedadesDestacadas] = useState<Propiedad[]>([]);
  const [propiedadesFiltradas, setPropiedadesFiltradas] = useState<Propiedad[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<Filtros>({
    tipo: "",
    operacion: "",
    dormitorios: "",
    precioMin: "",
    precioMax: "",
  });

  useEffect(() => {
    const fetchPropiedadesDestacadas = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("propiedades")
          .select("*")
          .eq("estado", "activa")
          .eq("destacada", true)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setPropiedadesDestacadas(data || []);
        setPropiedadesFiltradas(data || []);
      } catch (error: any) {
        console.error("Error cargando propiedades destacadas:", error.message);
        toast({
          title: "Error",
          description: "No se pudieron cargar las propiedades destacadas.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPropiedadesDestacadas();
  }, []);

  const aplicarFiltros = () => {
    let resultado = [...propiedadesDestacadas];

    // Filtrar por tipo de propiedad
    if (filtros.tipo) {
      resultado = resultado.filter(
        (propiedad) => propiedad.tipo === filtros.tipo
      );
    }

    // Filtrar por operación
    if (filtros.operacion) {
      resultado = resultado.filter(
        (propiedad) => propiedad.operacion === filtros.operacion
      );
    }

    // Filtrar por dormitorios (mínimo)
    if (filtros.dormitorios) {
      const minDormitorios = parseInt(filtros.dormitorios);
      resultado = resultado.filter(
        (propiedad) => propiedad.dormitorios !== null && propiedad.dormitorios >= minDormitorios
      );
    }

    // Filtrar por precio mínimo
    if (filtros.precioMin) {
      const precioMin = parseFloat(filtros.precioMin);
      resultado = resultado.filter(
        (propiedad) => propiedad.precio >= precioMin
      );
    }

    // Filtrar por precio máximo
    if (filtros.precioMax) {
      const precioMax = parseFloat(filtros.precioMax);
      resultado = resultado.filter(
        (propiedad) => propiedad.precio <= precioMax
      );
    }

    setPropiedadesFiltradas(resultado);
  };

  const limpiarFiltros = () => {
    setFiltros({
      tipo: "",
      operacion: "",
      dormitorios: "",
      precioMin: "",
      precioMax: "",
    });
    setPropiedadesFiltradas(propiedadesDestacadas);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div
        className="relative w-full h-[500px] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80')",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 max-w-4xl w-full mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">
            Encuentra tu hogar ideal en Córdoba
          </h1>
          <div className="bg-white/80 backdrop-blur p-6 rounded-xl shadow-lg bg-gradient-to-br from-blue-80 to-white shadow-blue-500/80">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo de Propiedad</label>
                <select
                  className="w-full border border-gray-300 rounded-md p-2.5 focus:border-blue-500 focus:ring-blue-500"
                  value={filtros.tipo}
                  onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                >
                  <option value="">Todos</option>
                  <option value="casa">Casa</option>
                  <option value="departamento">Departamento</option>
                  <option value="terreno">Terreno</option>
                  <option value="local">Local</option>
                  <option value="oficina">Oficina</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Operación</label>
                <select
                  className="w-full border border-gray-300 rounded-md p-2.5 focus:border-blue-500 focus:ring-blue-500"
                  value={filtros.operacion}
                  onChange={(e) => setFiltros({ ...filtros, operacion: e.target.value })}
                >
                  <option value="">Todas</option>
                  <option value="venta">Venta</option>
                  <option value="alquiler">Alquiler</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Dormitorios</label>
                <select
                  className="w-full border border-gray-300 rounded-md p-2.5 focus:border-blue-500 focus:ring-blue-500"
                  value={filtros.dormitorios}
                  onChange={(e) => setFiltros({ ...filtros, dormitorios: e.target.value })}
                >
                  <option value="">Todos</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={limpiarFiltros}
              >
                Limpiar
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={aplicarFiltros}
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Propiedades Destacadas Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Propiedades Destacadas</h2>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {propiedadesFiltradas.length > 0 ? (
                propiedadesFiltradas.map((propiedad) => (
                  <PropiedadCard key={propiedad.id} propiedad={propiedad} />
                ))
              ) : (
                <div className="col-span-3 text-center py-10">
                  <p className="text-gray-500">No hay propiedades que coincidan con los filtros seleccionados.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Por Qué Elegirnos Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">¿Por Qué Elegirnos?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Calidad Garantizada</h3>
              <p className="text-gray-600">
                Todas nuestras propiedades son verificadas y cumplen con los estándares de calidad.
              </p>
            </Card>
            <Card className="p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Atención Rápida</h3>
              <p className="text-gray-600">
                Respondemos a tus consultas en tiempo récord para que no pierdas oportunidades.
              </p>
            </Card>
            <Card className="p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Equipo Profesional</h3>
              <p className="text-gray-600">
                Contamos con expertos inmobiliarios para asesorarte en cada paso del proceso.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section - "Hogar Ideal" with gradient */}
      <section className="py-16 bg-gradient-to-r from-blue-500 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Buscas tu hogar ideal?</h2>
          <p className="max-w-2xl mx-auto mb-8 text-lg">
            Déjanos ayudarte a encontrar la propiedad perfecta para ti y tu familia. Nuestros asesores están listos para atenderte.
          </p>
          <Button
            size="lg"
            variant="outline"
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            Contáctanos Ahora
          </Button>
        </div>
      </section>

      <ScrollToTop />
    </div>
  );
};

export default Inicio;
