#pragma once
#include <vector>

#define N 9
using Board = std::vector<std::vector<int>>;

bool is_valid_move(const Board& board, int row, int col, int num);
bool find_empty_cell(const Board& board, int& row, int& col);