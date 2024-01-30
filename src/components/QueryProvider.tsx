<<<<<<< HEAD
"use client";

import React, { ReactNode } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

type QueryProviderProps = {
  children: ReactNode;
};

const queryClient = new QueryClient();

function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default QueryProvider;
=======
'use client'

import React, { ReactNode } from 'react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

type QueryProviderProps = {
    children: ReactNode
}

const queryClient = new QueryClient()

function QueryProvider({children}: QueryProviderProps) {

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

export default QueryProvider
>>>>>>> e623c539c03ec9aa5a916fa2fd932718eb9c914b
