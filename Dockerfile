#
# Dockerfile (v6 - Використання прямого 'cp' замість 'find')
#

# 1. Базовий образ
FROM python:3.14-slim

# 2. Встановлюємо C++ та інструменти
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

# 4. Копіюємо Python-код
COPY backend /app/backend

# 5. Копіюємо C++ код
COPY cpp_core /app/cpp_core

# 6. Компілюємо C++
RUN mkdir -p /app/cpp_core/build
WORKDIR /app/cpp_core/build
RUN cmake ..
RUN cmake --build .

# 7. Створюємо папку-призначення
RUN mkdir -p /app/backend/cpp_module

# 8. ❗️ (НОВИЙ, НАДІЙНИЙ КРОК КОПІЮВАННЯ)
# Ми точно знаємо, що .so файл знаходиться в /app/cpp_core/build/
# Використовуємо 'glob' (*.so), щоб скопіювати його
RUN cp /app/cpp_core/build/*.so /app/backend/cpp_module/

# 9. ❗️ (НОВИЙ КРОК ДЛЯ ДІАГНОСТИКИ)
# Ми просимо Docker показати нам вміст папки ПІСЛЯ копіювання.
# Це буде видно у вашому "Build Log" на Render.
RUN echo "--- Final contents of cpp_module directory: ---"
RUN ls -l /app/backend/cpp_module/
RUN echo "------------------------------------------------"

# 10. Запускаємо сервер
WORKDIR /app/backend
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT