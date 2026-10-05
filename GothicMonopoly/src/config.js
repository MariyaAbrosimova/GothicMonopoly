const TILES_CONFIG = [
    { id: 0, name: "Врата Ада", type: "start", desc: "+200🩸 при проходе" },
    { id: 1, name: "Чумные Лачуги", type: "property", cost: 60, rent: 10, group: "#49392e" },
    { id: 2, name: "Шепот Бездны", type: "event", desc: "Карта Судьбы" },
    { id: 3, name: "Гнилой Тупик", type: "property", cost: 80, rent: 15, group: "#49392e" },
    { id: 4, name: "Подать Инквизиции", type: "tax", cost: 100, desc: "Отречение (-100🩸)" },
    { id: 5, name: "Склеп Карштайнов", type: "property", cost: 100, rent: 20, group: "#1c402d" },
    { id: 6, name: "Казематы Инквизиции", type: "jail", desc: "Темница грешников" },
    { id: 7, name: "Усыпальница Воронов", type: "property", cost: 120, rent: 25, group: "#1c402d" },
    { id: 8, name: "Колокольня Плача", type: "property", cost: 140, rent: 30, group: "#1b2c4d" },
    { id: 9, name: "Шепот Бездны", type: "event", desc: "Карта Судьбы" },
    { id: 10, name: "Чумной Чопор", type: "property", cost: 160, rent: 35, group: "#1b2c4d" },
    { id: 11, name: "Костяная Катакомба", type: "property", cost: 180, rent: 40, group: "#461b4d" },
    { id: 12, name: "Кровавый Шабаш", type: "neutral", desc: "Передышка бродяг" },
    { id: 13, name: "Квартал Алхимиков", type: "property", cost: 200, rent: 45, group: "#461b4d" },
    { id: 14, name: "Шепот Бездны", type: "event", desc: "Карта Судьбы" },
    { id: 15, name: "Логово Горгулий", type: "property", cost: 220, rent: 50, group: "#5a1a1a" },
    { id: 16, name: "Жертвенный Алтарь", type: "tax", cost: 150, desc: "Кровный сбор (-150🩸)" },
    { id: 17, name: "Башня Палача", type: "property", cost: 240, rent: 55, group: "#5a1a1a" },
    { id: 18, name: "Конвой Инквизиции", type: "goto_jail", desc: "Изгнание в казематы!" },
    { id: 19, name: "Двор Прокаженных", type: "property", cost: 260, rent: 60, group: "#574a12" },
    { id: 20, name: "Аббатство Грехов", type: "property", cost: 280, rent: 65, group: "#574a12" },
    { id: 21, name: "Шепот Бездны", type: "event", desc: "Карта Судьбы" },
    { id: 22, name: "Мраморный Саркофаг", type: "property", cost: 320, rent: 80, group: "#6b1437" },
    { id: 23, name: "Цитадель Тьмы", type: "property", cost: 400, rent: 110, group: "#6b1437" }
];

const CARDS = [
    { text: "Чумной мор выкосил треть челяди! Потеряно 60🩸.", blood: -60 },
    { text: "Ночное осквернение могил принесло антикварное серебро. +80🩸.", blood: 80 },
    { text: "Вы обвинены в ереси и чернокнижии! Откуп инквизиции: -100🩸.", blood: -100 },
    { text: "Древний ритуал увенчался успехом! Источник питает вас: +120🩸.", blood: 120 },
    { text: "Кровавая дань вассалов собрана полностью. +50🩸.", blood: 50 }
];