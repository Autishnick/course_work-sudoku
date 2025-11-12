#include "solver.h"
#include "board.h"

bool solve_puzzle_function(Board& board) {
    int row, col;

    if (!find_empty_cell(board, row, col)) {
        return true;
    }

    for (int num = 1; num <= 9; num++) {
        if (is_valid_move(board, row, col, num)) {
            
            board[row][col] = num;

            if (solve_puzzle_function(board)) {
                return true;
            }

            board[row][col] = 0;
        }
    }

    return false;
}
int count_solutions(Board& board) {
    int row, col;

    if (!find_empty_cell(board, row, col)) {
        return 1;
    }

    int total_solutions = 0;

    for (int num = 1; num <= 9; num++) {
        if (is_valid_move(board, row, col, num)) {
            
            board[row][col] = num;

            total_solutions += count_solutions(board);

            board[row][col] = 0;

            if (total_solutions > 1) {
                return 2; 
            }
        }
    }

    return total_solutions;
}