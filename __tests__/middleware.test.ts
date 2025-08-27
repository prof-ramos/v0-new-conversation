// Mock do NextResponse
const mockRedirect = jest.fn();
const mockNextResponse = {
  next: jest.fn().mockReturnValue({
    cookies: {
      set: jest.fn(),
    },
  }),
  redirect: mockRedirect,
};

jest.mock("next/server", () => ({
  NextResponse: mockNextResponse,
  NextRequest: jest.fn(),
}));

// Mock do createServerClient
const mockCreateServerClient = jest.fn().mockReturnValue({
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    }),
  },
});

jest.mock("@supabase/ssr", () => ({
  createServerClient: mockCreateServerClient,
}));

import { updateSession } from "@/lib/supabase/middleware";

describe("Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call createServerClient with correct parameters", async () => {
    const mockRequest = {
      cookies: {
        getAll: jest.fn().mockReturnValue([]),
        set: jest.fn(),
      },
      nextUrl: {
        pathname: "/dashboard",
        clone: jest.fn().mockReturnValue({
          pathname: "/dashboard",
        }),
      },
    };

    await updateSession(mockRequest);

    expect(mockCreateServerClient).toHaveBeenCalledWith(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      })
    );
  });

  it("should redirect to login when user is not authenticated and not on auth pages", async () => {
    const mockRequest = {
      cookies: {
        getAll: jest.fn().mockReturnValue([]),
        set: jest.fn(),
      },
      nextUrl: {
        pathname: "/dashboard",
        clone: jest.fn().mockReturnValue({
          pathname: "/auth/login",
        }),
      },
    };

    await updateSession(mockRequest);

    // Verifica se o redirect foi chamado
    expect(mockRedirect).toHaveBeenCalled();
  });
});