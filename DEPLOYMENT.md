# Deployment Guide

Follow these steps to deploy your Legal Document Engine to production.

## 1. Push Code to GitHub
Open your terminal in the root directory (`d:/MYDOCWRITER`) and run:
```bash
git init
git add .
git commit -m "Initialize legal document engine platform"
# Create a new repository on GitHub.com and copy the remote URL
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

## 2. Deploy Frontend (Vercel)
1. Go to [Vercel](https://vercel.com) and click "Add New" > "Project".
2. Import your GitHub repository.
3. In the **Build and Output Settings**, set "Root Directory" to `frontend`.
4. In **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL + `/api/` (e.g., `https://your-app.onrender.com/api/`)
5. Click **Deploy**.

## 3. Deploy Backend (Render)
1. Go to [Render](https://render.com) and click "New" > "Web Service".
2. Select your GitHub repository.
3. Set "Root Directory" to `backend`.
4. Set **Build Command**: `pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --no-input`
5. Set **Start Command**: `gunicorn legal_engine.wsgi:application`
6. In **Environment Variables**, add:
   - `DJANGO_SECRET_KEY`: (Something long and random)
   - `DJANGO_DEBUG`: `False`
   - `ALLOWED_HOSTS`: `your-app.onrender.com,your-vercel-domain.vercel.app`
   - `DATABASE_URL`: (Render will automatically provide this if you create a PostgreSQL DB)
7. Click **Create Web Service**.

---

**Note**: Since we are using SQLite in the repository for now, data won't persist across restarts on Render unless you connect a PostgreSQL database. Render provides a free PostgreSQL tier.
