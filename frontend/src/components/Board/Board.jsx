import Cell from "../Cell/Cell";
import { useGame } from "../context/GameContext";
import "./Board.css";

function Board() {
  const { board, selectedCell, setSelectedCell } = useGame();

  const handleKeyDown = e => {
    if (!selectedCell) return;

    let { row, col } = selectedCell;

    switch (e.key) {
      case "ArrowUp":
        row = Math.max(row - 1, 0);
        break;
      case "ArrowDown":
        row = Math.min(row + 1, 8);
        break;
      case "ArrowLeft":
        col = Math.max(col - 1, 0);
        break;
      case "ArrowRight":
        col = Math.min(col + 1, 8);
        break;
      default:
        return;
    }

    e.preventDefault();
    setSelectedCell({ row, col });
  };

  if (!board) {
    return <div>Loading board...</div>;
  }

  return (
    <div className='board-grid' onKeyDown={handleKeyDown} tabIndex={0}>
      {board.map((row, rowIndex) =>
        row.map((value, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            row={rowIndex}
            col={colIndex}
            value={value}
          />
        ))
      )}
    </div>
  );
}

export default Board;
