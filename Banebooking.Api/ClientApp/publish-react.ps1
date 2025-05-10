# Bygg frontend og kopier ferdigbygget app til wwwroot

Write-Host "Bygger React-app med Vite..."
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error "Bygging feilet. Stopper scriptet."
    exit 1
}

Write-Host "Kopierer dist/ til ../wwwroot ..."
xcopy dist ..\wwwroot /E /Y

Write-Host "Ferdig! Husk å committe endringene i wwwroot/"
