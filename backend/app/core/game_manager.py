try:
    import sudoku_solver
except ImportError:
    print("=" * 50)
    print("FATAL ERROR: C++ 'sudoku_solver' module not found.")
    print("Please make sure the '.so' or '.pyd' file is in 'backend/cpp_module/'")
    print("=" * 50)
    sudoku_solver = None

def get_solver_status():
    """
    Перевіряє, чи C++ модуль був завантажений.
    """
    return sudoku_solver is not None

def generate_new_puzzle(difficulty: str):
    """
    Викликає C++ для генерації нового поля.
    """
    if not sudoku_solver:
        return None
    return sudoku_solver.generate_puzzle(difficulty)

def solve_puzzle(board):
    """
    Викликає C++ для вирішення поля.
    """
    if not sudoku_solver:
        return None
    return sudoku_solver.solve_puzzle(board)

def count_puzzle_solutions(board):
    """
    Викликає C++ для підрахунку рішень.
    """
    if not sudoku_solver:
        return 0
    return sudoku_solver.count_solutions(board)