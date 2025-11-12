import { useCallback, useState } from "react";
import * as api from "../../api/sudokuApi";
import { GameContext } from "./GameContext";

const checkValidity = (board, r, c, num) => {
  if (num === 0) return true;

  for (let col = 0; col < 9; col++) {
    if (col !== c && board[r][col] === num) return false;
  }
  for (let row = 0; row < 9; row++) {
    if (row !== r && board[row][c] === num) return false;
  }
  const startRow = r - (r % 3);
  const startCol = c - (c % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const row = i + startRow;
      const col = j + startCol;
      if (row !== r && col !== c && board[row][col] === num) {
        return false;
      }
    }
  }
  return true;
};

const emptyGrid = Array(9)
  .fill(null)
  .map(() => Array(9).fill(0));

export const GameProvider = ({ children }) => {
  const [board, setBoard] = useState(null);
  const [initialBoard, setInitialBoard] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [solution, setSolution] = useState(null);
  const [isSolved, setIsSolved] = useState(false);
  const [savedGamesList, setSavedGamesList] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [validationErrors, setValidationErrors] = useState(new Set());
  const [selectedCell, setSelectedCell] = useState(null);
  const [notification, setNotification] = useState(null);

  const clearNotification = useCallback(() => setNotification(null), []);

  const showNotification = useCallback((message, type = "error") => {
    setNotification({ message, type });
  }, []);

  const fetchNewGame = useCallback(
    async difficulty => {
      setIsLoading(true);
      clearNotification();
      setIsSolved(false);
      setIsCreating(false);
      const [data, err] = await api.generateNewGame(difficulty);
      if (err) {
        showNotification(
          err.message || "Failed to generate new game.",
          "error"
        );
      } else {
        setBoard(data.puzzle);
        setInitialBoard(data.puzzle);
        setGameId(data.game_id);
        setSolution(data.solution);
        setSelectedCell(null);
      }
      setIsLoading(false);
    },
    [showNotification, clearNotification]
  );

  const runValidation = boardToValidate => {
    const newErrors = new Set();
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const num = boardToValidate[r][c];
        if (num !== 0) {
          if (!checkValidity(boardToValidate, r, c, num)) {
            newErrors.add(`${r}-${c}`);
          }
        }
      }
    }
    setValidationErrors(newErrors);
    return newErrors;
  };

  const fetchSavedGames = useCallback(async () => {
    clearNotification();
    const [data, err] = await api.getSavedGamesList();
    if (err) {
      showNotification(
        err.detail || err.message || "Failed to fetch saves.",
        "error"
      );
      return;
    }
    if (data) {
      setSavedGamesList(data.saves || []);
    }
  }, [showNotification, clearNotification]);

  const deleteGame = useCallback(
    async name => {
      if (!name) return;
      setIsLoading(true);
      clearNotification();
      const [_, err] = await api.deleteGameByName(name);
      if (err) {
        showNotification(
          err.detail || err.message || "Failed to delete game.",
          "error"
        );
      } else {
        showNotification("Game deleted!", "success");
        fetchSavedGames();
      }
      setIsLoading(false);
    },
    [fetchSavedGames, showNotification, clearNotification]
  );

  const solveCurrentBoard = useCallback(async () => {
    if (!board) return;
    setIsLoading(true);
    clearNotification();
    const [data, err] = await api.solveBoard(board);
    if (err) {
      showNotification(err.message || "Failed to solve board.", "error");
    } else {
      setBoard(data.solution);
      setIsSolved(true);
    }
    setIsLoading(false);
  }, [board, showNotification, clearNotification]);

  const saveCurrentGame = useCallback(
    async name => {
      if (!gameId || !board) return;
      setIsLoading(true);
      clearNotification();
      const [_, err] = await api.saveGame(gameId, board, name);

      if (err) {
        showNotification(
          err.detail || err.message || "Failed to save game.",
          "error"
        );
      } else {
        showNotification("Game saved successfully!", "success");
        fetchSavedGames();
      }
      setIsLoading(false);
    },
    [gameId, board, fetchSavedGames, showNotification, clearNotification]
  );

  const loadSpecificGameByName = useCallback(
    async name => {
      setIsLoading(true);
      clearNotification();
      setIsSolved(false);
      setIsCreating(false);
      const [data, err] = await api.loadGameByName(name);
      if (err) {
        showNotification(
          err.detail || err.message || "Failed to load game.",
          "error"
        );
      } else {
        setBoard(data.current_board);
        setInitialBoard(data.initial_board);
        setGameId(data.id);
        setSolution(data.solution);
        setSelectedCell(null);
      }
      setIsLoading(false);
    },
    [showNotification, clearNotification]
  );

  const checkWin = (boardToCheck, solutionToCheck) => {
    if (!boardToCheck || !solutionToCheck) {
      return false;
    }
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (
          boardToCheck[i][j] === 0 ||
          boardToCheck[i][j] !== solutionToCheck[i][j]
        ) {
          return false;
        }
      }
    }
    return true;
  };

  const updateCell = (row, col, value) => {
    if (!board || (!isCreating && isSolved)) return;

    const newBoard = board.map(arr => arr.slice());
    newBoard[row][col] = value;

    if (isCreating) {
      runValidation(newBoard);
    }

    setBoard(newBoard);
    setSelectedCell({ row, col });

    if (!isCreating && checkWin(newBoard, solution)) {
      setIsSolved(true);
      if (gameId) {
        api.finishGame(gameId, newBoard);
      }
    }
  };

  const startCreateMode = useCallback(() => {
    setBoard(emptyGrid);
    setInitialBoard(emptyGrid);
    setSolution(null);
    setGameId(null);
    setIsSolved(false);
    setIsCreating(true);
    setError(null);
    clearNotification();
    setValidationErrors(new Set());
    setSelectedCell(null);
  }, [clearNotification]);

  const playCustomGame = useCallback(async () => {
    if (!board) return;

    const errors = runValidation(board);
    if (errors.size > 0) {
      showNotification(
        "Your board contains invalid placements. Please fix them.",
        "error"
      );
      return;
    }

    setIsLoading(true);
    clearNotification();
    const [data, err] = await api.startCustomGame(board);

    if (err) {
      showNotification(
        err.detail || err.message || "Failed to start custom game.",
        "error"
      );
      setIsLoading(false);
    } else {
      setBoard(data.puzzle);
      setInitialBoard(data.puzzle);
      setSolution(data.solution);
      setGameId(data.game_id);
      setIsCreating(false);
      setIsLoading(false);
      setSelectedCell(null);
    }
  }, [board, showNotification, clearNotification]);

  const value = {
    board,
    isSolved,
    initialBoard,
    gameId,
    isLoading,
    solution,
    error,
    savedGamesList,
    fetchNewGame,
    solveCurrentBoard,
    saveCurrentGame,
    loadSpecificGameByName,
    updateCell,
    fetchSavedGames,
    deleteGame,
    isCreating,
    startCreateMode,
    playCustomGame,
    validationErrors,
    notification,
    clearNotification,
    selectedCell,
    setSelectedCell,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
