import { useEffect, useMemo, useState } from "react";
import { getHtmlReportUrl, getPdfReportUrl } from "../../api/sudokuApi";
import { useGame } from "../context/GameContext";
import "./Controls.css";

function Controls() {
  const {
    fetchNewGame,
    solveCurrentBoard,
    saveCurrentGame,
    loadSpecificGameByName,
    deleteGame,
    fetchSavedGames,
    savedGamesList,
    isLoading,
    gameId,
    isCreating,
    startCreateMode,
    playCustomGame,
  } = useGame();

  const [difficulty, setDifficulty] = useState("easy");

  // --- Стани для меню ---
  const [isLoadMenuOpen, setIsLoadMenuOpen] = useState(false);
  const [isSaveMenuOpen, setIsSaveMenuOpen] = useState(false); // Для меню збереження

  const [loadName, setLoadName] = useState("");
  const [saveName, setSaveName] = useState(""); // Для поля вводу назви збереження

  // Завантажуємо список ігор при першому рендері
  useEffect(() => {
    fetchSavedGames();
  }, [fetchSavedGames]);

  // Миттєва валідація назви збереження
  const isNameTaken = useMemo(() => {
    if (!saveName) return false;
    // Перевіряємо, чи введена назва вже є у списку
    return savedGamesList.some(game => game.name === saveName.trim());
  }, [saveName, savedGamesList]);

  // --- Обробники подій ---

  const handleNewGame = () => fetchNewGame(difficulty);
  const handleSolve = () => solveCurrentBoard();
  const handleReportHtml = () => window.open(getHtmlReportUrl(), "_blank");
  const handleReportPdf = () => (window.location.href = getPdfReportUrl());

  // Нова логіка збереження
  const handleOpenSaveMenu = () => {
    if (!gameId) return alert("No active game to save!");
    setIsSaveMenuOpen(true);
    setSaveName("");
  };

  const handleConfirmSave = () => {
    const finalName = saveName.trim();
    if (!finalName || isNameTaken) return; // Подвійна перевірка

    saveCurrentGame(finalName);
    setIsSaveMenuOpen(false); // Закриваємо меню
  };

  // Логіка завантаження
  const handleLoad = () => {
    if (!loadName) return alert("Please select a game to load.");
    loadSpecificGameByName(loadName);
    setIsLoadMenuOpen(false);
  };

  // Логіка видалення
  const handleDelete = () => {
    if (!loadName) return alert("Please select a game to delete.");

    const isConfirmed = window.confirm(
      `Are you sure you want to delete the game: "${loadName}"?`
    );

    if (isConfirmed) {
      deleteGame(loadName);
      setLoadName("");
    }
  };

  // --- РЕНДЕРИНГ (4 РІЗНИХ СТАНИ) ---

  // Стан 1: Користувач створює свою гру
  if (isCreating) {
    return (
      <div className='controls-container'>
        <div className='control-group'>
          <span>Enter your data into the grid</span>
        </div>
        <div className='control-group'>
          <button onClick={playCustomGame} disabled={isLoading}>
            {isLoading ? "Audit..." : "Play"}
          </button>
          <button
            onClick={() => startCreateMode(true)}
            disabled={isLoading}
            className='delete-btn'
          >
            Clean
          </button>
          <button
            onClick={() => window.location.reload()}
            disabled={isLoading}
            className='report-btn'
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (isLoadMenuOpen) {
    return (
      <div className='controls-container is-load-menu'>
        <div className='control-group'>
          <select
            value={loadName}
            onChange={e => setLoadName(e.target.value)}
            disabled={isLoading}
            className='load-select'
          >
            <option value='' className='option'>
              --Choose a game--
            </option>
            {savedGamesList.map(game => (
              <option key={game.name} value={game.name}>
                {game.name} ({new Date(game.start_time).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
        <div className='control-group'>
          <button onClick={handleLoad} disabled={isLoading || !loadName}>
            Load
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading || !loadName}
            className='delete-btn'
          >
            Delete
          </button>
        </div>
        <div className='control-group'>
          <button
            onClick={() => setIsLoadMenuOpen(false)}
            disabled={isLoading}
            className='report-btn'
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Стан 3: Користувач відкрив меню збереження
  if (isSaveMenuOpen) {
    return (
      <div className='controls-container is-save-menu'>
        <div className='control-group'>
          <input
            type='text'
            placeholder='Enter save name...'
            value={saveName}
            onChange={e => setSaveName(e.target.value)}
            disabled={isLoading}
            className='load-input'
            autoFocus
          />
        </div>

        {isNameTaken && (
          <div className='validation-error'>This name is already taken.</div>
        )}

        <div className='control-group'>
          <button
            onClick={handleConfirmSave}
            disabled={isLoading || isNameTaken || !saveName.trim()}
          >
            Confirm Save
          </button>
          <button
            onClick={() => setIsSaveMenuOpen(false)}
            disabled={isLoading}
            className='report-btn'
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Стан 4: Головне меню (за замовчуванням)
  return (
    <div className='controls-container'>
      <div className='control-group'>
        <select
          value={difficulty}
          onChange={e => setDifficulty(e.target.value)}
          disabled={isLoading}
          className='select'
        >
          <option value='easy'>Easy</option>
          <option value='medium'>Medium</option>
          <option value='hard'>Hard</option>
        </select>
        <button onClick={handleNewGame} disabled={isLoading}>
          {isLoading ? "Generating..." : "New Game"}
        </button>
        <button
          onClick={startCreateMode}
          disabled={isLoading}
          className='report-btn'
        >
          Create
        </button>
      </div>

      {/* --- Дії з грою --- */}
      <div className='control-group'>
        <button onClick={handleSolve} disabled={isLoading || !gameId}>
          Solve
        </button>
        <button
          onClick={handleOpenSaveMenu} // ❗️ Змінено
          disabled={isLoading || !gameId}
        >
          Save
        </button>
      </div>

      {/* --- Завантаження та Звіти --- */}
      <div className='control-group'>
        <button onClick={() => setIsLoadMenuOpen(true)} disabled={isLoading}>
          Load / Manage
        </button>
        <button
          onClick={handleReportHtml}
          disabled={isLoading}
          className='report-btn'
        >
          Report (HTML)
        </button>
        <button
          onClick={handleReportPdf}
          disabled={isLoading}
          className='report-btn'
        >
          Report (PDF)
        </button>
      </div>
    </div>
  );
}

export default Controls;
