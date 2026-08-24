import {
  User,
  BloodBank,
  Hospital,
  BloodUnit,
  BloodRequest,
  Donation,
  Prediction,
  RedistributionSuggestion,
  FeedbackLog,
  AppNotification,
  UserRole,
  SuggestionStatus
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_BLOOD_BANKS,
  INITIAL_HOSPITALS,
  INITIAL_BLOOD_UNITS,
  INITIAL_REQUESTS,
  INITIAL_DONATIONS,
  INITIAL_PREDICTIONS,
  INITIAL_REDISTRIBUTION_SUGGESTIONS,
  INITIAL_FEEDBACK_LOGS,
  INITIAL_NOTIFICATIONS
} from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'raktsetu_users_v2',
  BLOOD_BANKS: 'raktsetu_blood_banks_v2',
  HOSPITALS: 'raktsetu_hospitals_v2',
  BLOOD_UNITS: 'raktsetu_blood_units_v2',
  REQUESTS: 'raktsetu_requests_v2',
  DONATIONS: 'raktsetu_donations_v2',
  PREDICTIONS: 'raktsetu_predictions_v2',
  REDISTRIBUTIONS: 'raktsetu_redistributions_v2',
  FEEDBACK_LOGS: 'raktsetu_feedback_logs_v2',
  NOTIFICATIONS: 'raktsetu_notifications_v2',
  INITIALIZED: 'raktsetu_initialized_v2'
};

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error reading ${key} from storage`, e);
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to storage`, e);
  }
}

export function initDatabase(forceReset: boolean = false): void {
  if (forceReset || !localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
    setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    setItem(STORAGE_KEYS.BLOOD_BANKS, INITIAL_BLOOD_BANKS);
    setItem(STORAGE_KEYS.HOSPITALS, INITIAL_HOSPITALS);
    setItem(STORAGE_KEYS.BLOOD_UNITS, INITIAL_BLOOD_UNITS);
    setItem(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    setItem(STORAGE_KEYS.DONATIONS, INITIAL_DONATIONS);
    setItem(STORAGE_KEYS.PREDICTIONS, INITIAL_PREDICTIONS);
    setItem(STORAGE_KEYS.REDISTRIBUTIONS, INITIAL_REDISTRIBUTION_SUGGESTIONS);
    setItem(STORAGE_KEYS.FEEDBACK_LOGS, INITIAL_FEEDBACK_LOGS);
    setItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
}

// ----------------- USERS -----------------
export const dbUsers = {
  getAll: (): User[] => getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS),
  getById: (id: string): User | undefined => dbUsers.getAll().find(u => u.id === id),
  getByEmail: (email: string): User | undefined =>
    dbUsers.getAll().find(u => u.email.toLowerCase() === email.toLowerCase()),
  add: (user: User): User => {
    const list = dbUsers.getAll();
    list.push(user);
    setItem(STORAGE_KEYS.USERS, list);
    return user;
  },
  update: (user: User): void => {
    const list = dbUsers.getAll().map(u => (u.id === user.id ? user : u));
    setItem(STORAGE_KEYS.USERS, list);
  }
};

// ----------------- BLOOD BANKS -----------------
export const dbBloodBanks = {
  getAll: (): BloodBank[] => getItem<BloodBank[]>(STORAGE_KEYS.BLOOD_BANKS, INITIAL_BLOOD_BANKS),
  getById: (id: string): BloodBank | undefined => dbBloodBanks.getAll().find(b => b.id === id)
};

// ----------------- HOSPITALS -----------------
export const dbHospitals = {
  getAll: (): Hospital[] => getItem<Hospital[]>(STORAGE_KEYS.HOSPITALS, INITIAL_HOSPITALS),
  getById: (id: string): Hospital | undefined => dbHospitals.getAll().find(h => h.id === id)
};

// ----------------- BLOOD UNITS -----------------
export const dbBloodUnits = {
  getAll: (): BloodUnit[] => getItem<BloodUnit[]>(STORAGE_KEYS.BLOOD_UNITS, INITIAL_BLOOD_UNITS),
  getByBankId: (bankId: string): BloodUnit[] =>
    dbBloodUnits.getAll().filter(u => u.blood_bank_id === bankId),
  add: (unit: BloodUnit): BloodUnit => {
    const list = dbBloodUnits.getAll();
    list.unshift(unit);
    setItem(STORAGE_KEYS.BLOOD_UNITS, list);
    return unit;
  },
  update: (unit: BloodUnit): void => {
    const list = dbBloodUnits.getAll().map(u => (u.id === unit.id ? unit : u));
    setItem(STORAGE_KEYS.BLOOD_UNITS, list);
  },
  updateStatus: (unitId: string, status: BloodUnit['status']): void => {
    const list = dbBloodUnits.getAll().map(u => (u.id === unitId ? { ...u, status } : u));
    setItem(STORAGE_KEYS.BLOOD_UNITS, list);
  },
  delete: (id: string): void => {
    const list = dbBloodUnits.getAll().filter(u => u.id !== id);
    setItem(STORAGE_KEYS.BLOOD_UNITS, list);
  }
};

// ----------------- REQUESTS -----------------
export const dbRequests = {
  getAll: (): BloodRequest[] => getItem<BloodRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS),
  getByHospitalId: (hospitalId: string): BloodRequest[] =>
    dbRequests.getAll().filter(r => r.hospital_id === hospitalId),
  add: (request: BloodRequest): BloodRequest => {
    const list = dbRequests.getAll();
    list.unshift(request);
    setItem(STORAGE_KEYS.REQUESTS, list);
    return request;
  },
  updateStatus: (requestId: string, status: BloodRequest['status'], fulfilledByBankId?: string): void => {
    const list = dbRequests.getAll().map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status,
          ...(fulfilledByBankId ? { fulfilled_by_bank_id: fulfilledByBankId } : {})
        };
      }
      return r;
    });
    setItem(STORAGE_KEYS.REQUESTS, list);
  }
};

