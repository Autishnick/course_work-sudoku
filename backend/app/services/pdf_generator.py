from fpdf import FPDF
import datetime

class PDF(FPDF):
    def header(self):
        self.set_font('Helvetica', 'B', 15)
        self.cell(0, 10, 'Sudoku Game Report', 0, 1, 'C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def create_pdf_report(game_list: list):
    pdf = PDF()
    pdf.add_page()
    pdf.set_font('Helvetica', '', 10)
    
    # Заголовки таблиці
    pdf.set_font('Helvetica', 'B', 10)
    pdf.cell(15, 10, 'ID', 1, 0, 'C')
    pdf.cell(70, 10, 'Name', 1, 0, 'C')
    pdf.cell(45, 10, 'Start Time (UTC)', 1, 0, 'C')
    pdf.cell(30, 10, 'Duration', 1, 1, 'C')
    
    # Дані
    pdf.set_font('Helvetica', '', 9)
    for game in game_list: # game - це словник
        
        # ❗️ ОСЬ ВИПРАВЛЕННЯ: Використовуємо game["key"] замість game.key
        game_id = str(game["id"])
        game_name = game["name"] if game["name"] else "(Unnamed)"
        start_time = game["start_time"]
        end_time = game["end_time"]

        duration = "N/A"
        if end_time and start_time:
            # Об'єкти datetime все ще працюють
            duration_delta = end_time - start_time
            duration = str(datetime.timedelta(seconds=int(duration_delta.total_seconds())))
        
        pdf.cell(15, 10, game_id, 1, 0, 'C')
        pdf.cell(70, 10, game_name, 1, 0, 'L')
        pdf.cell(45, 10, start_time.strftime('%Y-%m-%d %H:%M'), 1, 0, 'C')
        pdf.cell(30, 10, duration, 1, 1, 'C')
        
    # Повертаємо PDF як бінарні дані
    return bytes(pdf.output())