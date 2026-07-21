/** Centralized route path constants conforming to SaaS platform naming hierarchy. */
export const ROUTES = {
  LOGIN: '/login',

  ADMIN: {
    BI_OVERVIEW:       '/admin/bi/overview',
    BI_PROFITABILITY:  '/admin/bi/profitability',
    BI_MISSIONS:       '/admin/bi/missions',
    BI_FLEET:          '/admin/bi/fleet',
    BI_OPERATORS:      '/admin/bi/operators',
    BI_LEAKAGE:        '/admin/bi/leakage',
    BI_RULES_ENGINE:   '/admin/bi/rules-engine',
    BI_REPORTS:        '/admin/bi/reports',
  },
} as const;
