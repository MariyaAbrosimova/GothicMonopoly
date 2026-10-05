using GothicMonopoly.Models;

namespace GothicMonopoly.Services
{
    public static class BoardFactory
    {
        // 40 клеток, идём против часовой от старта (правый нижний угол)
        public static List<Tile> Create() => new()
        {
            new() { Id=0,  Name="Врата",          Type=TileType.Start },
            new() { Id=1,  Name="Склеп I",        Type=TileType.Property, Price=60,  Rent=2,  Group="moss" },
            new() { Id=2,  Name="Судьба",         Type=TileType.Fate },
            new() { Id=3,  Name="Склеп II",       Type=TileType.Property, Price=60,  Rent=4,  Group="moss" },
            new() { Id=4,  Name="Налог Крови",    Type=TileType.Tax, Price=200 },
            new() { Id=5,  Name="Карета",         Type=TileType.Station,  Price=200, Rent=25 },
            new() { Id=6,  Name="Таверна I",      Type=TileType.Property, Price=100, Rent=6,  Group="crimson" },
            new() { Id=7,  Name="Ковен",          Type=TileType.Coven },
            new() { Id=8,  Name="Таверна II",     Type=TileType.Property, Price=100, Rent=6,  Group="crimson" },
            new() { Id=9,  Name="Таверна III",    Type=TileType.Property, Price=120, Rent=8,  Group="crimson" },
            new() { Id=10, Name="Тюрьма",         Type=TileType.Jail },
            new() { Id=11, Name="Библиотека I",   Type=TileType.Property, Price=140, Rent=10, Group="bone" },
            new() { Id=12, Name="Реликвия",       Type=TileType.Utility,  Price=150, Rent=10 },
            new() { Id=13, Name="Библиотека II",  Type=TileType.Property, Price=140, Rent=10, Group="bone" },
            new() { Id=14, Name="Библиотека III", Type=TileType.Property, Price=160, Rent=12, Group="bone" },
            new() { Id=15, Name="Карета",         Type=TileType.Station,  Price=200, Rent=25 },
            new() { Id=16, Name="Кузня I",        Type=TileType.Property, Price=180, Rent=14, Group="night" },
            new() { Id=17, Name="Ковен",          Type=TileType.Coven },
            new() { Id=18, Name="Кузня II",       Type=TileType.Property, Price=180, Rent=14, Group="night" },
            new() { Id=19, Name="Кузня III",      Type=TileType.Property, Price=200, Rent=16, Group="night" },
            new() { Id=20, Name="Погост",         Type=TileType.FreeParking },
            new() { Id=21, Name="Болото I",       Type=TileType.Property, Price=220, Rent=18, Group="marsh" },
            new() { Id=22, Name="Судьба",         Type=TileType.Fate },
            new() { Id=23, Name="Болото II",      Type=TileType.Property, Price=220, Rent=18, Group="marsh" },
            new() { Id=24, Name="Болото III",     Type=TileType.Property, Price=240, Rent=20, Group="marsh" },
            new() { Id=25, Name="Карета",         Type=TileType.Station,  Price=200, Rent=25 },
            new() { Id=26, Name="Крепость I",     Type=TileType.Property, Price=260, Rent=22, Group="steel" },
            new() { Id=27, Name="Крепость II",    Type=TileType.Property, Price=260, Rent=22, Group="steel" },
            new() { Id=28, Name="Реликвия",       Type=TileType.Utility,  Price=150, Rent=10 },
            new() { Id=29, Name="Крепость III",   Type=TileType.Property, Price=280, Rent=24, Group="steel" },
            new() { Id=30, Name="В подземелье!",  Type=TileType.GoToJail },
            new() { Id=31, Name="Собор I",        Type=TileType.Property, Price=300, Rent=26, Group="gold" },
            new() { Id=32, Name="Собор II",       Type=TileType.Property, Price=300, Rent=26, Group="gold" },
            new() { Id=33, Name="Ковен",          Type=TileType.Coven },
            new() { Id=34, Name="Собор III",      Type=TileType.Property, Price=320, Rent=28, Group="gold" },
            new() { Id=35, Name="Карета",         Type=TileType.Station,  Price=200, Rent=25 },
            new() { Id=36, Name="Судьба",         Type=TileType.Fate },
            new() { Id=37, Name="Трон I",         Type=TileType.Property, Price=350, Rent=35, Group="royal" },
            new() { Id=38, Name="Налог Крови",    Type=TileType.Tax, Price=100 },
            new() { Id=39, Name="Трон II",        Type=TileType.Property, Price=400, Rent=50, Group="royal" },
        };
    }
}