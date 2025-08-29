import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignUpPage from "@/app/auth/sign-up/page";

// Mock do Next.js router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock do Supabase client
const mockSignUp = jest.fn();
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
    },
  }),
}));

describe("SignUpPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render sign up form correctly", () => {
    render(<SignUpPage />);

    expect(screen.getByText("Sign up")).toBeInTheDocument();
    expect(screen.getByText("Create a new account")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/repeat password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByText("Already have an account?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
  });

  it("should handle successful sign up", async () => {
    const user = userEvent.setup();

    // Mock da resposta de sucesso
    mockSignUp.mockResolvedValueOnce({
      data: {
        user: { id: "123", email: "test@example.com" },
      },
      error: null,
    });

    render(<SignUpPage />);

    // Preencher formulário
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.type(screen.getByLabelText(/repeat password/i), "password123");

    // Submeter formulário
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    // Verificar chamada da API
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        options: {
          emailRedirectTo: expect.stringContaining("/protected"),
        },
      });
    });

    // Verificar redirecionamento para página de sucesso
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/sign-up-success");
    });
  });

  it("should handle password mismatch error", async () => {
    const user = userEvent.setup();

    render(<SignUpPage />);

    // Preencher formulário com senhas diferentes
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.type(screen.getByLabelText(/repeat password/i), "differentpassword");

    // Submeter formulário
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    // Verificar exibição do erro de senhas não coincidentes
    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });

    // Verificar que a API não foi chamada
    expect(mockSignUp).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should handle sign up error", async () => {
    const user = userEvent.setup();
    const errorMessage = "Email already exists";

    // Mock da resposta de erro
    mockSignUp.mockResolvedValueOnce({
      data: { user: null },
      error: { message: errorMessage },
    });

    render(<SignUpPage />);

    // Preencher formulário
    await user.type(screen.getByLabelText(/email/i), "existing@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.type(screen.getByLabelText(/repeat password/i), "password123");

    // Submeter formulário
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    // Verificar exibição do erro
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Verificar que não redirecionou
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should validate required fields", async () => {
    const user = userEvent.setup();

    render(<SignUpPage />);

    // Tentar submeter sem preencher campos
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    // Verificar que a API não foi chamada (validação HTML5)
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("should show loading state during submission", async () => {
    const user = userEvent.setup();

    // Mock com delay para simular loading
    mockSignUp.mockImplementation(
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

    render(<SignUpPage />);

    // Preencher formulário
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.type(screen.getByLabelText(/repeat password/i), "password123");

    // Submeter formulário
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    // Verificar estado de loading
    expect(screen.getByRole("button", { name: /creating an account/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /creating an account/i })).toBeDisabled();

    // Aguardar conclusão
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/sign-up-success");
    });
  });

  it("should handle network errors", async () => {
    const user = userEvent.setup();
    const networkError = new Error("Network error");

    // Mock de erro de rede
    mockSignUp.mockRejectedValueOnce(networkError);

    render(<SignUpPage />);

    // Preencher formulário
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.type(screen.getByLabelText(/repeat password/i), "password123");

    // Submeter formulário
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    // Verificar exibição do erro
    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("should clear error message on new submission", async () => {
    const user = userEvent.setup();

    // Primeiro mock: erro
    mockSignUp.mockResolvedValueOnce({
      data: { user: null },
      error: { message: "First error" },
    });

    // Segundo mock: sucesso
    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: "123" } },
      error: null,
    });

    render(<SignUpPage />);

    // Primeira tentativa (erro)
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.type(screen.getByLabelText(/repeat password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText("First error")).toBeInTheDocument();
    });

    // Segunda tentativa (sucesso)
    await user.clear(screen.getByLabelText(/email/i));
    await user.clear(screen.getByLabelText(/password/i));
    await user.clear(screen.getByLabelText(/repeat password/i));
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.type(screen.getByLabelText(/repeat password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    // Verificar que o erro foi limpo e redirecionou
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/sign-up-success");
    });

    // O erro antigo não deve mais estar visível
    expect(screen.queryByText("First error")).not.toBeInTheDocument();
  });

  it("should have correct form attributes", () => {
    render(<SignUpPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const repeatPasswordInput = screen.getByLabelText(/repeat password/i);

    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("required");
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute("required");
    expect(repeatPasswordInput).toHaveAttribute("type", "password");
    expect(repeatPasswordInput).toHaveAttribute("required");
  });

  it("should navigate to login page", () => {
    render(<SignUpPage />);

    const loginLink = screen.getByRole("link", { name: /login/i });
    expect(loginLink).toHaveAttribute("href", "/auth/login");
  });
});
