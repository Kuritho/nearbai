// src/services/localDB.js — NearBai Information System
// LocalStorage-backed "database" matching the proposal's normalized schema.

const KEYS = {
  USERS: 'nb_users',
  HOUSES: 'nb_houses',
  ROOMS: 'nb_rooms',
  TENANTS: 'nb_tenants',
  RENT_PAYMENTS: 'nb_rent_payments',
  UTILITY_CHARGES: 'nb_utility_charges',
  EXPENSES: 'nb_expenses',
  SESSION: 'nb_session',
  SETTINGS: 'nb_settings',
  CURRENT_HOUSE: 'nb_current_house',
  RESERVATIONS: 'nb_reservations',
  ANNOUNCEMENTS: 'nb_announcements',
  BOOKINGS: 'nb_bookings',
  FAVORITES: 'nb_favorites',
  // MESSAGES: 'nb_messages', <-- REMOVED
};

const read = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const ADMIN_EMAIL = 'admin@nearbai.ph';
const ADMIN_PASSWORD = 'Admin123!';

// ---------- Seed admin + demo house ----------
export function ensureSeeded() {
  const users = read(KEYS.USERS);
  if (users.some((u) => u.role === 'admin')) return;

  const houseId = uid();
  users.push({
    id: 'admin-1',
    name: 'Administrator',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
    houseIds: [houseId],
    phone: '',
    createdAt: new Date().toISOString(),
  });
  write(KEYS.USERS, users);

  write(KEYS.HOUSES, [
    {
      id: houseId,
      name: 'Main Branch',
      address: '',
      contactNumber: '',
      imageUrl: '',
      createdAt: new Date().toISOString(),
    },
  ]);

  write(KEYS.CURRENT_HOUSE, houseId);
}

export const ADMIN_CREDENTIALS = {
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
};

// ================= AUTH =================
export const auth = {
  login(email, password) {
    ensureSeeded();
    const users = read(KEYS.USERS);
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) throw new Error('Invalid credentials');

    const session = {
      token: 'nb-' + uid(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        houseIds: user.houseIds || [],
      },
    };
    write(KEYS.SESSION, session);
    return session;
  },
  logout() {
    localStorage.removeItem(KEYS.SESSION);
  },
  getSession() {
    return read(KEYS.SESSION, null);
  },
};

// ================= PROPERTY =================
export const houses = {
  list() {
    return read(KEYS.HOUSES);
  },
  get(id) {
    return read(KEYS.HOUSES).find((h) => h.id === id);
  },
  create({ name, address, contactNumber, imageUrl }) {
    const all = read(KEYS.HOUSES);
    const house = {
      id: uid(),
      name,
      address: address || '',
      contactNumber: contactNumber || '',
      imageUrl: imageUrl || '',
      createdAt: new Date().toISOString(),
    };
    all.push(house);
    write(KEYS.HOUSES, all);
    return house;
  },
  update(id, changes) {
    const all = read(KEYS.HOUSES);
    const idx = all.findIndex((h) => h.id === id);
    if (idx < 0) throw new Error('Property not found');
    all[idx] = { ...all[idx], ...changes };
    write(KEYS.HOUSES, all);
    return all[idx];
  },
  remove(id) {
    const roomsArr = read(KEYS.ROOMS).filter((r) => r.houseId === id);
    if (roomsArr.length > 0) {
      throw new Error(`Property has ${roomsArr.length} room(s). Delete rooms first.`);
    }
    write(KEYS.HOUSES, read(KEYS.HOUSES).filter((h) => h.id !== id));
    return true;
  },
  current() {
    const id = read(KEYS.CURRENT_HOUSE, null);
    if (!id) {
      const first = read(KEYS.HOUSES)[0];
      if (first) {
        write(KEYS.CURRENT_HOUSE, first.id);
        return first;
      }
      return null;
    }
    return houses.get(id);
  },
  setCurrent(id) {
    write(KEYS.CURRENT_HOUSE, id);
  },
};

