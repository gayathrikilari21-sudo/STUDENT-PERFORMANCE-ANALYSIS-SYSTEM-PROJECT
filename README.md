# Student Performance Analysis System

Web application built with **Python (Flask)**, **HTML/CSS/JavaScript (Chart.js)** and a
**database (SQLite or MySQL)**.
Mohan Babu University - Dept. of CSE & AIML - Team 7 (Section A7)

## Highlights
* Modern dashboard design with **dark / light mode**, animated counters and mobile-friendly menu.
* **Charts drawn by the project itself (SVG)**, so they work even without internet.
* Class **heatmap**, **top-3 podium**, attendance-vs-marks scatter plot, grade distribution.
* Student page: score rings, **you vs class average** radar chart, rule-based **smart insights**
  (strongest/weakest subject, marks needed for the next grade, classes you can still miss).
* **Live preview** of total and grade while typing marks; **bulk CSV upload** of marks.
* Search and sort in tables, printable **report card**, change-password page.
* Security: hashed passwords, role-based access, CSRF protection, input validation.

## What it does
* Admin: add / delete students, subjects and faculty users.
* Faculty: enter marks and attendance, see class dashboard, results, rank list, alerts, download CSV.
* Student: see own marks, grade, result, rank, attendance, charts and a printable report card.
* Total, percentage, grade, pass/fail, rank and attendance % are **calculated automatically**.
* Extension: students with marks < 40 %, a failed subject, or attendance < 75 % are highlighted
  as alerts (optional e-mail sending).

## Demo logins (created automatically on first run)
| Role    | Username     | Password     |
|---------|--------------|--------------|
| Admin   | admin        | admin123     |
| Faculty | faculty1     | faculty123   |
| Student | 25102A0430   | student123   |

(All 5 team roll numbers work as student usernames with password `student123`.)

## Run in VS Code (Windows)
1. Install **Python 3.10+** (tick "Add Python to PATH") and open this folder in VS Code
   (File > Open Folder).
2. Open the terminal in VS Code (Ctrl + `) and run:
   ```
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   python app.py
   ```
   (Mac/Linux: `source venv/bin/activate` instead of `venv\Scripts\activate`.)
3. Open **http://127.0.0.1:5000** in your browser and log in.

The default database is **SQLite**, so nothing else needs to be installed.
Everything works offline except the optional Google Fonts (the site falls back to system fonts).

## Use MySQL instead (optional)
1. Install MySQL and make sure it is running.
2. Open `config.py` and set:
   ```python
   DB_TYPE = "mysql"
   MYSQL_USER = "root"
   MYSQL_PASSWORD = "your real password"
   ```
3. Run `python app.py`. The database `student_performance`, its tables and the demo data
   are created automatically. To start again from zero, drop the database in MySQL and run again.

`database/student_performance_db.sql` is a reference script with the table design, views and
the SQL queries - use it for practice or to explain the design. It uses its own database
name (`student_performance_demo`) so it never disturbs the app's data.

## Project structure
```
app.py            routes (login, dashboards, marks, attendance, admin pages)
config.py         database choice, pass mark, attendance limit, e-mail settings
db.py             database layer (SQLite + MySQL), tables and demo data
analytics.py      all calculations: total, %, grade, rank, attendance, alerts
mailer.py         optional e-mail alerts
templates/        HTML pages (Jinja2)
static/css/       stylesheet
static/js/        app.js (theme, sorting, live preview) and charts.js (SVG charts)
database/         reference MySQL script
```

## Grade scale (config / analytics.py)
90+ O, 80+ A+, 70+ A, 60+ B, 50+ C, 40+ D, below 40 F.
Pass = at least 40 % in every subject.  Change `MIN_PERCENTAGE` / `MIN_ATTENDANCE` in `config.py`.

## E-mail alerts (optional)
Set `SMTP_ENABLED = True` and your SMTP details in `config.py`, save a student's e-mail in
the Students page, then press **Send alert e-mails** on the Alerts page.
For Gmail use an App Password.

## Common problems
* `python` not found: reinstall Python with "Add to PATH", or try `py app.py`.
* `ModuleNotFoundError`: the virtual environment is not active - run the activate line again, then `pip install -r requirements.txt`.
* MySQL error on start: check MySQL is running and the password in `config.py`; or set `DB_TYPE = "sqlite"`.
* Port 5000 busy: change `app.run(debug=True)` to `app.run(debug=True, port=5001)`.
* Before real use: change `SECRET_KEY` and the demo passwords.

## Deploy online (GitHub + Render, free)
GitHub only stores the code (GitHub Pages cannot run Flask). To get a live link:
1. Create a public repository on github.com and upload all files of this folder
   (app.py, config.py, requirements.txt, render.yaml, templates/, static/ ...).
   Do NOT upload `venv/` or `student_performance.db`.
2. On render.com sign in with GitHub > New + > Web Service > choose the repository.
   Build command: `pip install -r requirements.txt`   Start command: `gunicorn app:app`   Plan: Free.
3. After 3-5 minutes you get a link like https://student-performance-analysis.onrender.com
Notes: the free plan sleeps when unused (first open can take ~1 minute) and the SQLite data
resets when it restarts - the demo data is created again automatically.
After deploying, log in as admin and change the demo passwords.
