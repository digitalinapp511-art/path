import fs from 'fs';
import path from 'path';

export interface InventoryItem {
  id: string;
  name: string;
  code: string;
  category: 'Vials' | 'Reagents' | 'Consumables';
  currentStock: number;
  initialStock: number;
  unit: string;
  reorderLevel: number;
  costPerUnit: number;
  lastUpdated: string;
}

export interface InventoryLog {
  id: string;
  orderNumber: string;
  patientName: string;
  action: 'AUTO_DEDUCT' | 'MANUAL_REFILL';
  details: string;
  timestamp: string;
}

export interface InventoryState {
  items: InventoryItem[];
  logs: InventoryLog[];
}

const DATA_FILE = path.join(__dirname, '../data/inventory.json');

const INITIAL_ITEMS: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'EDTA Vacutainer Vials (Purple 3ml)',
    code: 'VIAL-EDTA',
    category: 'Vials',
    currentStock: 120,
    initialStock: 150,
    unit: 'vials',
    reorderLevel: 25,
    costPerUnit: 6.5,
    lastUpdated: new Date().toLocaleTimeString()
  },
  {
    id: 'inv-2',
    name: 'SST Gel & Clot Activator Vials (Yellow 4ml)',
    code: 'VIAL-SST',
    category: 'Vials',
    currentStock: 95,
    initialStock: 120,
    unit: 'vials',
    reorderLevel: 20,
    costPerUnit: 8.0,
    lastUpdated: new Date().toLocaleTimeString()
  },
  {
    id: 'inv-3',
    name: 'Sodium Fluoride Vials (Grey 2ml)',
    code: 'VIAL-GREY',
    category: 'Vials',
    currentStock: 75,
    initialStock: 100,
    unit: 'vials',
    reorderLevel: 15,
    costPerUnit: 5.0,
    lastUpdated: new Date().toLocaleTimeString()
  },
  {
    id: 'inv-4',
    name: 'CBC 5-Part Lyse & Diluent Kit (Automated)',
    code: 'KIT-CBC',
    category: 'Reagents',
    currentStock: 280,
    initialStock: 300,
    unit: 'tests',
    reorderLevel: 40,
    costPerUnit: 22.0,
    lastUpdated: new Date().toLocaleTimeString()
  },
  {
    id: 'inv-5',
    name: 'Biochemistry Multi-Enzyme Reagent (LFT/KFT/Lipid)',
    code: 'KIT-BIO',
    category: 'Reagents',
    currentStock: 210,
    initialStock: 250,
    unit: 'tests',
    reorderLevel: 35,
    costPerUnit: 30.0,
    lastUpdated: new Date().toLocaleTimeString()
  },
  {
    id: 'inv-6',
    name: 'CLIA Thyroid Micro-well Cartridge (T3/T4/TSH)',
    code: 'KIT-THYROID',
    category: 'Reagents',
    currentStock: 65,
    initialStock: 80,
    unit: 'cartridges',
    reorderLevel: 15,
    costPerUnit: 55.0,
    lastUpdated: new Date().toLocaleTimeString()
  }
];

function loadState(): InventoryState {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading inventory file, initializing fresh:', err);
  }

  const freshState: InventoryState = {
    items: INITIAL_ITEMS,
    logs: [
      {
        id: `LOG-${Date.now()}`,
        orderNumber: 'SYS-INIT',
        patientName: 'System Setup',
        action: 'MANUAL_REFILL',
        details: 'Initial laboratory reagent and vial stock initialized',
        timestamp: new Date().toLocaleTimeString()
      }
    ]
  };
  saveState(freshState);
  return freshState;
}

function saveState(state: InventoryState): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving inventory state:', err);
  }
}

