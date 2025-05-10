# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
LABEL fly_launch_runtime="dotnet"

# Installer Node.js (v20)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get update && \
    apt-get install -y nodejs

WORKDIR /app

# Copy csproj and restore
COPY Banebooking.Api/*.csproj ./Banebooking.Api/
RUN dotnet restore ./Banebooking.Api/Banebooking.Api.csproj

# Copy entire repo
COPY . .

# Build React (Vite)
WORKDIR /app/Banebooking.Api/ClientApp
RUN npm install && npm run build

# Copy frontend into wwwroot
WORKDIR /app/Banebooking.Api
RUN rm -rf wwwroot && mkdir wwwroot && cp -r ClientApp/dist/* wwwroot/

# Publish backend
RUN dotnet publish "Banebooking.Api.csproj" -c Release -o /out --no-restore

# Stage 2: Run
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /out .

ENTRYPOINT ["dotnet", "Banebooking.Api.dll"]
