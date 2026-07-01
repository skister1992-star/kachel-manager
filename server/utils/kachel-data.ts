import fs from "node:fs";

const DATA_DIR = "./data";
const DATA_FILE = `${DATA_DIR}/kachels.json`;

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export const loadKachelData = (): any[] => {
  try {
    ensureDir();
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    }
    return [];
  } catch (error) {
    console.error("Failed to load Kachel data:", error);
    return [];
  }
};

export const saveKachelData = (kachels: any[]): boolean => {
  try {
    ensureDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(kachels, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to save Kachel data:", error);
    return false;
  }
};

export const addKachel = (kachel: any): boolean => {
  try {
    ensureDir();
    let kachels = loadKachelData();
    if (!Array.isArray(kachels)) kachels = [];
    kachels.push(kachel);
    return saveKachelData(kachels);
  } catch (error) {
    console.error("Failed to add Kachel:", error);
    return false;
  }
};

export const updateKachel = (id: string, data: any): boolean => {
  try {
    ensureDir();
    let kachels = loadKachelData();
    if (!Array.isArray(kachels)) kachels = [];
    const index = kachels.findIndex((k: any) => k.id === id);
    if (index !== -1) {
      kachels[index] = { ...kachels[index], ...data };
      return saveKachelData(kachels);
    }
    return false;
  } catch (error) {
    console.error("Failed to update Kachel:", error);
    return false;
  }
};

export const deleteKachel = (id: string): boolean => {
  try {
    ensureDir();
    let kachels = loadKachelData();
    if (!Array.isArray(kachels)) kachels = [];
    kachels = kachels.filter((k: any) => k.id !== id);
    return saveKachelData(kachels);
  } catch (error) {
    console.error("Failed to delete Kachel:", error);
    return false;
  }
};