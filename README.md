# BotaniMart-catalogue
Tugas Rekayasa Perangkat Lunak

## Panduan Kolaborasi Github
Tutorial workflow github yg menurut gw paling baik : [video](https://www.youtube.com/watch?v=4zkaFCLoQV0)

## Panduan Development
Install package yg dibutuhkan
```
npm install
```

Mulai server
```
npm run dev
```

## STRUKTUR FOLDER
```
project-root/
├── db/                       # Database-related files
│   ├── example.db            # SQLite database file (stores actual data)
│   ├── migrations/           # SQL migration scripts (for database schema changes)
│   ├── seeds/                # Data seeding scripts (for database with initial data)
│   └── db.js                 # Establishes connection with SQLite
│
├── server/                   # Server-side code (handles API, routing, business logic)
│
├── public/                   # Public-facing assets (static files accessible by the client)
│   └── index.html            # HTML file served to users (usually the homepage)
│
├── .gitignore                # Specifies files and folders to ignore in version control (Git)
├── package.json              # Node.js dependencies and project metadata
└── README.md                 # Documentation about the project
```

## Generate New Database
Saat file ``db/central.db`` hilang atau terjadi sesuatu, maka harus generate file baru.

### Panduannya
1. Jalankan script terbaru pada folder ``db/migrations``, Jalankan file js terbaru sesuai dengan tanggal pada nama file.
    ```
    node db/migrations/2025...........js
    ```
2. Lalu isi database tersebut dengan data, gunakan script js pada folder ``db/migrations``
3. Konfirmasi jika harus menjalankan prosedur ini.