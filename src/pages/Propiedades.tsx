
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PropiedadCard from "@/components/PropiedadCard";
import { SectionTitle } from "@/components/ui/section-title";
import { Database } from "@/integrations/supabase/types";

// Definimos tipos basados en el esquema de Supabase
type PropiedadTipo = Database["public"]["Enums"]["propiedad_tipo"];
type PropiedadOperacion = Database["public"]["Enums"]["propiedad_operacion"];

type Propiedad = {
  id: string;
  titulo: string;
  descripcion: string | null;
  precio: number;
  direccion: string;
  tipo: PropiedadTipo;
  operacion: PropiedadOperacion;
  estado: string;
  dormitorios: number | null;
  baños: number | null;
  superficie: number | null;
  imagen_principal: string | null;
  imagenes: string[] | null;
  destacada: boolean | null;
};

const Propiedades = () => {
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipoFiltro, setTipoFiltro] = useState<PropiedadTipo | "">("");
  const [operacionFiltro, setOperacionFiltro] = useState<PropiedadOperacion | "">("");
  const [precioMaximo, setPrecioMaximo] = useState<number | null>(null);

  useEffect(() => {
    fetchPropiedades();
  }, [tipoFiltro, operacionFiltro, precioMaximo]);

  const fetchPropiedades = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("propiedades")
        .select("*")
        .eq("estado", "activa");

      if (tipoFiltro) {
        query = query.eq("tipo", tipoFiltro as PropiedadTipo);
      }
      if (operacionFiltro) {
        query = query.eq("operacion", operacionFiltro as PropiedadOperacion);
      }
      if (precioMaximo) {
        query = query.lte("precio", precioMaximo);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;

      setPropiedades(data || []);
    } catch (error: any) {
      console.error("Error cargando propiedades:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función segura para cambiar el tipo de propiedad
  const handleTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as PropiedadTipo | "";
    setTipoFiltro(value);
  };

  // Función segura para cambiar la operación
  const handleOperacionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as PropiedadOperacion | "";
    setOperacionFiltro(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg p-6 shadow-xl border border-blue-200 backdrop-blur-sm mb-8 bg-gradient-to-br from-blue-50 to-white shadow-blue-200/50">
          <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-800 to-purple-900 bg-clip-text text-transparent">Filtrar Propiedades</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="tipo"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tipo de Propiedad
              </label>
              <select
                id="tipo"
                className="w-full border border-gray-300 rounded-md p-2.5 focus:border-blue-500 focus:ring-blue-500"
                value={tipoFiltro}
                onChange={handleTipoChange}
              >
                <option value="">Todos los tipos</option>
                <option value="casa">Casa</option>
                <option value="departamento">Departamento</option>
                <option value="terreno">Terreno</option>
                <option value="local">Local</option>
                <option value="oficina">Oficina</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="operacion"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tipo de Operación
              </label>
              <select
                id="operacion"
                className="w-full border border-gray-300 rounded-md p-2.5 focus:border-blue-500 focus:ring-blue-500"
                value={operacionFiltro}
                onChange={handleOperacionChange}
              >
                <option value="">Todas las operaciones</option>
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="precioMaximo"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Precio Máximo
              </label>
              <input
                type="number"
                id="precioMaximo"
                className="w-full border border-gray-300 rounded-md p-2.5 focus:border-blue-500 focus:ring-blue-500"
                value={precioMaximo || ""}
                onChange={(e) =>
                  setPrecioMaximo(
                    e.target.value ? parseInt(e.target.value, 10) : null
                  )
                }
                placeholder="Sin límite"
              />
            </div>
          </div>
        </div>

        <SectionTitle>Propiedades</SectionTitle>
        {loading ? (
          <div className="w-full flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : propiedades.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propiedades.map((propiedad) => (
              <PropiedadCard key={propiedad.id} propiedad={propiedad} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No hay propiedades disponibles
            </h3>
            <p className="text-gray-500">
              No se encontraron propiedades que coincidan con los criterios de
              búsqueda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Propiedades;
