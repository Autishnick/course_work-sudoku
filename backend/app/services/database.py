from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, UniqueConstraint
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import datetime
import json

# Створюємо файл sudoku_games.db в корені папки backend
DATABASE_URL = "sqlite:///./sudoku_games.db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Модель (Таблиця) ---

class Game(Base):
    __tablename__ = "games"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=True)
    start_time = Column(DateTime, default=datetime.datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    
    # Ми зберігаємо дошки як JSON-рядок
    initial_board = Column(Text) 
    current_board = Column(Text)
    status = Column(String, default="in_progress") # 'in_progress' або 'completed'

# --- Функції для роботи з БД ---

def get_db():
    """
    Залежність (Dependency) для FastAPI: створює сесію БД.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_new_game(db: SessionLocal, initial_board: list):
    """
    Створює новий запис гри в БД.
    """
    game = Game(
        initial_board=json.dumps(initial_board),
        current_board=json.dumps(initial_board)
    )
    db.add(game)
    db.commit()
    db.refresh(game)
    return game.id

def save_game_state(db: SessionLocal, game_id: int, current_board: list, name:str):
    game = db.query(Game).filter(Game.id == game_id).first()
    existing_game_with_name = db.query(Game).filter(Game.name == name, Game.id != game_id).first()
    if existing_game_with_name:
        # Ця назва вже використовується
        return False, "Name already taken" 

    game = db.query(Game).filter(Game.id == game_id).first()
    if game and game.status == "in_progress":
        game.name = name
        game.current_board = json.dumps(current_board)
        db.commit()
        return True, "Game saved"
    return False, "Game not found or already completed"

def load_game_by_name(db: SessionLocal, name: str):
    """
    Завантажує гру за її унікальною назвою.
    """
    game = db.query(Game).filter(Game.name == name).first()
    if game:
        return {
            "id": game.id,
            "initial_board": json.loads(game.initial_board),
            "current_board": json.loads(game.current_board),
            "status": game.status
        }
    return None

def load_game_state(db: SessionLocal, game_id: int):
    """
    Завантажує гру за її ID.
    """
    game = db.query(Game).filter(Game.id == game_id).first()
    if game:
        return {
            "id": game.id,
            "initial_board": json.loads(game.initial_board),
            "current_board": json.loads(game.current_board),
            "status": game.status
        }
    return None

def finish_game(db: SessionLocal, game_id: int, final_board: list):
    """
    Позначає гру як завершену і записує час.
    """
    game = db.query(Game).filter(Game.id == game_id).first()
    if game and game.status == "in_progress":
        game.current_board = json.dumps(final_board)
        game.status = "completed"
        game.end_time = datetime.datetime.utcnow()
        db.commit()
        return True
    return False

def get_all_saves_info(db: SessionLocal):
    """
    Повертає список об'єктів збережених ігор (назва, дата, статус).
    """
    
    games_query_result = (
        db.query(Game.name, Game.start_time, Game.status)
        .filter(Game.name != None)
        .order_by(Game.start_time.desc())
        .all()
    )
    
    games_list = []
    for game in games_query_result:
        games_list.append({
            "name": game.name,
            "start_time": game.start_time.isoformat(),
            "status": game.status 
        })
        
    # 3. Повертаємо чистий список словників
    return games_list

def delete_game_by_name(db: SessionLocal, name: str):
    """
    Знаходить і видаляє гру за її унікальною назвою.
    """
    game = db.query(Game).filter(Game.name == name).first()
    if game:
        db.delete(game)
        db.commit()
        return True
    return False

def get_all_reports(db: SessionLocal):
    """
    Отримує всі завершені ігри для звіту.
    (Виправлено: Повертає чистий список, а не об'єкти SQLAlchemy)
    """
    games = db.query(Game).filter(Game.status == "completed").order_by(Game.end_time.desc()).all()
    
    # ❗️ ОСЬ ВИПРАВЛЕННЯ:
    # Ми вручну перетворюємо повні об'єкти Game на прості словники
    report_list = []
    for game in games:
        report_list.append({
            "id": game.id,
            "name": game.name,
            "start_time": game.start_time,
            "end_time": game.end_time,
            "status": game.status
            # Ми можемо залишити datetime тут, тому що FPDF (PDF)
            # та наш HTML-генератор оброблять їх.
        })
    return report_list