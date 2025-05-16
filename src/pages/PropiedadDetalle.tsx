import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageGallery from "@/components/ImageGallery";
import ScrollToTop from "@/components/ScrollToTop";
import { SectionTitle } from "@/components/ui/section-title";

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
  ubicacion: any | null;
};

const formatPrecio = (precio: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(precio);
};

const PropiedadDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const [propiedad, setPropiedad] = useState<Propiedad | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactWhatsapp, setContactWhatsapp] = useState("");

  useEffect(() => {
    const fetchPropiedad = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("propiedades")
          .select("*")
          .eq("id", id)
          .eq("estado", "activa")
          .single();

        if (error) throw error;

        setPropiedad(data);
      } catch (error: any) {
        console.error("Error cargando la propiedad:", error.message);
        toast({
          title: "Error",
          description: "No se pudo cargar la información de la propiedad.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPropiedad();
  }, [id]);

  const crearMensajeWhatsapp = () => {
    if (!propiedad) return "";
    
    const texto = `Hola, estoy interesado/a en la propiedad "${propiedad.titulo}" (${propiedad.operacion}) publicada en Córdoba Casas. ¿Podrían brindarme más información?`;
    
    const numero = "5493512345678"; // Número de WhatsApp (ejemplo)
    return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
  };

  useEffect(() => {
    if (propiedad) {
      setContactWhatsapp(crearMensajeWhatsapp());
    }
  }, [propiedad]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!propiedad) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4">
        <h1 className="text-2xl font-bold mb-4">Propiedad no encontrada</h1>
        <p className="mb-6 text-gray-600">
          La propiedad que estás buscando no existe o no está disponible.
        </p>
        <Link to="/propiedades">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Ver todas las propiedades
          </Button>
        </Link>
      </div>
    );
  }

  // Preparar imágenes para galería
  const prepararImagenes = () => {
    const imagenes = [];
    
    if (propiedad.imagen_principal) {
      imagenes.push(propiedad.imagen_principal);
    }
    
    if (propiedad.imagenes && Array.isArray(propiedad.imagenes)) {
      imagenes.push(...propiedad.imagenes.filter(img => img !== propiedad.imagen_principal));
    }
    
    return imagenes.length > 0 ? imagenes : ["https://via.placeholder.com/800x600?text=No+hay+imagen"];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-0 md:px-4">
        <div className="mb-6 px-4 pt-4">
          <Link
            to="/propiedades"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver a Propiedades
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Galería de imágenes */}
          <div className="w-full relative">
            <ImageGallery images={prepararImagenes()} />
          </div>

          <div className="p-6">
            {/* Resto del contenido igual que antes */}
            {/* ... */}
          </div>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default PropiedadDetalle;