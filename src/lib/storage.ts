import type { Employee, Lead, Product, UserRole } from "@/types/crm"

const KEYS = {
  leads: "crm:leads",
  employees: "crm:employees",
  users: "crm:users",
  products: "crm:products",
}

function parse<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key)
    return s ? (JSON.parse(s) as T) : fallback
  } catch {
    return fallback
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export const storage = {
  leads: {
    all(): Lead[] {
      return parse<Lead[]>(KEYS.leads, [])
    },
    upsert(l: Lead) {
      const items = storage.leads.all()
      const idx = items.findIndex((x) => x.id === l.id)
      if (idx >= 0) items[idx] = l
      else items.unshift(l)
      save(KEYS.leads, items)
    },
    remove(id: string) {
      const items = storage.leads.all().filter((x) => x.id !== id)
      save(KEYS.leads, items)
    },
  },
  employees: {
    all(): Employee[] {
      return parse<Employee[]>(KEYS.employees, [])
    },
    upsert(e: Employee) {
      const items = storage.employees.all()
      const idx = items.findIndex((x) => x.id === e.id)
      if (idx >= 0) items[idx] = e
      else items.unshift(e)
      save(KEYS.employees, items)
    },
    remove(id: string) {
      const items = storage.employees.all().filter((x) => x.id !== id)
      save(KEYS.employees, items)
    },
  },
  users: {
    all(): UserRole[] {
      return parse<UserRole[]>(KEYS.users, [])
    },
    upsert(u: UserRole) {
      const items = storage.users.all()
      const idx = items.findIndex((x) => x.id === u.id)
      if (idx >= 0) items[idx] = u
      else items.unshift(u)
      save(KEYS.users, items)
    },
    remove(id: string) {
      const items = storage.users.all().filter((x) => x.id !== id)
      save(KEYS.users, items)
    },
  },
  products: {
    all(): Product[] {
      return parse<Product[]>(KEYS.products, [])
    },
    upsert(p: Product) {
      const items = storage.products.all()
      const idx = items.findIndex((x) => x.id === p.id)
      if (idx >= 0) items[idx] = p
      else items.unshift(p)
      save(KEYS.products, items)
    },
    remove(id: string) {
      const items = storage.products.all().filter((x) => x.id !== id)
      save(KEYS.products, items)
    },
  },
}

export function uid() {
  return Math.random().toString(36).slice(2, 10)
}
