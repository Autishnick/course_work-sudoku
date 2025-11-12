#include "generator.h"
#include "solver.h" // Нам потрібні обидві функції
#include "board.h"
#include <random>
#include <algorithm>
#include <chrono>
#include <vector>

void fill_diagonal_boxes(Board& board) {
    std::vector<int> nums = {1, 2, 3, 4, 5, 6, 7, 8, 9};
    unsigned seed = std::chrono::system_clock::now().time_since_epoch().count();
    std::mt19937 g(seed);

    for (int i = 0; i < N; i += 3) {
        std::shuffle(nums.begin(), nums.end(), g);
        int k = 0;
        for (int row = 0; row < 3; row++) {
            for (int col = 0; col < 3; col++) {
                board[i + row][i + col] = nums[k++];
            }
        }
    }
}

Board generate_puzzle_function(std::string difficulty) {
    
    // 1. Створюємо повністю вирішене поле
    Board puzzle_board(N, std::vector<int>(N, 0));
    fill_diagonal_boxes(puzzle_board);
    solve_puzzle_function(puzzle_board);

    // 2. Створюємо список всіх 81 клітинок (індекси від 0 до 80)
    std::vector<int> cell_indices(N * N);
    for (int i = 0; i < N * N; ++i) {
        cell_indices[i] = i;
    }

    // 3. Перемішуємо його, щоб видаляти клітинки у випадковому порядку
    unsigned seed = std::chrono::system_clock::now().time_since_epoch().count();
std::shuffle(cell_indices.begin(), cell_indices.end(), std::mt19937(seed));

    int cells_to_remove;
    if (difficulty == "easy") {
        cells_to_remove = 35; 
    } else if (difficulty == "medium") {
        cells_to_remove = 45;
    } else { 
        cells_to_remove = 50; 
    }
    
    int cells_removed = 0;

    for (int index : cell_indices) {
        if (cells_removed >= cells_to_remove) {
            break; 
        }

        int row = index / N;
        int col = index % N;

        int original_value = puzzle_board[row][col];
        puzzle_board[row][col] = 0;

        Board temp_board = puzzle_board;
        int solutions = count_solutions(temp_board);

        if (solutions > 1) {
            puzzle_board[row][col] = original_value;
        } else {
            cells_removed++;
        }
    }

    return puzzle_board;
}