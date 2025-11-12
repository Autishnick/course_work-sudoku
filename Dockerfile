#
# Dockerfile
#

# 1. Базовий образ: Linux + Python 3.14
FROM python:3.14-slim

# 2. Встановлюємо C++ компілятор та CMake
# 'build-essential' містить 'g++' (компілятор C++)
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    && rm -rf /var/lib/apt/lists/*

# 3. Встановлюємо Python-залежності (включаючи pybind11)
WORKDIR /app
COPY backend/requirements.txt .
RUN python3 -m pip install -r requirements.txt

# 4. Копіюємо вихідний C++ код
COPY cpp_core /app/cpp_core

# 5. ❗️ Компілюємо C++ модуль
WORKDIR /app/cpp_core/build
RUN cmake ..
RUN cmake --build .

# 6. Копіюємо скомпільований .so файл у Python-модуль
# (Ми використовуємо 'find', щоб знайти .so файл, як би він не називався)
RUN find . -type f -name "*.so" -exec cp {} /app/backend/cpp_module/ \;

# 7. Копіюємо решту Python-коду
WORKDIR /app
COPY backend /app/backend

# 8. Запускаємо сервер
WORKDIR /app/backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "$PORT"]