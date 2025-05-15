import React from "react";
import { Card } from "@/components/ui/card";
import ScrollToTop from "@/components/ScrollToTop";
import { SectionTitle } from "@/components/ui/section-title";

const Contacto = () => {
  // Números de WhatsApp (sin espacios ni símbolos)
  const whatsappNumero1 = "5493517716373";
  const whatsappNumero2 = "5493519876543";
  const email = "contacto@cordobacasas.com";
  
  // URLs de WhatsApp
  const whatsappUrl1 = `https://wa.me/${whatsappNumero1}?text=Hola%2C%20estoy%20interesado/a%20en%20obtener%20más%20información%20sobre%20propiedades.`;
  const whatsappUrl2 = `https://wa.me/${whatsappNumero2}?text=Hola%2C%20estoy%20interesado/a%20en%20obtener%20más%20información%20sobre%20propiedades.`;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <SectionTitle>Contacto</SectionTitle>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Información de Contacto</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600"
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
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">Teléfonos</h3>
                  <div className="mt-2 space-y-2">
                    <a
                      href={whatsappUrl1}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center text-gray-600 hover:text-blue-600 transition-colors tracking-wider"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-green-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      {whatsappNumero1} (WhatsApp)
                    </a>
                    <a
                      href={whatsappUrl2}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center text-gray-600 hover:text-blue-600 transition-colors tracking-wider"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-green-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      {whatsappNumero2} (WhatsApp)
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600"
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
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">Email</h3>
                  <a
                    href={`mailto:${email}`}
                    className="text-gray-600 hover:text-blue-600 transition-colors mt-2 block"
                  >
                    {email}
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600"
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
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">Horario de Atención</h3>
                  <div className="mt-2">
                    <p className="text-gray-600">Lunes a Viernes: 9:00 - 18:00</p>
                    <p className="text-gray-600">Sábados: 9:00 - 13:00</p>
                    <p className="text-gray-600">Domingos: Cerrado</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600"
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
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">Dirección</h3>
                  <p className="text-gray-600 mt-2">
                    Av. Colón 1234, Córdoba Capital, Argentina
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="h-full">
            <Card className="h-full p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">Ubicación</h2>
              <div className="h-[400px] w-full">
                {/* Implementación del mapa de Google Maps */}
                <iframe
                  title="Ubicación de Córdoba Casas"
                  className="w-full h-full rounded-md border border-gray-200"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13619.626903964732!2d-64.18547258395443!3d-31.416395569689926!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9432a28959f60271%3A0xbf0c8d9784cc2e06!2zQXYuIENvbMOzbiwgQ8OzcmRvYmE!5e0!3m2!1ses-419!2sar!4v1676925805054!5m2!1ses-419!2sar"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default Contacto;
