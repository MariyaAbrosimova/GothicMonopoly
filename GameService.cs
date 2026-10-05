using GothicMonopoly.Models;

namespace GothicMonopoly.Services;

public class GameService
{
    private readonly Dictionary<string, GameState> _games = new();
    private readonly Random _rng = new();

    public GameState NewGame(string[] names)
    {
        var state = new GameState { Board = BoardFactory.Create() };
        var tokens = new[] { TokenType.Skull, TokenType.Raven, TokenType.Bat, TokenType.Candle };
        for (int i = 0; i < names.Length; i++)
            state.Players.Add(new Player { Id = i, Name = names[i], Token = tokens[i] });

        state.Log.Add("Партия началась. Да помилует вас Тьма...");
        _games[state.Id] = state;
        return state;
    }

    public GameState? Get(string id) => _games.GetValueOrDefault(id);

    public GameState Roll(string id)
    {
        var s = _games[id];
        if (s.GameOver || !s.AwaitingRoll) return s;

        var p = s.Players[s.CurrentPlayer];
        s.DiceA = _rng.Next(1, 7);
        s.DiceB = _rng.Next(1, 7);
        int steps = s.DiceA + s.DiceB;

        if (p.InJail)
        {
            if (s.DiceA == s.DiceB)
            {
                p.InJail = false; p.JailTurns = 0;
                s.Log.Add($"{p.Name} выбросил дубль и бежит из подземелья!");
            }
            else
            {
                p.JailTurns++;
                if (p.JailTurns >= 3)
                {
                    p.Money -= 50; p.InJail = false; p.JailTurns = 0;
                    s.Log.Add($"{p.Name} платит 50 кровавых и выходит.");
                }
                else s.Log.Add($"{p.Name} остаётся в подземелье ({p.JailTurns}/3).");
                s.AwaitingRoll = false; s.AwaitingEndTurn = true;
                return s;
            }
        }

        p.Position = (p.Position + steps) % 40;
        s.Log.Add($"{p.Name} бросает {s.DiceA}+{s.DiceB} → {s.Board[p.Position].Name}");
        ResolveTile(s, p);
        s.AwaitingRoll = false;
        s.AwaitingEndTurn = true;
        CheckBankrupt(s);
        return s;
    }

    private void ResolveTile(GameState s, Player p)
    {
        var t = s.Board[p.Position];
        switch (t.Type)
        {
            case TileType.Property or TileType.Station or TileType.Utility:
                if (t.OwnerId == null)
                {
                    if (p.Money >= t.Price)
                        s.PendingMessage = $"Купить «{t.Name}» за {t.Price}?";
                    else
                        s.Log.Add($"Не хватает золота на «{t.Name}».");
                }
                else if (t.OwnerId != p.Id)
                {
                    int rent = t.Rent + t.Houses * t.Rent;
                    var owner = s.Players[t.OwnerId.Value];
                    p.Money -= rent; owner.Money += rent;
                    s.Log.Add($"{p.Name} платит {rent} аренды игроку {owner.Name}.");
                }
                break;
            case TileType.Tax:
                p.Money -= t.Price;
                s.Log.Add($"{p.Name} отдаёт {t.Price} в казну Тьмы.");
                break;
            case TileType.GoToJail:
                p.Position = 10; p.InJail = true; p.JailTurns = 0;
                s.Log.Add($"{p.Name} брошен в подземелье!");
                break;
            case TileType.Fate:
            case TileType.Coven:
                ApplyCard(s, p, t.Type == TileType.Fate);
                break;
        }
    }

    private void ApplyCard(GameState s, Player p, bool isFate)
    {
        int r = _rng.Next(6);
        switch (r)
        {
            case 0: p.Money += 100; s.Log.Add($"[{(isFate ? "Судьба" : "Ковен")}] Наследство: +100"); break;
            case 1: p.Money -= 100; s.Log.Add($"[{(isFate ? "Судьба" : "Ковен")}] Проклятие: −100"); break;
            case 2: p.Position = 0; p.Money += 200; s.Log.Add($"[{(isFate ? "Судьба" : "Ковен")}] Возврат к Вратам, +200"); break;
            case 3: p.Position = 10; p.InJail = true; s.Log.Add($"[{(isFate ? "Судьба" : "Ковен")}] В подземелье!"); break;
            case 4: p.Money += 50; s.Log.Add($"[{(isFate ? "Судьба" : "Ковен")}] Подаяние: +50"); break;
            default: p.Money -= 50; s.Log.Add($"[{(isFate ? "Судьба" : "Ковен")}] Пошлина: −50"); break;
        }
    }

    public GameState Buy(string id, bool buy)
    {
        var s = _games[id];
        var p = s.Players[s.CurrentPlayer];
        var t = s.Board[p.Position];
        if (s.PendingMessage == null || t.OwnerId != null) { s.PendingMessage = null; return s; }

        if (buy && p.Money >= t.Price)
        {
            p.Money -= t.Price;
            t.OwnerId = p.Id;
            s.Log.Add($"{p.Name} забирает «{t.Name}» за {t.Price}.");
        }
        else if (buy) s.Log.Add("Не хватает золота.");
        s.PendingMessage = null;
        CheckBankrupt(s);
        return s;
    }

    public GameState Build(string id)
    {
        var s = _games[id];
        var p = s.Players[s.CurrentPlayer];
        var t = s.Board[p.Position];
        if (t.OwnerId != p.Id || t.Type != TileType.Property || t.Houses >= 5) return s;
        int cost = 100 + t.Houses * 50;
        if (p.Money < cost) { s.Log.Add("Не хватает на постройку."); return s; }
        p.Money -= cost; t.Houses++;
        s.Log.Add($"{p.Name} строит {(t.Houses == 5 ? "собор" : $"дом ({t.Houses})")} на «{t.Name}» за {cost}.");
        return s;
    }

    public GameState EndTurn(string id)
    {
        var s = _games[id];
        if (s.GameOver) return s;
        s.PendingMessage = null;
        s.CurrentPlayer = (s.CurrentPlayer + 1) % s.Players.Count;
        while (s.Players[s.CurrentPlayer].IsBankrupt)
            s.CurrentPlayer = (s.CurrentPlayer + 1) % s.Players.Count;
        s.AwaitingRoll = true;
        s.AwaitingEndTurn = false;
        return s;
    }

    private void CheckBankrupt(GameState s)
    {
        foreach (var p in s.Players)
        {
            if (p.IsBankrupt || p.Money >= 0) continue;
            p.IsBankrupt = true;
            s.Log.Add($"☠ {p.Name} разорён и низвергнут во тьму.");
            foreach (var t in s.Board.Where(t => t.OwnerId == p.Id))
            { t.OwnerId = null; t.Houses = 0; }
        }
        var alive = s.Players.Where(p => !p.IsBankrupt).ToList();
        if (alive.Count == 1)
        {
            s.GameOver = true;
            s.Log.Add($"⚜ {alive[0].Name} — владыка этого мира.");
        }
    }
}