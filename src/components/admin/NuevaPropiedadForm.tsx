import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Database } from '@/integrations/supabase/types';

interface NuevaPropiedadFormProps {
  onSuccess: () => void;
}

interface FormData {
  titulo: string;
  descripcion: string;
  precio: number;
  direccion: string;
  tipo: Database["public"]["Enums"]["propiedad_tipo"];
  operacion: Database["public"]["Enums"]["propiedad_operacion"];
  dormitorios: number;
  baños: number;
  superficie: number;
  destacada: boolean;
}

// Función para optimizar imágenes antes de subirlas
const optimizarImagen = (file: File) => {
  return new Promise<File>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Definir tamaño máximo para la imagen optimizada
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 900;
        let width = img.width;
        let height = img.height;

        // Redimensionar si excede los límites
        if (width > MAX_WIDTH) {
          height = Math.round(height * (MAX_WIDTH / width));
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = Math.round(width * (MAX_HEIGHT / height));
          height = MAX_HEIGHT;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir a Blob/File con calidad reducida (0.8 = 80%)
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Error al optimizar la imagen'));
            return;
          }
          // Crear un nuevo File con el blob optimizado
          const optimizedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(optimizedFile);
        }, 'image/jpeg', 0.8);
      };
      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'));
      };
    };
    reader.onerror = () => {
      reject(new Error('Error al leer la imagen'));
    };
  });
};

