import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewTaskForm } from "@/components/tasks/new-task-form";

// Mock do Next.js router
const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

// Mock do Supabase client
const mockInsert = jest.fn();
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      insert: mockInsert,
    }),
  }),
}));

describe("NewTaskForm", () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();
  const userId = "test-user-123";

  beforeEach(() => {
    jest.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
  });

  it("should render new task form correctly", () => {
    render(<NewTaskForm userId={userId} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    expect(screen.getByText("Nova Tarefa")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Título da tarefa")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Descrição (opcional)")).toBeInTheDocument();
    expect(screen.getByText("Categoria")).toBeInTheDocument();
    expect(screen.getByText("Prioridade")).toBeInTheDocument();
    expect(screen.getByText("⏱️ Tempo Estimado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Criar Tarefa/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancelar/i })).toBeInTheDocument();

    // Verificar opções de tempo
    [5, 10, 15, 20, 30, 45, 60].forEach(minutes => {
      expect(screen.getByText(`${minutes}min`)).toBeInTheDocument();
    });
  });

  it("should handle successful task creation", async () => {
    const user = userEvent.setup();

    render(<NewTaskForm userId={userId} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    // Preencher formulário
    await user.type(screen.getByPlaceholderText("Título da tarefa"), "Estudar React");
    await user.type(screen.getByPlaceholderText("Descrição (opcional)"), "Estudar hooks e context API");
    
    // Selecionar categoria
    await user.click(screen.getByText("Categoria"));
    await user.click(screen.getByText("📚 Estudo"));
    
    // Selecionar prioridade
    await user.click(screen.getByText("Prioridade"));
    await user.click(screen.getByText("🟢 Baixa"));
    
    // Selecionar tempo estimado
    await user.click(screen.getByText("15min"));
    
    // Submeter formulário
    await user.click(screen.getByRole("button", { name: /Criar Tarefa/i }));

    // Verificar chamada da API
    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: userId,
        titulo: "Estudar React",
        descricao: "Estudar hooks e context API",
        categoria: "estudo",
        prioridade: "baixa",
        tempo_estimado: 15,
        data_vencimento: expect.any(String),
        status: 'pendente'
      });
    });

    // Verificar callbacks
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("should validate required title field", async () => {
    const user = userEvent.setup();

    render(<NewTaskForm userId={userId} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    // Tentar submeter sem título
    await user.click(screen.getByRole("button", { name: /Criar Tarefa/i }));

    // Verificar que a API não foi chamada
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it("should show loading state during submission", async () => {
    const user = userEvent.setup();

    // Mock com delay para simular loading
    mockInsert.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
    );

    render(<NewTaskForm userId={userId} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    // Preencher título
    await user.type(screen.getByPlaceholderText("Título da tarefa"), "Tarefa de teste");

    // Submeter formulário
    await user.click(screen.getByRole("button", { name: /Criar Tarefa/i }));

    // Verificar estado de loading
    expect(screen.getByRole("button", { name: /Criando/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Criando/i })).toBeDisabled();

    // Aguardar conclusão
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("should handle task creation error", async () => {
    const user = userEvent.setup();
    const errorMessage = "Database error";

    // Mock da resposta de erro
    mockInsert.mockResolvedValueOnce({
      error: { message: errorMessage },
    });

    // Mock do console.error para não poluir output
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<NewTaskForm userId={userId} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    // Preencher formulário
    await user.type(screen.getByPlaceholderText("Título da tarefa"), "Tarefa com erro");

    // Submeter formulário
    await user.click(screen.getByRole("button", { name: /Criar Tarefa/i }));

    // Verificar que console.error foi chamado
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith("Erro ao criar tarefa:", expect.any(Error));
    });

    // Verificar que callbacks de sucesso não foram chamados
    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it("should handle cancel action", async () => {
    const user = userEvent.setup();

    render(<NewTaskForm userId={userId} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    // Clicar em cancelar
    await user.click(screen.getByRole("button", { name: /Cancelar/i }));

    // Verificar que callback de cancel foi chamado
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("should toggle time selection correctly", async () => {
    const user = userEvent.setup();

    render(<NewTaskForm userId={userId} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    // Selecionar tempo
    const timeButton = screen.getByText("15min");
    await user.click(timeButton);

    // Verificar que tempo foi selecionado
    expect(screen.getByText("Tempo estimado selecionado:")).toBeInTheDocument();
    expect(screen.getByText("15 minutos")).toBeInTheDocument();

    // Desselecionar tempo
    await user.click(timeButton);

    // Verificar que tempo foi desselecionado
    expect(screen.queryByText("Tempo estimado selecionado:")).not.toBeInTheDocument();
  });

  it("should have correct form attributes", () => {
    render(<NewTaskForm userId={userId} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const titleInput = screen.getByPlaceholderText("Título da tarefa");
    const dateInput = screen.getByDisplayValue(expect.any(String));

    expect(titleInput).toHaveAttribute("required");
    expect(dateInput).toHaveAttribute("type", "date");
    expect(dateInput).toHaveAttribute("required");
  });

  it("should disable submit button when title is empty", async () => {
    const user = userEvent.setup();

    render(<NewTaskForm userId={userId} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    // Verificar que botão está inicialmente desabilitado
    const submitButton = screen.getByRole("button", { name: /Criar Tarefa/i });
    expect(submitButton).toBeDisabled();

    // Preencher título
    await user.type(screen.getByPlaceholderText("Título da tarefa"), "T");

    // Verificar que botão está habilitado
    expect(submitButton).not.toBeDisabled();

    // Limpar título
    await user.clear(screen.getByPlaceholderText("Título da tarefa"));

    // Verificar que botão está desabilitado novamente
    expect(submitButton).toBeDisabled();
  });

  it("should handle optional description field", async () => {
    const user = userEvent.setup();

    render(<NewTaskForm userId={userId} onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    // Preencher apenas título (sem descrição)
    await user.type(screen.getByPlaceholderText("Título da tarefa"), "Tarefa sem descrição");

    // Submeter formulário
    await user.click(screen.getByRole("button", { name: /Criar Tarefa/i }));

    // Verificar chamada da API com descrição null
    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          descricao: null
        })
      );
    });
  });
});
