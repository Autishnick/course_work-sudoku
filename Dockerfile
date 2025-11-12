#
# Dockerfile (v4 - Виправлено порядок копіювання)
#

# 1. Базовий образ: Linux + Python 3.14
FROM python:3.14-slim

# 2. Встановлюємо C++ компілятор та CMake/dev-заголовки
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    python3-dev \
    pybind11-dev \
    && rm -rf /var/lib/apt/lists/*

# 3. Встановлюємо Python-залежності
WORKDIR /app
COPY backend/requirements.txt .
RUN python3 -m pip install -r requirements.txt

# 4. ❗️ (НОВИЙ ПОРЯДОК) Копіюємо Python-код СПОЧАТКУ
COPY backend /app/backend

# 5. Копіюємо вихідний C++ код
COPY cpp_core /app/cpp_core

# 6. Компілюємо C++ модуль
# (Створюємо папку build, оскільки .dockerignore її не пропустив)
RUN mkdir -p /app/cpp_core/build
WORKDIR /app/cpp_core/build
RUN cmake ..
RUN cmake --build .

# 7. ❗️ (НОВИЙ ПОРЯДОК) Копіюємо скомпільований .so файл
# у *вже існуючу* папку backend/cpp_module
# Ми використовуємо 'find', щоб знайти .so файл, як би він не називався
RUN find . -type f -name "*.so" -exec cp {} /app/backend/cpp_module/ \;

# 8. Запускаємо сервер
WORKDIR /app/backend
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT