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
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <div className="mb-6">
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
          {/* <div className="w-full h-[200px] md:h-[500px] relative"> */}
          <div className="w-full h-[200px] sm:h-[200px] md:h-[800px] relative">
            <ImageGallery images={prepararImagenes()} />
          </div>

          <div className="p-6">
            {/* Cabecera con info principal */}
            <div className="border-b pb-6 mb-6">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{propiedad.titulo}</h1>
                  <p className="text-gray-600 mb-1">{propiedad.direccion}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">
                    {formatPrecio(propiedad.precio)}
                  </p>
                  <p className="text-lg capitalize">
                    {propiedad.operacion === "venta" ? "En venta" : "En alquiler"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 mt-4">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span className="capitalize">{propiedad.tipo}</span>
                </div>

                {propiedad.dormitorios !== null && propiedad.dormitorios > 0 && (
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    <span>
                      {propiedad.dormitorios}{" "}
                      {propiedad.dormitorios === 1 ? "Dormitorio" : "Dormitorios"}
                    </span>
                  </div>
                )}

                {propiedad.baños !== null && propiedad.baños > 0 && (
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span>
                      {propiedad.baños} {propiedad.baños === 1 ? "Baño" : "Baños"}
                    </span>
                  </div>
                )}

                {propiedad.superficie !== null && propiedad.superficie > 0 && (
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5m-7 1V4m0 0L9 9m-7 8l5-5m0 0l5 5M9 12l-5-5 5-5"
                      />
                    </svg>
                    <span>{propiedad.superficie} m²</span>
                  </div>
                )}
              </div>
            </div>

            <Tabs defaultValue="descripcion">
              <TabsList className="mb-4">
                <TabsTrigger value="descripcion">Descripción</TabsTrigger>
                <TabsTrigger value="ubicacion">Ubicación</TabsTrigger>
                <TabsTrigger value="contacto">Contacto</TabsTrigger>
              </TabsList>

              <TabsContent value="descripcion" className="space-y-4">
                <div>
                  <SectionTitle className="mb-4">Descripción</SectionTitle>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {propiedad.descripcion || "No hay descripción disponible para esta propiedad."}
                  </p>
                </div>
                
                <div>
                  <SectionTitle className="mb-4">Detalles</SectionTitle>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700">
                    <li className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-blue-600 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        Tipo: <span className="capitalize">{propiedad.tipo}</span>
                      </span>
                    </li>
                    <li className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-blue-600 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>
                        Operación:{" "}
                        <span className="capitalize">
                          {propiedad.operacion === "venta" ? "Venta" : "Alquiler"}
                        </span>
                      </span>
                    </li>
                    {propiedad.superficie !== null && propiedad.superficie > 0 && (
                      <li className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-600 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Superficie: {propiedad.superficie} m²</span>
                      </li>
                    )}
                    {propiedad.dormitorios !== null && propiedad.dormitorios > 0 && (
                      <li className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-600 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>
                          {propiedad.dormitorios}{" "}
                          {propiedad.dormitorios === 1 ? "Dormitorio" : "Dormitorios"}
                        </span>
                      </li>
                    )}
                    {propiedad.baños !== null && propiedad.baños > 0 && (
                      <li className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-600 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>
                          {propiedad.baños} {propiedad.baños === 1 ? "Baño" : "Baños"}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="ubicacion">
                <SectionTitle className="mb-4">Ubicación</SectionTitle>
                <div className="aspect-video w-full h-[400px] border border-gray-300 rounded-lg">
                  {propiedad.ubicacion ? (
                    <p className="p-4">
                      
                    </p>
                  ) : (
                    <iframe
                      title="Ubicación de la propiedad"
                      className="h-[400px] w-full rounded-md ratio"
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBBPwyL47ND8SaegBYkaX6omKeN4p3VylE&q=${encodeURIComponent(
                        propiedad.direccion || "Córdoba, Argentina"
                      )}`}
                      allowFullScreen
                    ></iframe>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="contacto">
                <div className="space-y-6">
                  <div>
                    <SectionTitle className="mb-4">Contactar por esta propiedad</SectionTitle>
                    <p className="text-gray-600">
                      Completa el formulario o contáctanos directamente por WhatsApp para consultar
                      sobre esta propiedad.
                    </p>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Formulario de contacto */}
                    <div className="bg-gray-50 p-4 rounded-lg flex-1">
                      <form className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Nombre</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Tu nombre"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Email</label>
                          <input
                            type="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="tu@email.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Teléfono</label>
                          <input
                            type="tel"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Tu teléfono"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Mensaje</label>
                          <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
                            placeholder="Estoy interesado/a en esta propiedad..."
                          ></textarea>
                        </div>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          Enviar Consulta
                        </Button>
                      </form>
                    </div>
                    
                    {/* WhatsApp y datos de contacto */}
                    <div className="flex flex-col gap-4 flex-1">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-2 flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="h-6 w-6 text-green-600 mr-2"
                            fill="currentColor"
                          >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          Consultar por WhatsApp
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Envíanos un mensaje directo por WhatsApp para obtener más
                          información sobre esta propiedad.
                        </p>
                        <a
                          href={contactWhatsapp}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-green-600 text-white px-4 py-2 rounded-md inline-flex items-center hover:bg-green-700 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.848 12.459c.202.038.202.333.001.372-1.907.361-6.045 1.111-6.547 1.111-.719 0-1.301-.582-1.301-1.301 0-.512.77-5.447 1.125-7.445.034-.192.312-.181.343.014l.985 6.238 5.394 1.011z" />
                          </svg>
                          Contactar por WhatsApp
                        </a>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-2">Datos de Contacto</h3>
                        <ul className="space-y-2">
                          <li className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-blue-600 mr-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            <span>+54 9 351 234-5678</span>
                          </li>
                          <li className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-blue-600 mr-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            <span>contacto@cordobacasas.com</span>
                          </li>
                          <li className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-blue-600 mr-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span>Av. Colón 1234, Córdoba</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default PropiedadDetalle;
