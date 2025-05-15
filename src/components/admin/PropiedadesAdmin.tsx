import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Database } from '@/integrations/supabase/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Trash2, Plus } from "lucide-react";

type Propiedad = {
  id: string;
  titulo: string;
  precio: number;
  direccion: string;
  tipo: Database["public"]["Enums"]["propiedad_tipo"];
  operacion: Database["public"]["Enums"]["propiedad_operacion"];
  estado: Database["public"]["Enums"]["propiedad_estado"];
  dormitorios: number | null;
  baños: number | null;
  superficie: number | null;
  imagen_principal: string | null;
  imagenes: string[] | null;
  destacada: boolean | null;
  created_at: string;
  descripcion: string | null;
};

const PropiedadesAdmin = () => {
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [loading, setLoading] = useState(true);
  const [propiedadEditar, setPropiedadEditar] = useState<Propiedad | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nuevasImagenes, setNuevasImagenes] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    fetchPropiedades();
  }, []);

  const fetchPropiedades = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('propiedades')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPropiedades(data || []);
    } catch (error: any) {
      console.error('Error cargando propiedades:', error.message);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las propiedades.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditarPropiedad = async (propiedad: Propiedad) => {
    setPropiedadEditar(propiedad);
    setDialogOpen(true);
    setNuevasImagenes([]);
  };

  const handleImageUpload = async () => {
    if (!propiedadEditar || nuevasImagenes.length === 0) return;
    
    try {
      setUploadingImages(true);
      const uploadedUrls: string[] = [];
      
      for (const imagen of nuevasImagenes) {
        // Generate a unique filename using timestamp and random number instead of uuid
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 10000);
        const fileName = `${timestamp}-${randomNum}-${imagen.name}`;
        
        const { data, error } = await supabase.storage
          .from('propiedades')
          .upload(fileName, imagen);
          
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
          .from('propiedades')
          .getPublicUrl(fileName);
          
        uploadedUrls.push(publicUrl);
      }
      
      // Actualizar la propiedad con las nuevas imágenes
      const imagenes = [...(propiedadEditar.imagenes || []), ...uploadedUrls];
      
      // Si no hay imagen principal, usar la primera imagen subida
      const nuevaImagenPrincipal = !propiedadEditar.imagen_principal && uploadedUrls.length > 0
        ? uploadedUrls[0]
        : propiedadEditar.imagen_principal;
      
      // Actualizar la propiedad en la base de datos
      const { error } = await supabase
        .from('propiedades')
        .update({
          imagenes,
          imagen_principal: nuevaImagenPrincipal
        })
        .eq('id', propiedadEditar.id);
        
      if (error) throw error;
      
      // Actualizar el estado local
      setPropiedadEditar({
        ...propiedadEditar,
        imagenes,
        imagen_principal: nuevaImagenPrincipal
      });
      
      setNuevasImagenes([]);
      
      toast({
        title: 'Éxito',
        description: 'Imágenes subidas correctamente.',
      });
    } catch (error: any) {
      console.error('Error subiendo imágenes:', error.message);
      toast({
        title: 'Error',
        description: 'No se pudieron subir las imágenes.',
        variant: 'destructive',
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSelectImagenPrincipal = async (url: string) => {
    if (!propiedadEditar) return;
    
    try {
      const { error } = await supabase
        .from('propiedades')
        .update({
          imagen_principal: url
        })
        .eq('id', propiedadEditar.id);
        
      if (error) throw error;
      
      // Actualizar el estado local
      setPropiedadEditar({
        ...propiedadEditar,
        imagen_principal: url
      });
      
      toast({
        title: 'Éxito',
        description: 'Imagen principal actualizada.',
      });
    } catch (error: any) {
      console.error('Error actualizando imagen principal:', error.message);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la imagen principal.',
        variant: 'destructive',
      });
    }
  };

  const handleEliminarImagen = async (url: string) => {
    if (!propiedadEditar) return;
    
    try {
      // Extraer el nombre del archivo de la URL
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      // Preparar el nuevo array de imágenes sin la imagen eliminada
      const nuevasImagenes = propiedadEditar.imagenes?.filter(img => img !== url) || [];
      
      // Si la imagen eliminada era la principal, seleccionar otra
      let nuevaImagenPrincipal = propiedadEditar.imagen_principal;
      if (propiedadEditar.imagen_principal === url) {
        nuevaImagenPrincipal = nuevasImagenes.length > 0 ? nuevasImagenes[0] : null;
      }
      
      // Actualizar la propiedad en la base de datos
      const { error } = await supabase
        .from('propiedades')
        .update({
          imagenes: nuevasImagenes,
          imagen_principal: nuevaImagenPrincipal
        })
        .eq('id', propiedadEditar.id);
        
      if (error) throw error;
      
      // Actualizar el estado local
      setPropiedadEditar({
        ...propiedadEditar,
        imagenes: nuevasImagenes,
        imagen_principal: nuevaImagenPrincipal
      });
      
      toast({
        title: 'Éxito',
        description: 'Imagen eliminada correctamente.',
      });
    } catch (error: any) {
      console.error('Error eliminando imagen:', error.message);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la imagen.',
        variant: 'destructive',
      });
    }
  };

  const handleGuardarEdicion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!propiedadEditar) return;

    try {
      const { error } = await supabase
        .from('propiedades')
        .update({
          titulo: propiedadEditar.titulo,
          descripcion: propiedadEditar.descripcion,
          precio: propiedadEditar.precio,
          direccion: propiedadEditar.direccion,
          tipo: propiedadEditar.tipo,
          operacion: propiedadEditar.operacion,
          dormitorios: propiedadEditar.dormitorios,
          baños: propiedadEditar.baños,
          superficie: propiedadEditar.superficie,
        })
        .eq('id', propiedadEditar.id);

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Propiedad actualizada correctamente.',
      });

      setDialogOpen(false);
      fetchPropiedades();
    } catch (error: any) {
      console.error('Error actualizando propiedad:', error.message);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la propiedad.',
        variant: 'destructive',
      });
    }
  };

  const cambiarEstado = async (id: string, nuevoEstado: Database["public"]["Enums"]["propiedad_estado"]) => {
    try {
      const { error } = await supabase
        .from('propiedades')
        .update({ estado: nuevoEstado })
        .eq('id', id);

      if (error) throw error;

      setPropiedades(propiedades.map(prop => 
        prop.id === id ? { ...prop, estado: nuevoEstado } : prop
      ));

      toast({
        title: 'Éxito',
        description: `Propiedad ${nuevoEstado === 'eliminada' ? 'eliminada' : nuevoEstado} correctamente.`,
      });
    } catch (error: any) {
      console.error('Error cambiando estado:', error.message);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado de la propiedad.',
        variant: 'destructive',
      });
    }
  };

  const toggleDestacado = async (id: string, destacadaActual: boolean | null) => {
    try {
      const nuevoDestacado = !destacadaActual;
      
      const { error } = await supabase
        .from('propiedades')
        .update({ destacada: nuevoDestacado })
        .eq('id', id);

      if (error) throw error;

      setPropiedades(propiedades.map(prop => 
        prop.id === id ? { ...prop, destacada: nuevoDestacado } : prop
      ));

      toast({
        title: 'Éxito',
        description: `Propiedad ${nuevoDestacado ? 'destacada' : 'quitada de destacados'} correctamente.`,
      });
    } catch (error: any) {
      console.error('Error cambiando destacado:', error.message);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado destacado de la propiedad.',
        variant: 'destructive',
      });
    }
  };

  const formatPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(precio);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getEstadoBadge = (estado: Database["public"]["Enums"]["propiedad_estado"]) => {
    switch (estado) {
      case 'activa':
        return <Badge className="bg-green-600">Activa</Badge>;
      case 'pausada':
        return <Badge className="bg-yellow-600">Pausada</Badge>;
      case 'eliminada':
        return <Badge className="bg-red-600">Eliminada</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Lista de Propiedades</h2>
        <Button onClick={fetchPropiedades}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Actualizar
        </Button>
      </div>

      {propiedades.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No hay propiedades disponibles</h3>
          <p className="text-gray-500">
            Aún no se han agregado propiedades al sistema.
          </p>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Vista previa</TableHead>
                <TableHead className="w-[300px]">Título</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Operación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Destacada</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propiedades.map((propiedad) => (
                <TableRow key={propiedad.id}>
                  <TableCell>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div 
                          className="h-10 w-16 bg-cover bg-center rounded cursor-pointer" 
                          style={{ 
                            backgroundImage: `url(${propiedad.imagen_principal || 'https://via.placeholder.com/150?text=No+imagen'})` 
                          }}
                        />
                      </HoverCardTrigger>
                      <HoverCardContent side="right" className="w-80 p-0">
                        <img 
                          src={propiedad.imagen_principal || 'https://via.placeholder.com/300x200?text=No+imagen'} 
                          alt={propiedad.titulo}
                          className="w-full h-auto rounded-t" 
                        />
                        <div className="p-3">
                          <h3 className="font-medium">{propiedad.titulo}</h3>
                          <p className="text-sm text-gray-500">{propiedad.direccion}</p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </TableCell>
                  <TableCell className="font-medium">
                    {propiedad.titulo}
                    <div className="text-xs text-gray-500">
                      Creada: {formatDate(propiedad.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>{formatPrecio(propiedad.precio)}</TableCell>
                  <TableCell className="capitalize">{propiedad.tipo}</TableCell>
                  <TableCell className="capitalize">{propiedad.operacion}</TableCell>
                  <TableCell>{getEstadoBadge(propiedad.estado)}</TableCell>
                  <TableCell>
                    <Button 
                      variant={propiedad.destacada ? "default" : "outline"} 
                      size="sm"
                      className={propiedad.destacada ? "bg-blue-600 hover:bg-blue-700" : ""}
                      onClick={() => toggleDestacado(propiedad.id, propiedad.destacada)}
                    >
                      {propiedad.destacada ? '★ Destacada' : '☆ No destacada'}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        size="sm"
                        variant="outline"
                        className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700"
                        onClick={() => handleEditarPropiedad(propiedad)}
                      >
                        Editar
                      </Button>
                      {propiedad.estado !== 'activa' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
                          onClick={() => cambiarEstado(propiedad.id, 'activa')}
                        >
                          Activar
                        </Button>
                      )}
                      {propiedad.estado !== 'pausada' && (
                        <Button 
                          size="sm"
                          variant="outline"
                          className="bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-700"
                          onClick={() => cambiarEstado(propiedad.id, 'pausada')}
                        >
                          Pausar
                        </Button>
                      )}
                      {propiedad.estado !== 'eliminada' && (
                        <Button 
                          size="sm"
                          variant="outline"
                          className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
                          onClick={() => cambiarEstado(propiedad.id, 'eliminada')}
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Propiedad</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGuardarEdicion} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={propiedadEditar?.titulo || ''}
                  onChange={(e) => setPropiedadEditar(prev => prev ? {...prev, titulo: e.target.value} : null)}
                />
              </div>
              <div>
                <Label htmlFor="precio">Precio</Label>
                <Input
                  id="precio"
                  type="number"
                  value={propiedadEditar?.precio || ''}
                  onChange={(e) => setPropiedadEditar(prev => prev ? {...prev, precio: Number(e.target.value)} : null)}
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <select
                  id="tipo"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={propiedadEditar?.tipo || ''}
                  onChange={(e) => setPropiedadEditar(prev => prev ? {...prev, tipo: e.target.value as any} : null)}
                >
                  <option value="casa">Casa</option>
                  <option value="departamento">Departamento</option>
                  <option value="terreno">Terreno</option>
                  <option value="local">Local</option>
                  <option value="oficina">Oficina</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <Label htmlFor="operacion">Operación</Label>
                <select
                  id="operacion"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={propiedadEditar?.operacion || ''}
                  onChange={(e) => setPropiedadEditar(prev => prev ? {...prev, operacion: e.target.value as any} : null)}
                >
                  <option value="venta">Venta</option>
                  <option value="alquiler">Alquiler</option>
                </select>
              </div>
              <div>
                <Label htmlFor="dormitorios">Dormitorios</Label>
                <Input
                  id="dormitorios"
                  type="number"
                  value={propiedadEditar?.dormitorios || ''}
                  onChange={(e) => setPropiedadEditar(prev => prev ? {...prev, dormitorios: Number(e.target.value)} : null)}
                />
              </div>
              <div>
                <Label htmlFor="baños">Baños</Label>
                <Input
                  id="baños"
                  type="number"
                  value={propiedadEditar?.baños || ''}
                  onChange={(e) => setPropiedadEditar(prev => prev ? {...prev, baños: Number(e.target.value)} : null)}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={propiedadEditar?.direccion || ''}
                  onChange={(e) => setPropiedadEditar(prev => prev ? {...prev, direccion: e.target.value} : null)}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <textarea
                  id="descripcion"
                  className="w-full border border-gray-300 rounded-md p-2 min-h-[100px]"
                  value={propiedadEditar?.descripcion || ''}
                  onChange={(e) => setPropiedadEditar(prev => prev ? {...prev, descripcion: e.target.value} : null)}
                />
              </div>
            </div>
            
            {/* Nueva sección para gestionar imágenes */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Imágenes de la propiedad</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <Label className="mb-2 block">Agregar nuevas imágenes</Label>
                  <Input
                    id="nuevas-imagenes"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setNuevasImagenes(files);
                    }}
                  />
                  {nuevasImagenes.length > 0 && (
                    <Button 
                      type="button"
                      className="mt-2 bg-blue-600 hover:bg-blue-700"
                      onClick={handleImageUpload}
                      disabled={uploadingImages}
                    >
                      {uploadingImages ? 'Subiendo...' : 'Subir imágenes'}
                    </Button>
                  )}
                </div>
                
                <div>
                  <Label className="mb-2 block">Imagen principal actual</Label>
                  {propiedadEditar?.imagen_principal ? (
                    <div className="rounded-md overflow-hidden border border-gray-200">
                      <AspectRatio ratio={16/9}>
                        <img
                          src={propiedadEditar.imagen_principal}
                          alt="Imagen principal"
                          className="w-full h-full object-cover"
                        />
                      </AspectRatio>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No hay imagen principal</p>
                  )}
                </div>
              </div>
              
              <Label className="mb-2 block">Todas las imágenes</Label>
              {(propiedadEditar?.imagenes && propiedadEditar.imagenes.length > 0) ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {propiedadEditar.imagenes.map((url, index) => (
                    <div key={index} className="relative group">
                      <AspectRatio ratio={16/9}>
                        <img
                          src={url}
                          alt={`Imagen ${index + 1}`}
                          className={`w-full h-full object-cover rounded-md border-2 ${
                            propiedadEditar.imagen_principal === url ? 'border-blue-600' : 'border-transparent'
                          }`}
                        />
                      </AspectRatio>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white text-blue-600 hover:bg-blue-50"
                            onClick={() => handleSelectImagenPrincipal(url)}
                          >
                            {propiedadEditar.imagen_principal === url ? 'Principal' : 'Hacer principal'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white text-red-600 hover:bg-red-50"
                            onClick={() => handleEliminarImagen(url)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No hay imágenes para esta propiedad</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Guardar Cambios
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropiedadesAdmin;
