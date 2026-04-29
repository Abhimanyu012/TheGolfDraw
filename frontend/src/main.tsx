import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from '@/app/queryClient';
import { router } from '@/app/router';
import { AuthBootstrap } from '@/app/providers';
import '@/styles/globals.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap>
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </AuthBootstrap>
    </QueryClientProvider>
  </React.StrictMode>,
);