namespace GothicMonopoly.Models
{
    public enum TileType { Start, Property, Fate, Coven, Jail, FreeParking, GoToJail, Tax, Station, Utility }
    public enum TokenType { Skull, Raven, Bat, Candle }

    public class Tile
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public TileType Type { get; set; }
        public int Price { get; set; }
        public int Rent { get; set; }           // базовая аренда
        public string? Group { get; set; }      // "crimson", "bone", "night", "moss"...
        public int? OwnerId { get; set; }
        public int Houses { get; set; }         // 0..4 дома, 5 = собор
    }

    public class Player
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public TokenType Token { get; set; }
        public int Money { get; set; } = 1500;
        public int Position { get; set; }
        public bool InJail { get; set; }
        public int JailTurns { get; set; }
        public bool IsBankrupt { get; set; }
    }

    public class GameState
    {
        public string Id { get; set; } = Guid.NewGuid().ToString("N")[..8];
        public List<Player> Players { get; set; } = new();
        public List<Tile> Board { get; set; } = new();
        public int CurrentPlayer { get; set; }
        public int DiceA { get; set; }
        public int DiceB { get; set; }
        public bool AwaitingRoll { get; set; } = true;
        public bool AwaitingEndTurn { get; set; }
        public List<string> Log { get; set; } = new();
        public string? PendingMessage { get; set; } // что показать игроку
        public bool GameOver { get; set; }
    }
}