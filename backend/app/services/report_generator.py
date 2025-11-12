import datetime

def format_report_as_html(game_list: list):
    """
    Форматує список ігор у HTML-таблицю.
    (Працює зі словниками)
    """
    html = """
    <html>
    <head>
        <title>Sudoku Reports</title>
        <style>
            /* ... (ваші стилі) ... */
        </style>
    </head>
    <body>
        <h1>Completed Games Report</h1>
        <table border='1'>
            <tr>
                <th>Game ID</th>
                <th>Name</th>
                <th>Start Time (UTC)</th>
                <th>End Time (UTC)</th>
                <th>Duration</th>
            </tr>
    """
    
    for game in game_list: # game - це словник
        game_id = game["id"]
        game_name = game["name"] if game["name"] else "(Unnamed)"
        start_time = game["start_time"]
        end_time = game["end_time"]

        duration = "N/A"
        if end_time and start_time:
            duration_delta = end_time - start_time
            duration = str(datetime.timedelta(seconds=int(duration_delta.total_seconds())))

        html += f"""
            <tr>
                <td>{game_id}</td>
                <td>{game_name}</td>
                <td>{start_time.strftime('%Y-%m-%d %H:%M:%S')}</td>
                <td>{end_time.strftime('%Y-%m-%d %H:%M:%S')}</td>
                <td>{duration}</td>
            </tr>
        """
    
    html += "</table></body></html>"
    return html