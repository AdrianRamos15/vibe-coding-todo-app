import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import TaskCard from "./TaskCard";
import { mockItems } from "../test/mock-data";

describe("TaskCard", () => {
  const defaultProps = {
    item: mockItems.simple,
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    onDragStart: vi.fn(),
  };

  it("renders task name", () => {
    render(<TaskCard {...defaultProps} />);
    expect(screen.getByText(mockItems.simple.name)).toBeInTheDocument();
  });

  it("renders task description when provided", () => {
    render(<TaskCard {...defaultProps} item={mockItems.withDescription} />);
    expect(
      screen.getByText(mockItems.withDescription.description),
    ).toBeInTheDocument();
  });

  it("does not render description when empty", () => {
    const itemWithoutDesc = { ...mockItems.simple, description: "" };
    render(<TaskCard {...defaultProps} item={itemWithoutDesc} />);

    // Only the name should be visible
    expect(screen.getByText(itemWithoutDesc.name)).toBeInTheDocument();
    const taskCard = screen.getByTestId(`task-${itemWithoutDesc.id}`);
    expect(taskCard.querySelectorAll("p").length).toBe(0);
  });

  it("renders tags when present", () => {
    render(<TaskCard {...defaultProps} item={mockItems.withTags} />);

    mockItems.withTags.tags.forEach((tag) => {
      expect(screen.getByText(tag.name)).toBeInTheDocument();
    });
  });

  it("does not render tags section when no tags", () => {
    render(<TaskCard {...defaultProps} item={mockItems.simple} />);

    const taskCard = screen.getByTestId(`task-${mockItems.simple.id}`);
    const tagContainer = taskCard.querySelector(".flex.flex-wrap.gap-1\\.5");
    expect(tagContainer).not.toBeInTheDocument();
  });

  it("renders delete button", () => {
    render(<TaskCard {...defaultProps} />);
    expect(
      screen.getByTestId(`delete-task-${mockItems.simple.id}`),
    ).toBeInTheDocument();
  });

  it("renders edit button", () => {
    render(<TaskCard {...defaultProps} />);
    expect(
      screen.getByTestId(`edit-task-${mockItems.simple.id}`),
    ).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(<TaskCard {...defaultProps} onEdit={onEdit} />);

    const editButton = screen.getByTestId(`edit-task-${mockItems.simple.id}`);
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(mockItems.simple);
  });

  it("calls onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<TaskCard {...defaultProps} onDelete={onDelete} />);

    const deleteButton = screen.getByTestId(
      `delete-task-${mockItems.simple.id}`,
    );
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(mockItems.simple.id);
  });

  it("is draggable", () => {
    render(<TaskCard {...defaultProps} />);
    const taskCard = screen.getByTestId(`task-${mockItems.simple.id}`);
    expect(taskCard).toHaveAttribute("draggable", "true");
  });

  it("calls onDragStart when drag starts", () => {
    const onDragStart = vi.fn();
    render(<TaskCard {...defaultProps} onDragStart={onDragStart} />);

    const taskCard = screen.getByTestId(`task-${mockItems.simple.id}`);
    const dragEvent = new Event("dragstart", { bubbles: true });

    taskCard.dispatchEvent(dragEvent);

    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragStart).toHaveBeenCalledWith(
      expect.any(Object),
      mockItems.simple,
    );
  });

  it("has correct styling classes", () => {
    render(<TaskCard {...defaultProps} />);
    const taskCard = screen.getByTestId(`task-${mockItems.simple.id}`);

    expect(taskCard).toHaveClass("group");
    expect(taskCard).toHaveClass("rounded-lg");
    expect(taskCard).toHaveClass("cursor-grab");
  });

  it("does not render due date when not provided", () => {
    render(<TaskCard {...defaultProps} item={mockItems.simple} />);
    expect(
      screen.queryByTestId(`due-date-${mockItems.simple.id}`),
    ).not.toBeInTheDocument();
  });

  it("renders due date when provided", () => {
    const itemWithDueDate = {
      ...mockItems.simple,
      due_date: "2099-12-31T00:00:00",
    };
    render(<TaskCard {...defaultProps} item={itemWithDueDate} />);
    expect(
      screen.getByTestId(`due-date-${itemWithDueDate.id}`),
    ).toBeInTheDocument();
  });

  it("applies green color for due date more than 7 days away", () => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    const itemWithDueDate = {
      ...mockItems.simple,
      due_date: future.toISOString(),
    };
    render(<TaskCard {...defaultProps} item={itemWithDueDate} />);
    const dueDateEl = screen.getByTestId(`due-date-${itemWithDueDate.id}`);
    expect(dueDateEl).toHaveClass("text-green-600");
  });

  it("applies orange color for due date between 1 and 7 days away", () => {
    const future = new Date();
    future.setDate(future.getDate() + 3);
    const itemWithDueDate = {
      ...mockItems.simple,
      due_date: future.toISOString(),
    };
    render(<TaskCard {...defaultProps} item={itemWithDueDate} />);
    const dueDateEl = screen.getByTestId(`due-date-${itemWithDueDate.id}`);
    expect(dueDateEl).toHaveClass("text-orange-500");
  });

  it("applies red color for overdue due date", () => {
    const past = new Date();
    past.setDate(past.getDate() - 1);
    const itemWithDueDate = {
      ...mockItems.simple,
      due_date: past.toISOString(),
    };
    render(<TaskCard {...defaultProps} item={itemWithDueDate} />);
    const dueDateEl = screen.getByTestId(`due-date-${itemWithDueDate.id}`);
    expect(dueDateEl).toHaveClass("text-red-600");
  });
});
