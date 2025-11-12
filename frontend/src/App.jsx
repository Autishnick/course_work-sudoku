// ❗️ Переконайтеся, що шлях до useGame правильний
import "./App.css";
import Board from "./components/Board/Board";
import Controls from "./components/Controls/Controls";
import { useGame } from "./components/context/GameContext";

function App() {
  const {
    board,
    isLoading,
    error,
    isSolved,
    fetchNewGame,
    notification,
    clearNotification,
  } = useGame();

  const handlePlayAgain = () => {
    fetchNewGame("easy");
  };

  return (
    <div className='app-container'>
      {notification && (
        <div className={`notification-bar ${notification.type}`}>
          <span>{notification.message}</span>
          <button
            onClick={clearNotification}
            className='notification-close-btn'
          >
            &times;
          </button>
        </div>
      )}

      <header>
        <h1>Sudoku</h1>
      </header>

      <main>
        <Controls />

        <div className='game-area'>
          {isSolved && (
            <div className='win-overlay'>
              <div className='win-message'>
                <h2>Congratulations!</h2>
                <p>You have successfully solved Sudoku</p>
                <button onClick={handlePlayAgain}>Play again (easy)</button>
              </div>
            </div>
          )}

          {isLoading && <div className='loading-overlay'>Loading...</div>}

          {!isLoading && error && <div className='error-message'>{error}</div>}

          {!isLoading && board && <Board />}

          {!isLoading && !board && !error && (
            <div className='placeholder'>
              <h2>Welcome!</h2>
              <p>Select a difficulty to start a new game.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
