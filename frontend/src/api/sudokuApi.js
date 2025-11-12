import axios from "axios";
const API_URL = "https://my-sudoku-api.onrender.com";
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Обгортка для обробки помилок
 * @param {Promise} requestPromise - Запит, який ми надсилаємо
 * @returns {Promise<[any, any]>} - Повертає [data, error]
 */
const handleRequest = async requestPromise => {
  try {
    const response = await requestPromise;
    return [response.data, null];
  } catch (error) {
    console.error("API Error:", error.response || error.message);
    return [null, error.response?.data || { message: error.message }];
  }
};

// --- Експортовані функції API ---

/**
 * Запитує у сервера нову головоломку.
 * @param {string} difficulty - "easy", "medium", or "hard"
 * @returns {Promise<[object, null] | [null, object]>} [data, error]
 */
export const generateNewGame = difficulty => {
  return handleRequest(
    apiClient.post("/api/generate", { difficulty: difficulty })
  );
};

/**
 * Надсилає поточне поле на сервер для вирішення.
 * @param {number[][]} board - Масив 9x9
 * @returns {Promise<[object, null] | [null, object]>} [data, error]
 */
export const solveBoard = board => {
  return handleRequest(apiClient.post("/api/solve", { board: board }));
};

/**
 * Зберігає поточний стан гри в БД.
 * @param {number} game_id - ID гри з БД
 * @param {number[][]} board - Поточний стан дошки 9x9
 * @returns {Promise<[object, null] | [null, object]>} [data, error]
 */
export const saveGame = (game_id, board, name) => {
  return handleRequest(
    apiClient.post("/api/save", {
      game_id: game_id,
      current_board: board,
      name: name,
    })
  );
};

/**
 * Завантажує збережену гру з БД.
 * @param {number} game_id - ID гри для завантаження
 * @returns {Promise<[object, null] | [null, object]>} [data, error]
 */
export const loadGameByName = name => {
  const encodedName = encodeURIComponent(name);
  return handleRequest(apiClient.get(`/api/load_by_name/${encodedName}`));
};

/**
 * Повідомляє серверу, що гра завершена (для звітів).
 * @param {number} game_id - ID гри
 * @param {number[][]} final_board - Фінальний стан дошки
 * @returns {Promise<[object, null] | [null, object]>} [data, error]
 */
export const finishGame = (game_id, final_board) => {
  return handleRequest(
    apiClient.post("/api/finish", {
      game_id: game_id,
      final_board: final_board,
    })
  );
};

/**
 * Повертає URL для сторінки звіту.
 * @returns {string}
 */
export const getHtmlReportUrl = () => {
  return `${apiClient.defaults.baseURL}/api/report/html`;
};

export const getPdfReportUrl = () => {
  return `${apiClient.defaults.baseURL}/api/report/pdf`;
};

export const getSavedGamesList = () => {
  return handleRequest(apiClient.get("/api/saves"));
};

export const deleteGameByName = name => {
  const encodedName = encodeURIComponent(name);
  return handleRequest(apiClient.delete(`/api/delete/${encodedName}`));
};

export const startCustomGame = board => {
  return handleRequest(apiClient.post("/api/start_custom_game", { board }));
};