const NuevaPropiedadForm: React.FC<NuevaPropiedadFormProps> = ({ onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const [imagenPrincipal, setImagenPrincipal] = useState<File | null>(null);
  const [imagenesAdicionales, setImagenesAdicionales] = useState<File[]>([]);
  const [previewPrincipal, setPreviewPrincipal] = useState<string | null>(null);
  const [previewsAdicionales, setPreviewsAdicionales] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('informacion');

  // Manejar cambio de imagen principal
  const handleImagenPrincipalChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      // Optimizar la imagen antes de guardarla
      const optimizedFile = await optimizarImagen(files[0]);
      setImagenPrincipal(optimizedFile);
      
      // Crear URL para previsualización
      const previewUrl = URL.createObjectURL(optimizedFile);
      setPreviewPrincipal(previewUrl);
    } catch (error) {
      console.error("Error al procesar la imagen principal:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar la imagen principal",
        variant: "destructive",
      });
    }
  };

  // Manejar cambio de imágenes adicionales
  const handleImagenesAdicionalesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      // Limitar a máximo 9 imágenes adicionales (10 en total con la principal)
      const maxFiles = 9 - imagenesAdicionales.length;
      const filesToProcess = Array.from(files).slice(0, maxFiles);
      
      // Optimizar cada imagen
      const optimizationPromises = filesToProcess.map(file => optimizarImagen(file));
      const optimizedFiles = await Promise.all(optimizationPromises);
      
      // Actualizar estado con las nuevas imágenes
      setImagenesAdicionales(prev => [...prev, ...optimizedFiles]);
      
      // Crear URLs para previsualización
      const newPreviews = optimizedFiles.map(file => URL.createObjectURL(file));
      setPreviewsAdicionales(prev => [...prev, ...newPreviews]);
      
    } catch (error) {
      console.error("Error al procesar imágenes adicionales:", error);
      toast({
        title: "Error",
        description: "No se pudieron procesar algunas imágenes",
        variant: "destructive",
      });
    }
  };

  // Eliminar imagen adicional
  const removeImagen = (index: number) => {
    setImagenesAdicionales(prev => prev.filter((_, i) => i !== index));
    setPreviewsAdicionales(prev => prev.filter((_, i) => i !== index));
  };

  // Enviar el formulario
  const onSubmit = async (data: FormData) => {
    if (!imagenPrincipal) {
      toast({
        title: "Error",
        description: "Debe seleccionar una imagen principal",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Subir imagen principal
      const imagenPrincipalPath = `${Date.now()}_${imagenPrincipal.name.replace(/\s+/g, '_')}`;
      const { error: errorImagenPrincipal } = await supabase.storage
        .from('propiedades')
        .upload(imagenPrincipalPath, imagenPrincipal);

      if (errorImagenPrincipal) throw new Error(`Error al subir imagen principal: ${errorImagenPrincipal.message}`);

      // Obtener URL pública de la imagen principal
      const { data: urlData } = supabase.storage
        .from('propiedades')
        .getPublicUrl(imagenPrincipalPath);

      const imagenPrincipalUrl = urlData.publicUrl;

      // 2. Subir imágenes adicionales (si existen)
      const imagenesUrls = [];
      
      if (imagenesAdicionales.length > 0) {
        for (const imagen of imagenesAdicionales) {
          const imagenPath = `${Date.now()}_${imagen.name.replace(/\s+/g, '_')}`;
          const { error: errorImagen } = await supabase.storage
            .from('propiedades')
            .upload(imagenPath, imagen);

          if (errorImagen) continue; // Si hay error, continuamos con la siguiente imagen

          const { data: urlImagenData } = supabase.storage
            .from('propiedades')
            .getPublicUrl(imagenPath);

          imagenesUrls.push(urlImagenData.publicUrl);
        }
      }

      // 3. Crear la propiedad en la base de datos
      const propiedadData = {
        titulo: data.titulo,
        descripcion: data.descripcion,
        precio: data.precio,
        direccion: data.direccion,
        tipo: data.tipo,
        operacion: data.operacion,
        dormitorios: data.dormitorios || 0,
        baños: data.baños || 0,
        superficie: data.superficie || 0,
        destacada: data.destacada || false,
        imagen_principal: imagenPrincipalUrl,
        imagenes: [imagenPrincipalUrl, ...imagenesUrls],
      };

      const { error: errorPropiedad } = await supabase
        .from('propiedades')
        .insert(propiedadData);

      if (errorPropiedad) throw new Error(`Error al crear la propiedad: ${errorPropiedad.message}`);

      // Éxito
      toast({
        title: "Éxito",
        description: "Propiedad creada correctamente",
      });

      // Resetear formulario
      reset();
      setImagenPrincipal(null);
      setImagenesAdicionales([]);
      setPreviewPrincipal(null);
      setPreviewsAdicionales([]);
      setActiveTab('informacion');
      
      // Notificar éxito al componente padre
      onSuccess();

    } catch (error: any) {
      console.error("Error al crear la propiedad:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la propiedad",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 grid grid-cols-2">
              <TabsTrigger value="informacion">Información Básica</TabsTrigger>
              <TabsTrigger value="imagenes">Imágenes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="informacion" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    placeholder="Ej: Casa moderna en barrio jardín"
                    {...register('titulo', { required: 'El título es obligatorio' })}
                    className="mt-1"
                  />
                  {errors.titulo && (
                    <p className="text-red-500 text-sm mt-1">{errors.titulo.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="direccion">Dirección *</Label>
                  <Input
                    id="direccion"
                    placeholder="Ej: Av. Colón 1234, Córdoba"
                    {...register('direccion', { required: 'La dirección es obligatoria' })}
                    className="mt-1"
                  />
                  {errors.direccion && (
                    <p className="text-red-500 text-sm mt-1">{errors.direccion.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="precio">Precio *</Label>
                  <Input
                    id="precio"
                    type="number"
                    placeholder="Ej: 150000"
                    {...register('precio', { 
                      required: 'El precio es obligatorio',
                      valueAsNumber: true,
                      min: { value: 1, message: 'El precio debe ser mayor que 0' }
                    })}
                    className="mt-1"
                  />
                  {errors.precio && (
                    <p className="text-red-500 text-sm mt-1">{errors.precio.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="operacion">Operación *</Label>
                  <select
                    id="operacion"
                    className="w-full border border-gray-300 rounded-md p-2 mt-1"
                    {...register('operacion', { required: 'La operación es obligatoria' })}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="venta">Venta</option>
                    <option value="alquiler">Alquiler</option>
                  </select>
                  {errors.operacion && (
                    <p className="text-red-500 text-sm mt-1">{errors.operacion.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="tipo">Tipo de propiedad *</Label>
                  <select
                    id="tipo"
                    className="w-full border border-gray-300 rounded-md p-2 mt-1"
                    {...register('tipo', { required: 'El tipo es obligatorio' })}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="casa">Casa</option>
                    <option value="departamento">Departamento</option>
                    <option value="terreno">Terreno</option>
                    <option value="local">Local</option>
                    <option value="oficina">Oficina</option>
                    <option value="otro">Otro</option>
                  </select>
                  {errors.tipo && (
                    <p className="text-red-500 text-sm mt-1">{errors.tipo.message}</p>
                  )}
                </div>

                <div className="flex items-center space-x-6">
                  <div>
                    <Label htmlFor="dormitorios">Dormitorios</Label>
                    <Input
                      id="dormitorios"
                      type="number"
                      min="0"
                      {...register('dormitorios', { valueAsNumber: true })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="baños">Baños</Label>
                    <Input
                      id="baños"
                      type="number"
                      min="0"
                      {...register('baños', { valueAsNumber: true })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="superficie">Superficie (m²)</Label>
                  <Input
                    id="superficie"
                    type="number"
                    min="0"
                    placeholder="Ej: 100"
                    {...register('superficie', { valueAsNumber: true })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <textarea
                    id="descripcion"
                    rows={6}
                    className="w-full border border-gray-300 rounded-md p-2 mt-1"
                    placeholder="Descripción detallada de la propiedad..."
                    {...register('descripcion')}
                  ></textarea>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="destacada"
                    className="rounded border-gray-300"
                    {...register('destacada')}
                  />
                  <Label htmlFor="destacada">Marcar como destacada</Label>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset()}
                >
                  Limpiar
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab('imagenes')}
                >
                  Siguiente: Imágenes
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="imagenes" className="space-y-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="imagenPrincipal" className="block mb-2">
                    Imagen Principal *
                  </Label>
                  <input
                    id="imagenPrincipal"
                    type="file"
                    accept="image/*"
                    onChange={handleImagenPrincipalChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center">
                    {previewPrincipal ? (
                      <div className="relative">
                        <img
                          src={previewPrincipal}
                          alt="Preview"
                          className="max-h-64 w-auto mb-2 rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImagenPrincipal(null);
                            setPreviewPrincipal(null);
                          }}
                        >
                          X
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:bg-gray-50"
                        onClick={() => document.getElementById('imagenPrincipal')?.click()}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 mx-auto text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="mt-2">Haga clic para seleccionar una imagen principal</p>
                        <p className="text-sm text-gray-500 mt-1">
                          (Recomendado: 1200x900px o menor)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="imagenesAdicionales" className="block mb-2">
                    Imágenes Adicionales (máximo 9)
                  </Label>
                  <input
                    id="imagenesAdicionales"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagenesAdicionalesChange}
                    disabled={imagenesAdicionales.length >= 9}
                    className="hidden"
                  />
                  
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 mb-4"
                    onClick={() => document.getElementById('imagenesAdicionales')?.click()}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 mx-auto text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <p className="mt-2">
                      {imagenesAdicionales.length >= 9
                        ? "Límite de imágenes alcanzado"
                        : "Haga clic para agregar más imágenes"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {`${imagenesAdicionales.length}/9 imágenes`}
                    </p>
                  </div>

                  {previewsAdicionales.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                      {previewsAdicionales.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="h-24 w-full object-cover rounded"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => removeImagen(index)}
                          >
                            X
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('informacion')}
                >
                  Volver
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting || !imagenPrincipal}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creando propiedad...
                    </span>
                  ) : (
                    "Crear Propiedad"
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </Card>
    </div>
  );
};

export default NuevaPropiedadForm;
