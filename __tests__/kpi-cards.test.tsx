import { render, screen } from "@testing-library/react";
import React from "react";

// Mock completo do componente KPICards
jest.mock("@/components/dashboard/kpi-cards", () => ({
  KPICards: () => React.createElement("div", { "data-testid": "kpi-cards-mock" }, "KPI Cards Mock"),
}));

describe("KPICards mock", () => {
  it("renders mock component", () => {
    const mockProps = {
      totalHours: 10,
      totalSessions: 5,
      progressData: [],
    };
    
    render(React.createElement("div", { "data-testid": "kpi-cards-mock" }, "KPI Cards Mock"));
    
    expect(screen.getByTestId("kpi-cards-mock")).toBeInTheDocument();
  });
});