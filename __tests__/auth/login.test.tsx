import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/auth/login/page";

// Mock do Next.js router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock do Supabase client
const mockSignInWithPassword = jest.fn();
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render login form correctly", () => {
    render(<LoginPage />);

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Enter your email below to login to your account")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
  });

  it("should handle successful login", async () => {
    const user = userEvent.setup();

    // Mock da resposta de sucesso
    mockSignInWithPassword.mockResolvedValueOnce({
      data: {
        user: { id: "123", email: "test@example.com" },
      },
      error: null,
    });

    render(<LoginPage />);

    // Preencher formulário
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");

    // Submeter formulário
    await user.click(screen.getByRole("button", { name: /login/i }));

    // Verificar chamada da API
    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        options: {
          emailRedirectTo: expect.stringContaining("/protected"),
        },
      });
    });

    // Verificar redirecionamento
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/protected");
    });
  });

  it("should handle login error", async () => {
    const user = userEvent.setup();
    const errorMessage = "Invalid login credentials";

    // Mock da resposta de erro
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: null },
      error: { message: errorMessage },
    });

    render(<LoginPage />);

    // Preencher formulário
    await user.type(screen.getByLabelText(/email/i), "wrong@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpassword");

    // Submeter formulário
    await user.click(screen.getByRole("button", { name: /login/i }));

    // Verificar exibição do erro
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Verificar que não redirecionou
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should validate required fields", async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    // Tentar submeter sem preencher campos
    await user.click(screen.getByRole("button", { name: /login/i }));

    // Verificar que a API não foi chamada (validação HTML5)
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it("should show loading state during submission", async () => {
    const user = userEvent.setup();

    // Mock com delay para simular loading
    mockSignInWithPassword.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                data: { user: { id: "123" } },
                error: null,
              }),
            100
          )
        )
    );

    render(<LoginPage />);

    // Preencher formulário
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");

    // Submeter formulário
    await user.click(screen.getByRole("button", { name: /login/i }));

    // Verificar estado de loading
    expect(screen.getByRole("button", { name: /logging in/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logging in/i })).toBeDisabled();

    // Aguardar conclusão
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/protected");
    });
  });

  it("should handle network errors", async () => {
    const user = userEvent.setup();
    const networkError = new Error("Network error");

    // Mock de erro de rede
    mockSignInWithPassword.mockRejectedValueOnce(networkError);

    render(<LoginPage />);

    // Preencher formulário
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");

    // Submeter formulário
    await user.click(screen.getByRole("button", { name: /login/i }));

    // Verificar exibição do erro
    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("should clear error message on new submission", async () => {
    const user = userEvent.setup();

    // Primeiro mock: erro
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: null },
      error: { message: "First error" },
    });

    // Segundo mock: sucesso
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: { id: "123" } },
      error: null,
    });

    render(<LoginPage />);

    // Primeira tentativa (erro)
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText("First error")).toBeInTheDocument();
    });

    // Segunda tentativa (sucesso)
    await user.clear(screen.getByLabelText(/email/i));
    await user.clear(screen.getByLabelText(/password/i));
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /login/i }));

    // Verificar que o erro foi limpo e redirecionou
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/protected");
    });

    // O erro antigo não deve mais estar visível
    expect(screen.queryByText("First error")).not.toBeInTheDocument();
  });

  it("should have correct form attributes", () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("required");
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute("required");
  });

  it("should navigate to sign up page", () => {
    render(<LoginPage />);

    const signUpLink = screen.getByRole("link", { name: /sign up/i });
    expect(signUpLink).toHaveAttribute("href", "/auth/sign-up");
  });
});
