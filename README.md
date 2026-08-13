# ShopNest — Full-Stack E-Commerce Platform

ShopNest is a production-ready, premium e-commerce platform engineered with a **React + Redux Toolkit** client application and a modular **Django REST Framework** service layer.

---

## Technical Architecture

* **Frontend**: React (Vite), Redux Toolkit (State Management), React Router, Tailwind CSS v4 (Aesthetics & Layouts), Lucide Icons, React Hook Form.
* **Backend**: Django 5.x, Django REST Framework, SimpleJWT (JWT Authentication), django-filter, Pillow (Media processing), Stripe SDK.
* **Database**: PostgreSQL (Production-ready) with dynamic automatic fallback to SQLite (Development-ready).
* **API Documentation**: Interactive Swagger/OpenAPI UI.

---

## Quick Start (Local Development)

### 1. Prerequisite Checks
* Python 3.10+
* Node.js 18+

### 2. Backend Setup
1. Clone the repository and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your `.env` environment variables using `.env.example`.
5. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
6. (Optional) Seed database with high-quality mock products, categories, reviews, and order histories:
   ```bash
   python manage.py seed_data
   ```
7. Start the API server:
   ```bash
   python manage.py runserver
   ```

The backend API will be available at [http://127.0.0.1:8000/](http://127.0.0.1:8000/).
* Interactive API Documentation (Swagger): [http://127.0.0.1:8000/api/docs/](http://127.0.0.1:8000/api/docs/)
* Django Administration Console: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

---

### 3. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Boot the Vite development server:
   ```bash
   npm run dev
   ```

The frontend client will be available at [http://localhost:5173/](http://localhost:5173/).

---

## Unit Testing
To run the automated API testing suite:
```bash
cd backend
python manage.py test users
```

## Demo Credentials
* **Customer User**: `customer@shopnest.com` / `CustomerPassword123`
* **Admin Superuser**: `admin@shopnest.com` / `AdminPassword123`