// ================= ROOMS =================
export const rooms = {
  list(houseId) {
    const allRooms = read(KEYS.ROOMS);
    const tenantList = read(KEYS.TENANTS);
    const filtered = houseId ? allRooms.filter((r) => r.houseId === houseId) : allRooms;
    return filtered.map((r) => {
      const occupants = tenantList.filter(
        (t) => t.roomId === r.id && t.status === 'occupied'
      ).length;
      return { ...r, occupants };
    });
  },

  create({ houseId, roomNumber, bedCapacity, monthlyRate, notes, gender, imageUrl }) {
    const all = read(KEYS.ROOMS);
    if (all.find((r) => r.houseId === houseId && r.roomNumber === roomNumber)) {
      throw new Error(`Room ${roomNumber} already exists`);
    }
    const room = {
      id: uid(),
      houseId,
      roomNumber,
      bedCapacity: Number(bedCapacity),
      monthlyRate: Number(monthlyRate) || 0,
      gender: gender || 'mixed',
      notes: notes || '',
      imageUrl: imageUrl || '',
      createdAt: new Date().toISOString(),
    };
    all.push(room);
    write(KEYS.ROOMS, all);
    return room;
  },

  update(id, changes) {
    const all = read(KEYS.ROOMS);
    const idx = all.findIndex((r) => r.id === id);
    if (idx < 0) throw new Error('Room not found');
    const occupants = read(KEYS.TENANTS).filter(
      (t) => t.roomId === id && t.status === 'occupied'
    ).length;
    if (changes.bedCapacity && Number(changes.bedCapacity) < occupants) {
      throw new Error(`Capacity cannot be less than current occupants (${occupants})`);
    }
    all[idx] = { ...all[idx], ...changes };
    write(KEYS.ROOMS, all);
    return all[idx];
  },

  remove(id) {
    const occupants = read(KEYS.TENANTS).filter(
      (t) => t.roomId === id && t.status === 'occupied'
    ).length;
    if (occupants > 0) throw new Error(`Room has ${occupants} tenant(s)`);
    write(KEYS.ROOMS, read(KEYS.ROOMS).filter((r) => r.id !== id));
    return true;
  },
};

// ================= TENANTS =================
export const tenants = {
  list(houseId) {
    const allRooms = read(KEYS.ROOMS);
    return read(KEYS.TENANTS)
      .filter((t) => !houseId || allRooms.find((r) => r.id === t.roomId)?.houseId === houseId)
      .map((t) => {
        const room = allRooms.find((r) => r.id === t.roomId);
        return {
          ...t,
          room: room ? { id: room.id, number: room.roomNumber } : null,
        };
      });
  },
  create({ name, email, password, phone, emergencyContact, roomId, moveInDate }) {
    const users = read(KEYS.USERS);
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already in use');
    }
    if (roomId) {
      const room = read(KEYS.ROOMS).find((r) => r.id === roomId);
      if (!room) throw new Error('Room not found');
      const occupants = read(KEYS.TENANTS).filter(
        (t) => t.roomId === roomId && t.status === 'occupied'
      ).length;
      if (occupants >= room.bedCapacity) throw new Error(`Room ${room.roomNumber} is full`);
    }
    const boarder = {
      id: uid(),
      name,
      email,
      password,
      role: 'tenant',
      houseIds: roomId
        ? [read(KEYS.ROOMS).find((r) => r.id === roomId)?.houseId].filter(Boolean)
        : [],
      phone: phone || '',
      emergencyContact: emergencyContact || '',
      roomId: roomId || null,
      moveInDate: moveInDate || new Date().toISOString().split('T')[0],
      status: roomId ? 'occupied' : 'reserved',
      createdAt: new Date().toISOString(),
    };
    users.push(boarder);
    write(KEYS.USERS, users);

    const allTenants = read(KEYS.TENANTS);
    allTenants.push({
      id: boarder.id,
      name,
      email,
      phone: phone || '',
      emergencyContact: emergencyContact || '',
      roomId: roomId || null,
      moveInDate: boarder.moveInDate,
      status: boarder.status,
      createdAt: boarder.createdAt,
    });
    write(KEYS.TENANTS, allTenants);
    return boarder;
  },
  remove(id) {
    write(KEYS.USERS, read(KEYS.USERS).filter((u) => u.id !== id));
    write(KEYS.TENANTS, read(KEYS.TENANTS).filter((t) => t.id !== id));
    write(KEYS.RENT_PAYMENTS, read(KEYS.RENT_PAYMENTS).filter((p) => p.tenantId !== id));
    write(KEYS.UTILITY_CHARGES, read(KEYS.UTILITY_CHARGES).filter((c) => c.tenantId !== id));
    return true;
  },
};

