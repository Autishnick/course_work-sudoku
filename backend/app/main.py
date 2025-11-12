#
# backend/app/main.py
#
import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# --- Налаштування шляху для C++ ---
# Це дозволяє 'import sudoku_solver' працювати з будь-якого файлу
cpp_module_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'cpp_module'))
sys.path.append(cpp_module_path)

# --- Імпорти нашого проекту ---
# Ці рядки вимагають, щоб app/main.py, app/api/ та app/services/ існували
from .api import game_routes
from .services import database

# Створюємо таблиці в базі даних при першому запуску
database.Base.metadata.create_all(bind=database.engine)

# Створюємо додаток FastAPI
app = FastAPI()

# --- Налаштування CORS ---
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Підключення маршрутів ---
app.include_router(game_routes.router, prefix="/api")

@app.get("/")
def read_root():
    """
    Корінь API. Перейдіть на /docs для перегляду всіх endpoints.
    """
    return {"message": "Sudoku API is running. Go to /docs for API info."}