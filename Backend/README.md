# SneakFit API

## Docker Setup

1. **Start the Services**

```bash
docker pull mcr.microsoft.com/mssql/server:2019-latest
docker run -e 'ACCEPT_EULA=Y' -e 'MSSQL_SA_PASSWORD=Password123$d' -p 1433:1433 -d --name sqlserver mcr.microsoft.com/mssql/server:2019-latest
```

Run docker container (if exists)

```bash
docker start sqlserver
```

Check running containers

```bash
docker ps
```

2. **Stoping Services**

```bash
docker stop sqlserver
```

### Creating new db migration

- Ensure Entity Framework tools are installed `dotnet tool install --global dotnet-ef`
- Update Entity Framework tools `dotnet tool update --global dotnet-ef`
- In project root catalog run command `dotnet ef migrations add [MIGRATION_NAME] -s API -p Domain  --context SneakFitDbContext`
