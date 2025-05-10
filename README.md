# 🏟️ Banebooking Voyager

Et moderne banebookingsystem for klubber og medlemmer, bygget med .NET 8 og React (Vite). Systemet støtter booking av baner, klubbadministrasjon, massebooking, fraværsregistrering og mer.

---

## 🧱 Teknologi

* **Backend**: ASP.NET Core Web API (.NET 8)
* **Frontend**: React 18 + Vite
* **Database**: PostgreSQL (hostet via Supabase)
* **Deploy**: Fly.io (CI/CD via Azure DevOps)

---

## 📂 Prosjektstruktur

```
banebooking-voyager/
├── Banebooking.sln
├── Banebooking.Api/
│   ├── Controllers/
│   ├── Models/
│   ├── Data/
│   ├── wwwroot/          # Ferdigbygget frontend legges her
│   ├── ClientApp/        # React + Vite frontend
│   └── Program.cs
```

---

## 🚀 Komme i gang

### 1. Klon repo og gå til mappen

```bash
git clone https://github.com/<brukernavn>/banebooking-voyager.git
cd banebooking-voyager
```

### 2. Kjør API (.NET Core)

```bash
cd Banebooking.Api
dotnet restore
dotnet run
```

Server kjører på `http://localhost:5000` (eller `https://localhost:5001`)

### 3. Kjør frontend (React + Vite)

```bash
cd Banebooking.Api/ClientApp
npm install
npm run dev
```

Vite kjører på `http://localhost:5173`

---

## 🛠️ Bygge frontend for produksjon

For å bygge og legge React-app inn i `wwwroot/`:

```bash
cd Banebooking.Api/ClientApp
npm run build
xcopy dist ..\wwwroot /E /Y
```

> Du kan også bruke et `publish-react.ps1`-skript hvis ønskelig.

---

## 🔒 Miljøvariabler

Legg til følgende i `appsettings.Development.json` eller som miljøvariabler:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=...;Database=...;Username=...;Password=..."
  }
}
```

---

## 📌 TODO

* [x] Oppsett av Fly.io-deploy via pipeline
* [ ] Opprette database og kjøre første migrasjon
* [ ] API-endepunkter for booking
* [ ] Autentisering via login provider
* [ ] Varsling ved ikke oppmøte

---

## 👤 Utvikler

Andreas Lotarev