// ----------------- DONATIONS -----------------
export const dbDonations = {
  getAll: (): Donation[] => getItem<Donation[]>(STORAGE_KEYS.DONATIONS, INITIAL_DONATIONS),
  getByDonorId: (donorId: string): Donation[] =>
    dbDonations.getAll().filter(d => d.donor_id === donorId),
  add: (donation: Donation): Donation => {
    const list = dbDonations.getAll();
    list.unshift(donation);
    setItem(STORAGE_KEYS.DONATIONS, list);
    return donation;
  }
};

// ----------------- PREDICTIONS -----------------
export const dbPredictions = {
  getAll: (): Prediction[] => getItem<Prediction[]>(STORAGE_KEYS.PREDICTIONS, INITIAL_PREDICTIONS),
  getByBankId: (bankId: string): Prediction[] =>
    dbPredictions.getAll().filter(p => p.blood_bank_id === bankId),
  setAll: (predictions: Prediction[]): void => {
    setItem(STORAGE_KEYS.PREDICTIONS, predictions);
  }
};

// ----------------- REDISTRIBUTION & HUMAN-IN-THE-LOOP FEEDBACK -----------------
export const dbRedistributions = {
  getAll: (): RedistributionSuggestion[] =>
    getItem<RedistributionSuggestion[]>(STORAGE_KEYS.REDISTRIBUTIONS, INITIAL_REDISTRIBUTION_SUGGESTIONS),
  getByBankId: (bankId: string): RedistributionSuggestion[] =>
    dbRedistributions.getAll().filter(r => r.source_bank_id === bankId || r.destination_bank_id === bankId),
  setAll: (suggestions: RedistributionSuggestion[]): void => {
    setItem(STORAGE_KEYS.REDISTRIBUTIONS, suggestions);
  },

  /**
   * CRITICAL HUMAN-IN-THE-LOOP HANDLER
   * Strictly transitions pending suggestion to Approved/Rejected and logs audit record in feedback_log
   */
  updateStatusWithFeedback: (
    suggestionId: string,
    newStatus: SuggestionStatus,
    reviewer: { role: UserRole; name: string },
    notes?: string
  ): { suggestion: RedistributionSuggestion; feedback: FeedbackLog } => {
    const list = dbRedistributions.getAll();
    const index = list.findIndex(s => s.id === suggestionId);
    if (index === -1) {
      throw new Error(`Suggestion ${suggestionId} not found`);
    }

    const updatedSuggestion: RedistributionSuggestion = {
      ...list[index],
      status: newStatus
    };
    list[index] = updatedSuggestion;
    setItem(STORAGE_KEYS.REDISTRIBUTIONS, list);

    // If approved, update the related blood unit status to Reserved or Transferred
    if (newStatus === 'Approved' && updatedSuggestion.blood_unit_id) {
      dbBloodUnits.updateStatus(updatedSuggestion.blood_unit_id, 'Transferred');
    }

    // Append to feedback_log
    const feedback: FeedbackLog = {
      id: `fb-${Date.now()}`,
      suggestion_id: suggestionId,
      outcome: newStatus,
      reviewer_role: reviewer.role,
      reviewer_name: reviewer.name,
      logged_at: new Date().toISOString(),
      notes: notes || `Redistribution ${newStatus.toLowerCase()} by ${reviewer.name} (${reviewer.role})`
    };
    dbFeedbackLogs.add(feedback);

    // Also trigger notification
    dbNotifications.add({
      id: `notif-${Date.now()}`,
      target_role: 'all',
      title: `Redistribution ${newStatus}: ${updatedSuggestion.blood_group} ${updatedSuggestion.component_type}`,
      message: `${reviewer.name} marked suggestion #${suggestionId} as ${newStatus}. Logged in audit trail.`,
      type: newStatus === 'Approved' ? 'success' : 'info',
      timestamp: new Date().toISOString(),
      read: false,
      link_tab: 'redistribution'
    });

    return { suggestion: updatedSuggestion, feedback };
  }
};

// ----------------- FEEDBACK LOGS -----------------
export const dbFeedbackLogs = {
  getAll: (): FeedbackLog[] => getItem<FeedbackLog[]>(STORAGE_KEYS.FEEDBACK_LOGS, INITIAL_FEEDBACK_LOGS),
  add: (log: FeedbackLog): FeedbackLog => {
    const list = dbFeedbackLogs.getAll();
    list.unshift(log);
    setItem(STORAGE_KEYS.FEEDBACK_LOGS, list);
    return log;
  }
};

// ----------------- NOTIFICATIONS -----------------
export const dbNotifications = {
  getAll: (): AppNotification[] => getItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),
  getByRole: (role?: UserRole): AppNotification[] => {
    const all = dbNotifications.getAll();
    if (!role || role === 'admin') return all;
    return all.filter(n => !n.target_role || n.target_role === 'all' || n.target_role === role);
  },
  markAsRead: (id: string): void => {
    const list = dbNotifications.getAll().map(n => (n.id === id ? { ...n, read: true } : n));
    setItem(STORAGE_KEYS.NOTIFICATIONS, list);
  },
  markAllAsRead: (): void => {
    const list = dbNotifications.getAll().map(n => ({ ...n, read: true }));
    setItem(STORAGE_KEYS.NOTIFICATIONS, list);
  },
  add: (notification: AppNotification): AppNotification => {
    const list = dbNotifications.getAll();
    list.unshift(notification);
    setItem(STORAGE_KEYS.NOTIFICATIONS, list);
    return notification;
  }
};
