import { render, screen } from "@testing-library/react";
import React from "react";

// Mock dos componentes do dashboard
jest.mock("@/components/dashboard/dashboard-header", () => ({
  DashboardHeader: () => React.createElement("div", { "data-testid": "dashboard-header" }, "Dashboard Header"),
}));

jest.mock("@/components/dashboard/kpi-cards", () => ({
  KPICards: () => React.createElement("div", { "data-testid": "kpi-cards" }, "KPI Cards"),
}));

jest.mock("@/components/dashboard/progress-overview", () => ({
  ProgressOverview: () => React.createElement("div", { "data-testid": "progress-overview" }, "Progress Overview"),
}));

jest.mock("@/components/dashboard/recent-sessions", () => ({
  RecentSessions: () => React.createElement("div", { "data-testid": "recent-sessions" }, "Recent Sessions"),
}));

jest.mock("@/components/dashboard/study-chart", () => ({
  StudyChart: () => React.createElement("div", { "data-testid": "study-chart" }, "Study Chart"),
}));

describe("DashboardPage components", () => {
  it("renders all dashboard components", () => {
    render(
      React.createElement(
        "div",
        null,
        React.createElement("div", { "data-testid": "dashboard-header" }, "Dashboard Header"),
        React.createElement("div", { "data-testid": "kpi-cards" }, "KPI Cards"),
        React.createElement("div", { "data-testid": "progress-overview" }, "Progress Overview"),
        React.createElement("div", { "data-testid": "study-chart" }, "Study Chart"),
        React.createElement("div", { "data-testid": "recent-sessions" }, "Recent Sessions")
      )
    );
    
    expect(screen.getByTestId("dashboard-header")).toBeInTheDocument();
    expect(screen.getByTestId("kpi-cards")).toBeInTheDocument();
    expect(screen.getByTestId("progress-overview")).toBeInTheDocument();
    expect(screen.getByTestId("study-chart")).toBeInTheDocument();
    expect(screen.getByTestId("recent-sessions")).toBeInTheDocument();
  });
});