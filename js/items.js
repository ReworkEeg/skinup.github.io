/* Реальные предметы CS2 — изображения Steam Community Market */
const SKINS = [
  { id: 1,  name: "AK-47 | Asiimov",                     wear: "Minimal Wear",              price: 61,    rarity: "red",    file: "img/ak-47-asiimov-minimal-wear.png" },
  { id: 2,  name: "★ Karambit | Marble Fade",            wear: "Factory New",               price: 905,   rarity: "gold",   file: "img/karambit-marble-fade-factory-new.png" },
  { id: 3,  name: "Desert Eagle | Oxide Blaze",          wear: "Field-Tested",              price: 36,    rarity: "purple", file: "img/desert-eagle-oxide-blaze-field-tested.png" },
  { id: 4,  name: "Glock-18 | Fade",                     wear: "Factory New",               price: 410,   rarity: "red",    file: "img/glock-18-fade-factory-new.png" },
  { id: 5,  name: "USP-S | Kill Confirmed",              wear: "Well-Worn",                 price: 47,    rarity: "pink",   file: "img/usp-s-kill-confirmed-well-worn.png" },
  { id: 6,  name: "AWP | Asiimov",                       wear: "Field-Tested",              price: 92,    rarity: "pink",   file: "img/awp-asiimov-field-tested.png" },
  { id: 7,  name: "M4A1-S | Printstream",                wear: "Field-Tested",              price: 134,   rarity: "red",    file: "img/m4a1-s-printstream-field-tested.png" },
  { id: 8,  name: "★ Karambit | Case Hardened",          wear: "Minimal Wear",              price: 720,   rarity: "gold",   file: "img/karambit-case-hardened-minimal-wear.png" },
  { id: 9,  name: "AK-47 | Fire Serpent",                wear: "Field-Tested",              price: 255,   rarity: "red",    file: "img/ak-47-fire-serpent-field-tested.png" },
  { id: 10, name: "Souvenir Desert Eagle | Ocean Drive", wear: "Factory New",               price: 118,   rarity: "pink",   file: "img/souvenir-desert-eagle-ocean-drive-factory-new.png" },
  { id: 11, name: "AWP | Hyper Beast",                   wear: "Battle-Scarred",            price: 26,    rarity: "blue",   file: "img/awp-hyper-beast-battle-scarred.png" },
  { id: 12, name: "AK-47 | Neon Rider",                  wear: "Field-Tested",              price: 31,    rarity: "blue",   file: "img/ak-47-neon-rider-field-tested.png" },
  { id: 13, name: "StatTrak™ USP-S | Neo-Noir",          wear: "Minimal Wear",              price: 27,    rarity: "purple", file: "img/stattrak-usp-s-neo-noir-minimal-wear.png" },
  { id: 14, name: "Glock-18 | Water Elemental",          wear: "Minimal Wear",              price: 15,    rarity: "blue",   file: "img/glock-18-water-elemental-minimal-wear.png" },
  { id: 15, name: "M4A4 | Desolate Space",               wear: "Field-Tested",              price: 12,    rarity: "blue",   file: "img/m4a4-desolate-space-field-tested.png" },
  { id: 16, name: "StatTrak™ M4A1-S | Hyper Beast",      wear: "Battle-Scarred",            price: 21,    rarity: "purple", file: "img/stattrak-m4a1-s-hyper-beast-battle-scarred.png" },
  { id: 17, name: "Glock-18 | Gamma Doppler",            wear: "Factory New",               price: 129,   rarity: "pink",   file: "img/glock-18-gamma-doppler-factory-new.png" },
  { id: 18, name: "★ Karambit | Doppler",                wear: "Factory New",               price: 860,   rarity: "gold",   file: "img/karambit-doppler-factory-new.png" },
  { id: 19, name: "AK-47 | Bloodsport",                  wear: "Field-Tested",              price: 42,    rarity: "purple", file: "img/ak-47-bloodsport-field-tested.png" },
  { id: 20, name: "StatTrak™ AK-47 | Bloodsport",        wear: "Factory New",               price: 155,   rarity: "red",    file: "img/stattrak-ak-47-bloodsport-factory-new.png" },
  { id: 21, name: "★ Huntsman Knife | Marble Fade",      wear: "Factory New",               price: 305,   rarity: "gold",   file: "img/huntsman-knife-marble-fade-factory-new.png" },
  { id: 22, name: "★ Bayonet | Marble Fade",             wear: "Factory New",               price: 560,   rarity: "gold",   file: "img/bayonet-marble-fade-factory-new.png" },
  { id: 23, name: "★ Skeleton Knife | Marble Fade",      wear: "Factory New",               price: 1180,  rarity: "gold",   file: "img/skeleton-knife-marble-fade-factory-new.png" }
];

const RARITY = {
  blue:   { label: "Mil-Spec",   color: "#4b69ff" },
  purple: { label: "Restricted", color: "#8847ff" },
  pink:   { label: "Classified", color: "#d32ce6" },
  red:    { label: "Covert",     color: "#eb4b4b" },
  gold:   { label: "Нож",        color: "#ffd700" }
};

const fmtMoney = (n) => {
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  return "$" + Math.round(n).toLocaleString("en-US");
};
