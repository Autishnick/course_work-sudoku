import sudoku_solver  # type: ignore

print("--- C++ Module Import Successful! ---")
print("-" * 30)

test_board = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
]

print("Original board:")
for row in test_board:
    print(row)

print("\nCalling C++ solve_puzzle()...")

# -----------------
# ❗️ ОСЬ ГОЛОВНА ЗМІНА ❗️
# Ми присвоюємо результат новій змінній
solved_board = sudoku_solver.solve_puzzle(test_board)
# -----------------

if solved_board:
    print("\nSolved board (returned from C++):")
    for row in solved_board:
        print(row)
else:
    print("\nSolver returned None (no solution found).")

print("\nOriginal board (should be unchanged):")
for row in test_board:
    print(row)
print("-" * 30)
print("Calling C++ generate_puzzle('easy')...")

easy_puzzle = sudoku_solver.generate_puzzle("easy")

if easy_puzzle:
    print("\nGenerated 'easy' puzzle:")
    for row in easy_puzzle:
        print(row)
else:
    print("\nGenerator returned None.")
print("--- Test Complete ---")