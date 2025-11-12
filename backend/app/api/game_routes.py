from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from fastapi.responses import HTMLResponse

from ..core import game_manager
from ..services import database, report_generator, pdf_generator

router = APIRouter()

# --- Pydantic Моделі (для валідації JSON) ---
Board = List[List[int]]

class GenerateRequest(BaseModel):
    difficulty: str

class SolveRequest(BaseModel):
    board: Board

class SaveGameRequest(BaseModel):
    game_id: int
    current_board: Board
    name: str

class FinishGameRequest(BaseModel):
    game_id: int
    final_board: Board

class CustomGameRequest(BaseModel):
    board: Board
# --- Залежність (Dependency) ---
# Автоматично створює сесію БД для кожного запиту
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- API Endpoints ---

@router.get("/status")
def get_status():
    """
    Перевіряє, чи завантажений C++ модуль.
    """
    status = game_manager.get_solver_status()
    if not status:
        raise HTTPException(status_code=500, detail="C++ 'sudoku_solver' module not loaded")
    return {"cpp_module_loaded": True}

@router.post("/generate")

@router.post("/generate")
def generate_game(request: GenerateRequest, db: Session = Depends(get_db)):
    """
    Генерує нову гру, зберігає її, ВИРІШУЄ і повертає
    і головоломку, і повне рішення.
    """
    
    puzzle = game_manager.generate_new_puzzle(request.difficulty)
    if puzzle is None:
        raise HTTPException(status_code=500, detail="Failed to generate puzzle. C++ module error.")
    
    solution = game_manager.solve_puzzle(puzzle)
    if solution is None:
        raise HTTPException(status_code=500, detail="Generated puzzle has no solution. C++ module error.")

    game_id = database.create_new_game(db, initial_board=puzzle)
    
    # 4. Повертаємо і головоломку, і рішення
    return {"game_id": game_id, "puzzle": puzzle, "solution": solution}

@router.post("/solve")
def solve_game(request: SolveRequest):
    """
    Вирішує передане поле Судоку.
    """
    solution = game_manager.solve_puzzle(request.board)
    if solution is None:
        raise HTTPException(status_code=500, detail="Failed to solve puzzle. C++ module error or no solution.")
    return {"solution": solution}

@router.post("/save")
def save_game(request: SaveGameRequest, db: Session = Depends(get_db)):
    """
    Зберігає поточний стан гри в БД.
    """
    success, message = database.save_game_state(
        db, request.game_id, request.current_board, request.name
    )
    if not success:
        raise HTTPException(status_code=404, detail=message)
    return {"message": "Game saved successfully"}

# @router.get("/load/{game_id}")
# def load_game(game_id: int, db: Session = Depends(get_db)):
#     """
#     Завантажує збережену гру з БД за її ID.
#     """
#     game_data = database.load_game_state(db, game_id)
#     if game_data is None:
#         raise HTTPException(status_code=404, detail="Game not found")
#     return game_data

@router.get("/load_by_name/{name}")
def load_game_by_name_endpoint(name: str, db: Session = Depends(get_db)):
    """
    Завантажує збережену гру з БД за її унікальною назвою.
    (Ця версія ПРАВИЛЬНО обробляє помилки).
    """
    
    game_data = database.load_game_by_name(db, name)
    
    if game_data is None:
        raise HTTPException(status_code=404, detail="Game not found with that name")
    
    initial_board = game_data["initial_board"]
    
    solution = game_manager.solve_puzzle(initial_board)
    if solution is None:
        raise HTTPException(status_code=500, detail="Could not solve the initial board to get solution.")

    game_data["solution"] = solution
    
    return game_data

@router.post("/finish")
def finish_game_endpoint(request: FinishGameRequest, db: Session = Depends(get_db)):
    """
    Позначає гру як завершену для звітності.
    """
    success = database.finish_game(db, request.game_id, request.final_board)
    if not success:
        raise HTTPException(status_code=404, detail="Game not found or already completed")
    return {"message": "Game completed and logged for reporting."}


@router.get("/saves")
def get_all_saves(db: Session = Depends(get_db)):
    """
    Повертає список об'єктів збережених ігор (назва, дата, статус).
    """
    games_info = database.get_all_saves_info(db)
    return {"saves": games_info}

@router.delete("/delete/{name}")
def delete_game_endpoint(name: str, db: Session = Depends(get_db)):
    """
    Видаляє гру за назвою.
    """
    success = database.delete_game_by_name(db, name)
    if not success:
        raise HTTPException(status_code=404, detail="Game not found with that name")
    return {"message": "Game deleted successfully"}


@router.get("/report/html", response_class=HTMLResponse)
def get_html_report(db: Session = Depends(get_db)):
    """
    Генерує і повертає звіт у форматі HTML.
    (Виправлено: тепер правильна логіка)
    """
    games_list = database.get_all_reports(db)
    
    html_content = report_generator.format_report_as_html(games_list)
    
    # 3. Повертає HTML
    return html_content

@router.get("/report/pdf")
def get_pdf_report(db: Session = Depends(get_db)):
    """
    Генерує і повертає звіт у форматі PDF.
    """
    games = database.get_all_reports(db)
    pdf_data_bytearray = pdf_generator.create_pdf_report(games) # Це 'bytearray'
    
    return Response(
        # ❗️ ОСЬ ВИПРАВЛЕННЯ:
        # Ми примусово перетворюємо 'bytearray' на 'bytes'
        content=bytes(pdf_data_bytearray), 
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=sudoku_report.pdf"}
    )

@router.post("/start_custom_game")
def start_custom_game(request: CustomGameRequest, db: Session = Depends(get_db)):
    """
    Приймає дошку від користувача, перевіряє її та створює нову гру.
    """
    board = request.board
    
    solution = game_manager.solve_puzzle(board)
    if solution is None:
        raise HTTPException(status_code=400, detail="This puzzle is unsolvable.")
        
    solution_count = game_manager.count_puzzle_solutions(list(board))
    if solution_count > 1:
        raise HTTPException(status_code=400, detail="This puzzle has multiple solutions. Please provide more clues.")
        
    game_id = database.create_new_game(db, initial_board=board)
    
    return {"game_id": game_id, "puzzle": board, "solution": solution}