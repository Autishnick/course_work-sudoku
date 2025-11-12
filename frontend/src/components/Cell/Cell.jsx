import { useEffect, useRef } from "react";
import { useGame } from "../context/GameContext";
import "./Cell.css";

function Cell({ row, col, value }) {
  const {
    initialBoard,
    updateCell,
    isLoading,
    solution,
    isCreating,
    validationErrors,
    selectedCell,
    setSelectedCell,
  } = useGame();

  const inputRef = useRef(null);

  const isGiven = initialBoard[row][col] !== 0;

  const isIncorrect =
    !isGiven && value !== 0 && solution && solution[row][col] !== value;

  const isInvalid = isCreating && validationErrors.has(`${row}-${col}`);

  const isSelected =
    selectedCell && selectedCell.row === row && selectedCell.col === col;

  useEffect(() => {
    if (isSelected) {
      inputRef.current.focus();
    }
  }, [isSelected]);

  const handleChange = e => {
    const rawValue = e.target.value;

    if (rawValue === "") {
      updateCell(row, col, 0);
      return;
    }

    const num = parseInt(rawValue.replace(/[^1-9]/g, ""), 10);

    if (!isNaN(num) && num >= 1 && num <= 9) {
      updateCell(row, col, num);
    }
  };

  const classNames = [
    "cell-component",
    isSelected ? "is-selected" : "",
    isGiven && !isCreating ? "is-given" : "",
    !isCreating && isIncorrect ? "is-incorrect" : "",
    isInvalid ? "is-invalid-creation" : "",
    col === 2 || col === 5 ? "border-thick-right" : "",
    row === 2 || row === 5 ? "border-thick-bottom" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <input
      ref={inputRef}
      type='text'
      className={classNames}
      value={value === 0 ? "" : value}
      readOnly={(!isCreating && isGiven) || isLoading}
      onChange={handleChange}
      onClick={() => setSelectedCell({ row, col })}
      maxLength={1}
      pattern='[1-9]'
    />
  );
}

export default Cell;
