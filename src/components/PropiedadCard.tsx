
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

type PropiedadCardProps = {
  propiedad: Propiedad;
};

const formatPrecio = (precio: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(precio);
};

const PropiedadCard: React.FC<PropiedadCardProps> = ({ propiedad }) => {
  const { 
    id, 
    titulo, 
    direccion, 
    precio, 
    tipo, 
    operacion, 
    dormitorios, 
    baños, 
    superficie,
    imagen_principal 
  } = propiedad;

  return (
    <Card className="overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1
    bg-white rounded-lg shadow-xl border border-blue-200 backdrop-blur-sm bg-gradient-to-br from-blue-50 to-white shadow-black-200/50">
      <Link to={`/propiedad/${id}`} className="block">
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={imagen_principal || "https://via.placeholder.com/400x300?text=Sin+Imagen"}
            alt={titulo}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
          />
          <div className="absolute top-0 left-0 p-2">
            <Badge className="capitalize bg-blue-600 hover:bg-blue-700">
              {operacion === "venta" ? "Venta" : "Alquiler"}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4 ">
          <h3 className="text-lg font-bold mb-2 line-clamp-1">{titulo}</h3>
          <p className="text-gray-500 text-sm mb-3 line-clamp-1">{direccion}</p>
          <p className="text-blue-600 font-bold text-xl mb-3">{formatPrecio(precio)}</p>
          
          <div className="grid grid-cols-3 gap-2 border-t pt-3 text-sm text-gray-600">
            {dormitorios !== null && dormitorios > 0 && (
              <div className="flex flex-col items-center">
                <div className="flex items-center mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span>{dormitorios} Dorm.</span>
              </div>
            )}
            
            {baños !== null && baños > 0 && (
              <div className="flex flex-col items-center">
                <div className="flex items-center mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span>{baños} Baños</span>
              </div>
            )}
            
            {superficie !== null && superficie > 0 && (
              <div className="flex flex-col items-center">
                <div className="flex items-center mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span>{superficie} m²</span>
              </div>
            )}
            
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="capitalize">{tipo}</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default PropiedadCard;
