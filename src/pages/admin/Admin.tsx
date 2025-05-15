
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLogin from "@/components/admin/AdminLogin";
import PropiedadesAdmin from "@/components/admin/PropiedadesAdmin";
import NuevaPropiedadForm from "@/components/admin/NuevaPropiedadForm";
import ScrollToTop from "@/components/ScrollToTop";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("propiedades");

  // Verificar si hay una sesión al cargar
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem("adminAuth");
      if (authStatus === "true") {
        setIsAuthenticated(true);
      }
    };
    
    checkAuth();
  }, []);
  
  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem("adminAuth", "true");
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("adminAuth");
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Panel de Administración</h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 w-full flex shadow-md">
            <TabsTrigger value="propiedades" className="flex-1 py-3 font-medium">Propiedades</TabsTrigger>
            <TabsTrigger value="nueva" className="flex-1 py-3 font-medium">Nueva Propiedad</TabsTrigger>
          </TabsList>
          
          <TabsContent value="propiedades">
            <PropiedadesAdmin />
          </TabsContent>
          
          <TabsContent value="nueva">
            <NuevaPropiedadForm onSuccess={() => setActiveTab("propiedades")} />
          </TabsContent>
        </Tabs>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default Admin;
