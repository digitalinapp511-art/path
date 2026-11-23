import fs from 'fs';
import path from 'path';

export interface OrderMeta {
  orderNumber: string;
  tests: string;
  testsList: any[];
  testResults: any[];
  notes: string;
  updatedAt: string;
}

const DATA_DIR = path.join(__dirname, '..', 'data');
const META_FILE = path.join(DATA_DIR, 'orders_meta.json');

class OrderMetaService {
  private metas: Map<string, OrderMeta> = new Map();

  constructor() {
    this.ensureDataDir();
    this.loadFromFile();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadFromFile() {
    try {
      if (fs.existsSync(META_FILE)) {
        const raw = fs.readFileSync(META_FILE, 'utf8');
        const data: Record<string, OrderMeta> = JSON.parse(raw);
        this.metas = new Map(Object.entries(data));
      }
    } catch (e) {
      console.warn('Orders meta load note, starting fresh:', e);
      this.metas = new Map();
    }
  }

  private saveToFile() {
    try {
      this.ensureDataDir();
      const obj = Object.fromEntries(this.metas.entries());
      fs.writeFileSync(META_FILE, JSON.stringify(obj, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to save orders meta:', e);
    }
  }

  public saveOrderInit(orderNumber: string, tests: string, testsList: any[] = []) {
    const existing = this.metas.get(orderNumber) || {
      orderNumber,
      tests,
      testsList,
      testResults: [],
      notes: '',
      updatedAt: new Date().toISOString()
    };

    existing.tests = tests;
    existing.testsList = testsList;
    existing.updatedAt = new Date().toISOString();

    this.metas.set(orderNumber, existing);
    this.saveToFile();
    return existing;
  }

  public saveResults(orderNumber: string, results: any[], notes = '') {
    const existing = this.metas.get(orderNumber) || {
      orderNumber,
      tests: 'Complete Blood Count (CBC)',
      testsList: [],
      testResults: [],
      notes: '',
      updatedAt: new Date().toISOString()
    };

    existing.testResults = results;
    if (notes) existing.notes = notes;
    existing.updatedAt = new Date().toISOString();

    this.metas.set(orderNumber, existing);
    this.saveToFile();
    return existing;
  }

  public getOrderMeta(orderNumber: string): OrderMeta | undefined {
    return this.metas.get(orderNumber);
  }

  public getAllMetas(): Map<string, OrderMeta> {
    return this.metas;
  }

  public resetAll() {
    this.metas.clear();
    this.saveToFile();
  }
}

export const orderMetaService = new OrderMetaService();