// ================= RENT PAYMENTS =================
function computeRentStatus(rent) {
  if (rent.amountPaid >= rent.amountDue) return 'paid';
  if (rent.amountPaid > 0) return 'partial';
  return 'unpaid';
}

export const rentPayments = {
  listForHouse(houseId) {
    const allRooms = read(KEYS.ROOMS);
    const tenantsArr = read(KEYS.TENANTS);
    return read(KEYS.RENT_PAYMENTS)
      .map((p) => {
        const tenant = tenantsArr.find((t) => t.id === p.tenantId);
        const room = tenant?.roomId ? allRooms.find((r) => r.id === tenant.roomId) : null;
        const balance = Math.max(0, p.amountDue - p.amountPaid);
        return {
          ...p,
          status: computeRentStatus(p),
          balance,
          tenantName: tenant?.name || 'Unknown',
          roomNumber: room?.roomNumber || '—',
          houseId: room?.houseId || null,
        };
      })
      .filter((p) => !houseId || p.houseId === houseId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  listForTenant(tenantId) {
    return read(KEYS.RENT_PAYMENTS)
      .filter((p) => p.tenantId === tenantId)
      .map((p) => ({
        ...p,
        status: computeRentStatus(p),
        balance: Math.max(0, p.amountDue - p.amountPaid),
      }));
  },
  create({ tenantId, billingMonth, amountDue, amountPaid, paymentMethod, orNumber, notes }) {
    const all = read(KEYS.RENT_PAYMENTS);
    const paid = Number(amountPaid) || 0;
    const payment = {
      id: uid(),
      tenantId,
      billingMonth,
      amountDue: Number(amountDue),
      amountPaid: paid,
      paymentMethod: paid > 0 ? paymentMethod || 'cash' : null,
      orNumber: paid > 0 ? orNumber || '' : '',
      notes: notes || '',
      createdAt: new Date().toISOString(),
      paidAt: paid > 0 ? new Date().toISOString() : null,
    };
    all.push(payment);
    write(KEYS.RENT_PAYMENTS, all);
    return payment;
  },
  recordPayment(id, { amount, paymentMethod, orNumber }) {
    const all = read(KEYS.RENT_PAYMENTS);
    const idx = all.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error('Payment record not found');
    const p = all[idx];
    p.amountPaid = Math.min(p.amountDue, p.amountPaid + Number(amount));
    p.paymentMethod = paymentMethod;
    p.orNumber = orNumber || p.orNumber;
    p.paidAt = new Date().toISOString();
    write(KEYS.RENT_PAYMENTS, all);
    return p;
  },
  markPaid(id) {
    const all = read(KEYS.RENT_PAYMENTS);
    const idx = all.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error('Not found');
    all[idx].amountPaid = all[idx].amountDue;
    all[idx].paidAt = new Date().toISOString();
    write(KEYS.RENT_PAYMENTS, all);
    return all[idx];
  },
};

// ================= UTILITY CHARGES =================
export const utilityCharges = {
  listForHouse(houseId) {
    const allRooms = read(KEYS.ROOMS);
    const tenantsArr = read(KEYS.TENANTS);
    return read(KEYS.UTILITY_CHARGES)
      .map((c) => {
        const tenant = tenantsArr.find((t) => t.id === c.tenantId);
        const room = tenant?.roomId ? allRooms.find((r) => r.id === tenant.roomId) : null;
        return {
          ...c,
          tenantName: tenant?.name || 'Unknown',
          roomNumber: room?.roomNumber || '—',
          houseId: room?.houseId || null,
        };
      })
      .filter((c) => !houseId || c.houseId === houseId);
  },
  listForTenant(tenantId) {
    return read(KEYS.UTILITY_CHARGES).filter((c) => c.tenantId === tenantId);
  },
  create({ tenantId, chargeType, amountBilled, billingPeriod, notes }) {
    const all = read(KEYS.UTILITY_CHARGES);
    const charge = {
      id: uid(),
      tenantId,
      chargeType,
      amountBilled: Number(amountBilled),
      billingPeriod,
      status: 'unpaid',
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };
    all.push(charge);
    write(KEYS.UTILITY_CHARGES, all);
    return charge;
  },
  markPaid(id) {
    const all = read(KEYS.UTILITY_CHARGES);
    const idx = all.findIndex((c) => c.id === id);
    if (idx < 0) throw new Error('Not found');
    all[idx].status = 'paid';
    write(KEYS.UTILITY_CHARGES, all);
    return all[idx];
  },
  remove(id) {
    write(KEYS.UTILITY_CHARGES, read(KEYS.UTILITY_CHARGES).filter((c) => c.id !== id));
    return true;
  },
};

// ================= EXPENSES =================
export const expenses = {
  list(houseId) {
    return read(KEYS.EXPENSES)
      .filter((e) => !houseId || e.houseId === houseId)
      .sort((a, b) => b.dateLogged.localeCompare(a.dateLogged));
  },
  create({ houseId, description, category, amount, dateLogged }) {
    const all = read(KEYS.EXPENSES);
    const expense = {
      id: uid(),
      houseId,
      description,
      category: category || 'other',
      amount: Number(amount),
      dateLogged: dateLogged || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    all.push(expense);
    write(KEYS.EXPENSES, all);
    return expense;
  },
  remove(id) {
    write(KEYS.EXPENSES, read(KEYS.EXPENSES).filter((e) => e.id !== id));
    return true;
  },
};

// ================= SETTINGS =================
const DEFAULT_SETTINGS = {
  ownerName: '',
  gcash: { accountName: '', phone: '', enabled: true },
  bank: { bankName: '', accountName: '', accountNumber: '', enabled: false },
  cash: { enabled: true, note: 'Pay in person to the caretaker' },
};

export const settings = {
  get() {
    const stored = read(KEYS.SETTINGS, null);
    if (!stored) return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    return {
      ...DEFAULT_SETTINGS,
      ...stored,
      gcash: { ...DEFAULT_SETTINGS.gcash, ...(stored.gcash || {}) },
      bank: { ...DEFAULT_SETTINGS.bank, ...(stored.bank || {}) },
      cash: { ...DEFAULT_SETTINGS.cash, ...(stored.cash || {}) },
    };
  },
  update(changes) {
    const current = settings.get();
    const merged = {
      ...current,
      ...changes,
      gcash: { ...current.gcash, ...(changes.gcash || {}) },
      bank: { ...current.bank, ...(changes.bank || {}) },
      cash: { ...current.cash, ...(changes.cash || {}) },
    };
    write(KEYS.SETTINGS, merged);
    return merged;
  },
};

// ================= RESERVATIONS (guest requests + tenant bookings) =================
export const reservations = {
  list(houseId) {
    const allRooms = read(KEYS.ROOMS);
    const tenantsArr = read(KEYS.TENANTS);
    
    const guestReqs = read(KEYS.RESERVATIONS).map((r) => {
      const room = allRooms.find((rm) => rm.id === r.roomId);
      return {
        ...r,
        type: 'guest', 
        roomNumber: room?.roomNumber || '—',
        roomRate: room?.monthlyRate || 0,
        houseId: room?.houseId || null,
        tenantName: r.fullName, 
      };
    });

    const tenantBookings = read(KEYS.BOOKINGS).map((b) => {
      const room = allRooms.find((rm) => rm.id === b.roomId);
      const tenant = tenantsArr.find((t) => t.id === b.tenantId);
      return {
        ...b,
        type: 'booking', 
        fullName: tenant?.name || b.guestName || 'Unknown',
        phone: tenant?.phone || b.guestPhone || '—',
        email: tenant?.email || '—',
        roomNumber: room?.roomNumber || '—',
        roomRate: room?.monthlyRate || 0,
        houseId: room?.houseId || null,
        tenantName: tenant?.name || b.guestName || 'Unknown',
        bedNumber: b.bedNumber,
      };
    });

    return [...guestReqs, ...tenantBookings]
      .filter((r) => !houseId || r.houseId === houseId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  create({ houseId, roomId, fullName, phone, email, moveInDate, notes }) {
    if (!houseId || !roomId || !fullName || !phone) {
      throw new Error('Please fill in all required fields.');
    }
    const room = read(KEYS.ROOMS).find((r) => r.id === roomId);
    if (!room || room.houseId !== houseId) throw new Error('Room not found.');

    const occupants = read(KEYS.TENANTS).filter(
      (t) => t.roomId === roomId && t.status === 'occupied'
    ).length;
    const pending = read(KEYS.RESERVATIONS).filter(
      (r) => r.roomId === roomId && r.status === 'pending'
    ).length;
    if (occupants + pending >= room.bedCapacity) {
      throw new Error('This room is fully reserved.');
    }

    const all = read(KEYS.RESERVATIONS);
    const reference = 'NBR-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    const reservation = {
      id: uid(),
      reference,
      houseId,
      roomId,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: (email || '').trim(),
      moveInDate: moveInDate || new Date().toISOString().split('T')[0],
      notes: notes || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    all.push(reservation);
    write(KEYS.RESERVATIONS, all);
    return reservation;
  },

  approve(id, password, type = 'guest') {
    if (type === 'booking') {
      return bookings.approve(id, password);
    }
    
    const all = read(KEYS.RESERVATIONS);
    const idx = all.findIndex((r) => r.id === id);
    if (idx < 0) throw new Error('Reservation not found');
    const res = all[idx];
    if (res.status !== 'pending') throw new Error('Already processed');

    const boarder = tenants.create({
      name: res.fullName,
      email: res.email || `${res.reference.toLowerCase()}@nearbai.local`,
      password: password || 'Tenant123!',
      phone: res.phone,
      emergencyContact: '',
      roomId: res.roomId,
      moveInDate: res.moveInDate,
    });
    res.status = 'approved';
    res.tenantId = boarder.id;
    res.processedAt = new Date().toISOString();
    write(KEYS.RESERVATIONS, all);
    return res;
  },

  reject(id, reason, type = 'guest') {
    if (type === 'booking') {
      return bookings.reject(id, reason);
    }
    
    const all = read(KEYS.RESERVATIONS);
    const idx = all.findIndex((r) => r.id === id);
    if (idx < 0) throw new Error('Reservation not found');
    all[idx].status = 'rejected';
    all[idx].rejectionReason = reason || 'No reason provided';
    all[idx].processedAt = new Date().toISOString();
    write(KEYS.RESERVATIONS, all);
    return all[idx];
  },

  getByReference(ref) {
    return read(KEYS.RESERVATIONS).find((r) => r.reference === ref) || null;
  },
};

// ================= ANNOUNCEMENTS =================
export const announcements = {
  list(houseId) {
    return read(KEYS.ANNOUNCEMENTS)
      .filter((a) => !houseId || a.houseId === houseId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  create({ houseId, title, body, priority }) {
    const all = read(KEYS.ANNOUNCEMENTS);
    const ann = {
      id: uid(),
      houseId,
      title,
      body,
      priority: priority || 'normal',
      createdAt: new Date().toISOString(),
    };
    all.push(ann);
    write(KEYS.ANNOUNCEMENTS, all);
    return ann;
  },
  remove(id) {
    write(KEYS.ANNOUNCEMENTS, read(KEYS.ANNOUNCEMENTS).filter((a) => a.id !== id));
  },
};

// ================= BOOKINGS (interactive bed reservation) =================
export const bookings = {
  list(houseId) {
    const allRooms = read(KEYS.ROOMS);
    const tenantsArr = read(KEYS.TENANTS);
    return read(KEYS.BOOKINGS)
      .map((b) => {
        const room = allRooms.find((r) => r.id === b.roomId);
        const tenant = tenantsArr.find((t) => t.id === b.tenantId);
        return {
          ...b,
          roomNumber: room?.roomNumber || '—',
          houseId: room?.houseId || null,
          tenantName: tenant?.name || b.guestName || 'Unknown',
        };
      })
      .filter((b) => !houseId || b.houseId === houseId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  listForTenant(tenantId) {
    const allRooms = read(KEYS.ROOMS);
    return read(KEYS.BOOKINGS)
      .filter((b) => b.tenantId === tenantId)
      .map((b) => {
        const room = allRooms.find((r) => r.id === b.roomId);
        return { ...b, roomNumber: room?.roomNumber || '—' };
      });
  },
  takenBeds(roomId) {
    const active = read(KEYS.BOOKINGS).filter(
      (b) => b.roomId === roomId && (b.status === 'pending' || b.status === 'approved')
    );
    return active.map((b) => b.bedNumber);
  },
  create({ tenantId, roomId, bedNumber, moveInDate, guestName, guestPhone }) {
    const room = read(KEYS.ROOMS).find((r) => r.id === roomId);
    if (!room) throw new Error('Room not found');
    const taken = bookings.takenBeds(roomId);
    if (taken.includes(bedNumber)) throw new Error(`Bed ${bedNumber} is already booked.`);

    const all = read(KEYS.BOOKINGS);
    const booking = {
      id: uid(),
      reference: 'BKG-' + Math.random().toString(36).slice(2, 7).toUpperCase(),
      tenantId: tenantId || null,
      guestName: guestName || '',
      guestPhone: guestPhone || '',
      roomId,
      bedNumber,
      moveInDate: moveInDate || new Date().toISOString().split('T')[0],
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    all.push(booking);
    write(KEYS.BOOKINGS, all);
    return booking;
  },
  approve(id, password) {
    const all = read(KEYS.BOOKINGS);
    const idx = all.findIndex((b) => b.id === id);
    if (idx < 0) throw new Error('Booking not found');
    const bk = all[idx];
    if (bk.status !== 'pending') throw new Error('Already processed');

    if (!bk.tenantId && bk.guestName) {
      const newTenant = tenants.create({
        name: bk.guestName,
        email: `${bk.reference.toLowerCase()}@nearbai.local`,
        password: password || 'Tenant123!',
        phone: bk.guestPhone,
        emergencyContact: '',
        roomId: bk.roomId,
        moveInDate: bk.moveInDate,
      });
      bk.tenantId = newTenant.id;
    }
    bk.status = 'approved';
    bk.processedAt = new Date().toISOString();
    write(KEYS.BOOKINGS, all);
    return bk;
  },
  reject(id, reason) {
    const all = read(KEYS.BOOKINGS);
    const idx = all.findIndex((b) => b.id === id);
    if (idx < 0) throw new Error('Booking not found');
    all[idx].status = 'rejected';
    all[idx].rejectionReason = reason || 'No reason provided';
    all[idx].processedAt = new Date().toISOString();
    write(KEYS.BOOKINGS, all);
    return all[idx];
  },
  cancel(id, byTenant = false) {
    const all = read(KEYS.BOOKINGS);
    const idx = all.findIndex((b) => b.id === id);
    if (idx < 0) throw new Error('Booking not found');
    if (byTenant && all[idx].status !== 'pending') {
      throw new Error('Only pending bookings can be cancelled');
    }
    all[idx].status = 'cancelled';
    all[idx].cancelledAt = new Date().toISOString();
    write(KEYS.BOOKINGS, all);
    return all[idx];
  },
};

// ================= FAVORITES =================
export const favorites = {
  list(tenantId) {
    const allRooms = read(KEYS.ROOMS);
    const allHouses = read(KEYS.HOUSES);
    return read(KEYS.FAVORITES)
      .filter((f) => f.tenantId === tenantId)
      .map((f) => {
        const house = allHouses.find((h) => h.id === f.houseId);
        const houseRooms = allRooms.filter((r) => r.houseId === f.houseId);
        const totalBeds = houseRooms.reduce((s, r) => s + r.bedCapacity, 0);
        const occupied = tenants.list(f.houseId).filter((t) => t.status === 'occupied').length;
        return { ...f, house, available: Math.max(0, totalBeds - occupied) };
      });
  },
  isFavorite(tenantId, houseId) {
    return read(KEYS.FAVORITES).some(
      (f) => f.tenantId === tenantId && f.houseId === houseId
    );
  },
  toggle(tenantId, houseId) {
    const all = read(KEYS.FAVORITES);
    const existing = all.findIndex(
      (f) => f.tenantId === tenantId && f.houseId === houseId
    );
    if (existing >= 0) {
      all.splice(existing, 1);
      write(KEYS.FAVORITES, all);
      return false;
    }
    all.push({ id: uid(), tenantId, houseId, createdAt: new Date().toISOString() });
    write(KEYS.FAVORITES, all);
    return true;
  },
};

// ================= ANALYTICS =================
export const analytics = {
  dashboard(houseId) {
    const allRooms = rooms.list(houseId);
    const tenantsArr = tenants.list(houseId);
    const rents = rentPayments.listForHouse(houseId);
    const utils = utilityCharges.listForHouse(houseId);
    const exp = expenses.list(houseId);
    
    const pendingRes = reservations.list(houseId).filter((r) => r.status === 'pending').length;

    const occupiedBeds = tenantsArr.filter((t) => t.status === 'occupied').length;
    const totalCapacity = allRooms.reduce((s, r) => s + r.bedCapacity, 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((occupiedBeds / totalCapacity) * 100) : 0;

    const totalRentDue = rents.reduce((s, r) => s + r.amountDue, 0);
    const totalRentPaid = rents.reduce((s, r) => s + r.amountPaid, 0);
    const totalUtil = utils.reduce((s, c) => s + (c.status === 'paid' ? c.amountBilled : 0), 0);
    const totalExpenses = exp.reduce((s, e) => s + e.amount, 0);

    const totalCollections = totalRentPaid + totalUtil;
    const netIncome = totalCollections - totalExpenses;

    const paid = rents.filter((r) => r.status === 'paid').length;
    const partial = rents.filter((r) => r.status === 'partial').length;
    const unpaid = rents.filter((r) => r.status === 'unpaid').length;
    const overdue = rents.filter((r) => r.status !== 'paid' && r.balance > 0).length;

    return {
      propertiesCount: houses.list().length,
      roomsCount: allRooms.length,
      tenantsCount: tenantsArr.length,
      occupiedBeds,
      totalCapacity,
      occupancyRate,
      totalRentDue,
      totalRentPaid,
      totalUtil,
      totalCollections,
      totalExpenses,
      netIncome,
      paid,
      partial,
      unpaid,
      overdue,
      pendingReservations: pendingRes,
      recentRent: rents.slice(0, 5),
    };
  },
};