export const inventoryService = {
  getInventory(): InventoryState {
    return loadState();
  },

  // Auto-deduct stock based on prescribed tests for patient
  deductForOrder(orderNumber: string, patientName: string, testsList: any[] = []): { success: boolean; deducted: string[] } {
    const state = loadState();
    const deducted: string[] = [];

    const testCodes = (testsList || []).map(t => (t.code || t.name || '').toUpperCase());

    // 1. CBC Check
    const hasCBC = testCodes.some(c => c.includes('CBC') || c.includes('COUNT') || c.includes('BLOOD'));
    if (hasCBC || testCodes.length === 0) {
      const edta = state.items.find(i => i.code === 'VIAL-EDTA');
      if (edta && edta.currentStock > 0) {
        edta.currentStock -= 1;
        edta.lastUpdated = new Date().toLocaleTimeString();
        deducted.push('1x EDTA Vial (Purple)');
      }
      const cbcKit = state.items.find(i => i.code === 'KIT-CBC');
      if (cbcKit && cbcKit.currentStock > 0) {
        cbcKit.currentStock -= 1;
        cbcKit.lastUpdated = new Date().toLocaleTimeString();
        deducted.push('1x CBC Diluent Reagent');
      }
    }

    // 2. Thyroid Check
    const hasThyroid = testCodes.some(c => c.includes('THYROID') || c.includes('TSH'));
    if (hasThyroid) {
      const sst = state.items.find(i => i.code === 'VIAL-SST');
      if (sst && sst.currentStock > 0) {
        sst.currentStock -= 1;
        sst.lastUpdated = new Date().toLocaleTimeString();
        deducted.push('1x SST Yellow Vial');
      }
      const thyKit = state.items.find(i => i.code === 'KIT-THYROID');
      if (thyKit && thyKit.currentStock > 0) {
        thyKit.currentStock -= 1;
        thyKit.lastUpdated = new Date().toLocaleTimeString();
        deducted.push('1x Thyroid CLIA Cartridge');
      }
    }

    // 3. Biochemistry (LFT / KFT / Lipid)
    const hasBio = testCodes.some(c => c.includes('LFT') || c.includes('KFT') || c.includes('LIPID') || c.includes('LIVER') || c.includes('KIDNEY'));
    if (hasBio) {
      const sst = state.items.find(i => i.code === 'VIAL-SST');
      if (sst && sst.currentStock > 0) {
        sst.currentStock -= 1;
        sst.lastUpdated = new Date().toLocaleTimeString();
        deducted.push('1x SST Yellow Vial');
      }
      const bioKit = state.items.find(i => i.code === 'KIT-BIO');
      if (bioKit && bioKit.currentStock > 0) {
        bioKit.currentStock -= 1;
        bioKit.lastUpdated = new Date().toLocaleTimeString();
        deducted.push('1x Biochemistry Reagent');
      }
    }

    // 4. Glucose / Sugar
    const hasSugar = testCodes.some(c => c.includes('GLUCOSE') || c.includes('SUGAR') || c.includes('FASTING'));
    if (hasSugar) {
      const grey = state.items.find(i => i.code === 'VIAL-GREY');
      if (grey && grey.currentStock > 0) {
        grey.currentStock -= 1;
        grey.lastUpdated = new Date().toLocaleTimeString();
        deducted.push('1x Fluoride Grey Vial');
      }
    }

    if (deducted.length > 0) {
      state.logs.unshift({
        id: `LOG-${Date.now()}`,
        orderNumber,
        patientName,
        action: 'AUTO_DEDUCT',
        details: `Deducted: ${deducted.join(', ')}`,
        timestamp: new Date().toLocaleTimeString()
      });
      // Keep last 40 logs
      if (state.logs.length > 40) state.logs = state.logs.slice(0, 40);
      saveState(state);
    }

    return { success: true, deducted };
  },

  // Refill stock for an item
  refillStock(itemId: string, qty: number): InventoryItem | null {
    const state = loadState();
    const item = state.items.find(i => i.id === itemId);
    if (!item) return null;

    item.currentStock += qty;
    item.lastUpdated = new Date().toLocaleTimeString();

    state.logs.unshift({
      id: `LOG-${Date.now()}`,
      orderNumber: 'REFILL',
      patientName: 'Lab Inventory Manager',
      action: 'MANUAL_REFILL',
      details: `Refilled +${qty} units of ${item.name}`,
      timestamp: new Date().toLocaleTimeString()
    });

    saveState(state);
    return item;
  },

  // Reset inventory to full standard state
  resetInventory(): void {
    const freshState: InventoryState = {
      items: INITIAL_ITEMS,
      logs: [
        {
          id: `LOG-${Date.now()}`,
          orderNumber: 'RESET',
          patientName: 'Admin',
          action: 'MANUAL_REFILL',
          details: 'All reagents, kits and vials reset to factory standard stock',
          timestamp: new Date().toLocaleTimeString()
        }
      ]
    };
    saveState(freshState);
  }
};
