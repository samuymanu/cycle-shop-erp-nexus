
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/layout/LoginForm';
import MainLayout from '@/components/layout/MainLayout';

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h1 className="text-xl font-medium">Cargando Sistema ERP...</h1>
        </div>
      </div>
    );
  }

  return user ? <MainLayout /> : <LoginForm />;
};

export default Index;
