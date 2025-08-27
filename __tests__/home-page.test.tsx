import { render, screen } from "@testing-library/react";
import React from "react";

// Mock do Next.js router
const mockRedirect = jest.fn();
jest.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

// Mock do Supabase client
const mockCreateClient = jest.fn().mockResolvedValue({
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    }),
  },
});

jest.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

describe("HomePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to login when user is not authenticated", async () => {
    // Import dinâmico para evitar problemas de carregamento
    const HomePage = (await import("@/app/page")).default;
    
    // Renderiza o componente
    render(React.createElement(HomePage));
    
    // Aguarda o próximo tick para que o efeito assíncrono seja resolvido
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Verifica se o redirect foi chamado
    expect(mockRedirect).toHaveBeenCalledWith("/auth/login");
  });
});