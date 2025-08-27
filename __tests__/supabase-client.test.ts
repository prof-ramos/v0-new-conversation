// Mock do createBrowserClient
const mockCreateBrowserClient = jest.fn().mockReturnValue({
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }),
});

jest.mock("@supabase/ssr", () => ({
  createBrowserClient: mockCreateBrowserClient,
}));

import { createClient } from "@/lib/supabase/client";

describe("Supabase Client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a browser client with correct parameters", () => {
    createClient();

    expect(mockCreateBrowserClient).toHaveBeenCalledWith(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  });

  it("should return a client object with expected methods", () => {
    const client = createClient();

    expect(client).toHaveProperty("auth");
    expect(client).toHaveProperty("from");
    expect(typeof client.auth.signUp).toBe("function");
    expect(typeof client.auth.signInWithPassword).toBe("function");
    expect(typeof client.auth.signOut).toBe("function");
  });
});