# Sett til riktig sti
Set-Location -Path "Banebooking.Api"

# Fjern gamle migrasjoner
$folder = "Migrations"
if (Test-Path $folder) {
    Remove-Item $folder -Recurse -Force
    Write-Host "Fjernet Migrations-mappen"
}

# Dropp hele databasen (krever bekreftelse)
dotnet ef database drop --force --no-build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Klarte ikke droppe databasen. Kjøres API/DbContext riktig?"
    exit 1
}

# Lag ny migrasjon
dotnet ef migrations add Init
Write-Host "Ny migrasjon 'Init' laget"

# Opprett databasen på nytt og kjør migrasjoner
dotnet ef database update
Write-Host "Databasen er opprettet og oppdatert"
