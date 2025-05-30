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

# Gjør VITE_ miljøvariabler tilgjengelig for Vite under build
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY


# Build React (Vite)
WORKDIR /app/Banebooking.Api/ClientApp
RUN npm install --legacy-peer-deps && npm run build

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
