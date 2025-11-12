#include "board.h"

bool is_valid_move(const Board& board, int row, int col, int num) {
    for (int x = 0; x < N; x++) {
        if (board[row][x] == num) {
            return false;
        }
    }

    for (int y = 0; y < N; y++) {
        if (board[y][col] == num) {
            return false;
        }
    }

    int start_row = row - row % 3;
    int start_col = col - col % 3;

    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            if (board[i + start_row][j + start_col] == num) {
                return false;
            }
        }
    }
    return true;
}

bool find_empty_cell(const Board& board, int& row, int& col) {
    for (row = 0; row < N; row++) {
        for (col = 0; col < N; col++) {
            if (board[row][col] == 0) {
                return true;
            }
        }
    }
    return false;
}