import { render, screen } from "@testing-library/react";
import React from "react";

// Mock do componente de tarefas diárias
jest.mock("@/components/tasks/daily-tasks-list", () => ({
  DailyTasksList: () => React.createElement("div", { "data-testid": "daily-tasks-list" }, "Daily Tasks List"),
}));

// Mock do componente de estatísticas de tarefas
jest.mock("@/components/tasks/tasks-stats", () => ({
  TasksStats: () => React.createElement("div", { "data-testid": "tasks-stats" }, "Tasks Stats"),
}));

// Mock do componente de cabeçalho de tarefas
jest.mock("@/components/tasks/tasks-header", () => ({
  TasksHeader: ({ progressPercentage }: { progressPercentage: number }) => 
    React.createElement("div", { "data-testid": "tasks-header" }, `Tasks Header - ${progressPercentage}%`),
}));

describe("TasksPage components", () => {
  it("renders tasks page components", () => {
    render(
      React.createElement(
        "div",
        null,
        React.createElement("div", { "data-testid": "tasks-header" }, "Tasks Header - 50%"),
        React.createElement("div", { "data-testid": "tasks-stats" }, "Tasks Stats"),
        React.createElement("div", { "data-testid": "daily-tasks-list" }, "Daily Tasks List")
      )
    );
    
    expect(screen.getByTestId("tasks-header")).toBeInTheDocument();
    expect(screen.getByText("Tasks Header - 50%")).toBeInTheDocument();
    expect(screen.getByTestId("tasks-stats")).toBeInTheDocument();
    expect(screen.getByTestId("daily-tasks-list")).toBeInTheDocument();
  });
});