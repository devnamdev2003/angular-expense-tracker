### 🛠️ Initializing Migrations

Once installed, follow these one-time steps:

#### 1. **Initialize migration directory**
```bash
flask db init
```

#### 2. **Generate migration file (auto-detect changes)**
```bash
flask db migrate -m "Initial migration or model changes"
```

#### 3. **Apply the migration**
```bash
flask db upgrade
```

