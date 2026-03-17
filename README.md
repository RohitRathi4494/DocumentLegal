# Legal Document Engine v2.0

A highly scalable Next.js and Django application that dynamically generates legal documents from JSON form schemas and Word templates using `docxtpl`.

## Features
- **Universal Templates**: Upload `.docx` templates and matching JSON schemas.
- **Dynamic Forms**: Frontend auto-renders inputs, TextAreas, selects, and Reusable/Repeatable groups (e.g. Tenants).
- **Document Engine**: Parses `docxtpl` `{% tr for ... %}`, conditionals, and placeholders.
- **Client DB**: Auto-fills repeating client data saving time for lawyers.
- **Smart Utils**: Auto-computes Numbers to Words and Lease Expiration Dates.

## Running Locally

### Option 1: Using Docker-Compose (Postgres Setup)
1. Run `docker-compose up -d`
*(Note: If you run with docker, configure the `.env` or `settings.py` to use `DB_ENGINE='django.db.backends.postgresql'` as outlined in `settings.py` fallback logic)*

### Option 2: Pure Local Setup (SQLite fallback)

**Backend Setup**
```bash
cd backend
python -m venv venv
# Activate venv:
# Windows: .\venv\Scripts\activate    (or .\venv\bin\activate if MSYS)
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
# (For the python environment, make sure to install dependencies like django djangorestframework psycopg2-binary docxtpl num2words corsheaders)

python manage.py migrate
python manage.py createsuperuser  # Follow prompts to create an admin
python manage.py runserver
```

**Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

### 3. Usage & Admin
1. Open the Django Admin at `http://localhost:8000/admin`.
2. Go to **Document Types** -> Add.
3. Upload `example_rent_agreement.docx` (Generated from `python generate_example.py`).
4. Paste the JSON from `example_schema.json` into the schema field.
5. Open the Frontend at `http://localhost:3000`.
6. Create an account, go to Dashboard, select your new Template, and generate!
