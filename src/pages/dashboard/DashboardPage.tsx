import { useEffect, useState, useCallback, useRef } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import {
  Users,
  DollarSign,
  CalendarCheck,
  Briefcase,
  UserCheck,
  TrendingUp,
  Activity,
  Building,
  Award,
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../lib/utils';
import type { AuditEntry, PayrollPeriod } from '../../types/electron';

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingLeaves: number;
  activeContracts: number;
  activeInterns: number;
}

interface PayrollMonthInfo {
  label: string;
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
  employeeCount: number;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaves: 0,
    activeContracts: 0,
    activeInterns: 0,
  });
  const [payrollMonth, setPayrollMonth] = useState<PayrollMonthInfo | null>(
    null
  );
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [trends, setTrends] = useState<{ label: string; amount: number }[]>([]);
  const [topEmployees, setTopEmployees] = useState<
    { name: string; salary: number }[]
  >([]);
  const [departmentBreakdown, setDepartmentBreakdown] = useState<
    { name: string; count: number }[]
  >([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const loadStats = useCallback(async () => {
    const [
      empRes,
      leaveRes,
      contractRes,
      internRes,
      periodsRes,
      departmentsRes,
      auditRes,
    ] = await Promise.all([
      window.electronAPI.employees.getAll(),
      window.electronAPI.leaves.getAll({ status: 'en_attente' }),
      window.electronAPI.contracts.getAll({ status: 'actif' }),
      window.electronAPI.interns.getAll({ status: 'actif' }),
      window.electronAPI.payroll.getPeriods(),
      window.electronAPI.departments.getAll(),
      window.electronAPI.audit.getAll(),
    ]);

    const employees = empRes.success ? empRes.data : [];
    const pendingLeaves = leaveRes.success ? leaveRes.data : [];
    const contracts = contractRes.success ? contractRes.data : [];
    const interns = internRes.success ? internRes.data : [];
    const periods = periodsRes.success ? periodsRes.data : [];
    const departments = departmentsRes.success ? departmentsRes.data : [];

    setStats({
      totalEmployees: employees.length,
      activeEmployees: employees.filter((e) => e.status === 'actif').length,
      pendingLeaves: pendingLeaves.length,
      activeContracts: contracts.length,
      activeInterns: interns.length,
    });

    const currentPeriod = periods
      .filter(
        (p: PayrollPeriod) => p.status === 'brouillon' || p.status === 'valide'
      )
      .sort((a: PayrollPeriod, b: PayrollPeriod) => {
        const da = `${a.periodYear}-${String(a.periodMonth).padStart(2, '0')}`;
        const db = `${b.periodYear}-${String(b.periodMonth).padStart(2, '0')}`;
        return db.localeCompare(da);
      })[0];

    if (currentPeriod) {
      const payslipsRes = await window.electronAPI.payroll.getPayslips(
        currentPeriod.id
      );
      const months = [
        'Janvier',
        'Février',
        'Mars',
        'Avril',
        'Mai',
        'Juin',
        'Juillet',
        'Août',
        'Septembre',
        'Octobre',
        'Novembre',
        'Décembre',
      ];
      setPayrollMonth({
        label: `${months[currentPeriod.periodMonth - 1]} ${currentPeriod.periodYear}`,
        totalGross: currentPeriod.totalGross,
        totalNet: currentPeriod.totalNet,
        totalDeductions: currentPeriod.totalDeductions,
        employeeCount: payslipsRes.success ? payslipsRes.data.length : 0,
      });
    } else {
      setPayrollMonth(null);
    }

    const validatedPeriods = periods
      .filter(
        (p: PayrollPeriod) => p.status === 'valide' || p.status === 'paye'
      )
      .sort((a: PayrollPeriod, b: PayrollPeriod) => {
        const da = `${a.periodYear}-${String(a.periodMonth).padStart(2, '0')}`;
        const db = `${b.periodYear}-${String(b.periodMonth).padStart(2, '0')}`;
        return da.localeCompare(db);
      })
      .slice(-6);

    setTrends(
      validatedPeriods.map((p: PayrollPeriod) => {
        const months = [
          'Jan',
          'Fév',
          'Mar',
          'Avr',
          'Mai',
          'Juin',
          'Juil',
          'Aoû',
          'Sep',
          'Oct',
          'Nov',
          'Déc',
        ];
        return {
          label: months[p.periodMonth - 1] || `${p.periodMonth}`,
          amount: p.totalNet,
        };
      })
    );

    setTopEmployees(
      [...employees]
        .sort((a, b) => b.baseSalary - a.baseSalary)
        .slice(0, 3)
        .map((e) => ({
          name: `${e.firstName} ${e.lastName}`,
          salary: e.baseSalary,
        }))
    );

    setDepartmentBreakdown(
      departments
        .map((d) => ({
          name: d.name,
          count: employees.filter((e) => e.departmentId === d.id).length,
        }))
        .filter((d) => d.count > 0)
        .sort((a, b) => b.count - a.count)
    );

    if (auditRes.success) setAuditEntries(auditRes.data.slice(0, 3));

    setLoading(false);
  }, []);

  useEffect(() => {
    loadStats();
    intervalRef.current = setInterval(loadStats, 30000);
    return () => clearInterval(intervalRef.current);
  }, [loadStats]);

  if (loading) return <LoadingSpinner />;

  const maxTrend =
    trends.length > 0 ? Math.max(...trends.map((t) => t.amount)) : 0;

  const auditIcons: Record<string, string> = {
    Création: '＋',
    Modification: '✎',
    Suppression: '✕',
    Lancement: '▶',
    Validation: '✓',
    Résiliation: '⊘',
    Approbation: '↑',
    Rejet: '↓',
  };
  const auditColors: Record<string, string> = {
    Création: 'bg-green-100 text-green-600',
    Modification: 'bg-blue-100 text-blue-600',
    Suppression: 'bg-red-100 text-red-600',
    Lancement: 'bg-purple-100 text-purple-600',
    Validation: 'bg-teal-100 text-teal-600',
    Résiliation: 'bg-orange-100 text-orange-600',
    Approbation: 'bg-emerald-100 text-emerald-600',
    Rejet: 'bg-rose-100 text-rose-600',
  };

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de votre entreprise"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {(
          [
            {
              title: 'Effectif total',
              value: stats.totalEmployees,
              subtext: `${stats.activeEmployees} actifs`,
              icon: Users,
              gradient: 'from-primary to-secondary',
            },
            {
              title: 'Congés en attente',
              value: stats.pendingLeaves,
              subtext: 'À valider',
              icon: CalendarCheck,
              gradient: 'from-accent to-orange-400',
            },
            {
              title: 'Contrats actifs',
              value: stats.activeContracts,
              subtext: 'En cours',
              icon: Briefcase,
              gradient: 'from-blue-500 to-blue-400',
            },
            {
              title: 'Stagiaires actifs',
              value: stats.activeInterns,
              subtext: 'En stage',
              icon: UserCheck,
              gradient: 'from-purple-500 to-purple-400',
            },
          ] as const
        ).map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-2xl border-2 border-border shadow-card p-6 hover:shadow-elevated transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-secondary">
                  {card.title}
                </p>
                <p className="text-3xl font-extrabold text-text-primary mt-2">
                  {card.value}
                </p>
                <p className="text-xs text-text-muted mt-1">{card.subtext}</p>
              </div>
              <div
                className={`p-4 rounded-2xl bg-gradient-to-br ${card.gradient} shadow-sm`}
              >
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <div className="bg-white rounded-2xl border-2 border-border shadow-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-accent/10">
              <DollarSign className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary">Paie du mois</h3>
              <p className="text-xs text-text-muted">
                {payrollMonth?.label || 'Aucune période en cours'}
              </p>
            </div>
          </div>
          {payrollMonth ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-text-muted font-medium uppercase">
                  Brut total
                </p>
                <p className="text-xl font-bold text-text-primary mt-1">
                  {formatCurrency(payrollMonth.totalGross)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-text-muted font-medium uppercase">
                  Net total
                </p>
                <p className="text-xl font-bold text-green-600 mt-1">
                  {formatCurrency(payrollMonth.totalNet)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-text-muted font-medium uppercase">
                  Déductions
                </p>
                <p className="text-xl font-bold text-red-500 mt-1">
                  {formatCurrency(payrollMonth.totalDeductions)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-text-muted font-medium uppercase">
                  Employés
                </p>
                <p className="text-xl font-bold text-text-primary mt-1">
                  {payrollMonth.employeeCount}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-text-muted text-sm">
              Lancez votre première période de paie
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border-2 border-border shadow-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-primaryLight">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary">Activité récente</h3>
              <p className="text-xs text-text-muted">Dernières actions</p>
            </div>
          </div>
          {auditEntries.length > 0 ? (
            <div className="space-y-3">
              {auditEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${auditColors[entry.action] || 'bg-gray-100 text-gray-600'}`}
                  >
                    {auditIcons[entry.action] || '○'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {entry.action} — {entry.entityType}
                    </p>
                    {entry.details && (
                      <p className="text-xs text-text-muted truncate">
                        {entry.details}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {formatDate(entry.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-text-muted text-sm">
              Les données apparaîtront ici après les premières actions
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-border shadow-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-blue-50">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary">
                Évolution de la masse salariale
              </h3>
              <p className="text-xs text-text-muted">
                Net total des 6 dernières périodes validées
              </p>
            </div>
          </div>
          {trends.length > 0 ? (
            <div className="flex items-end gap-3 h-48 pt-4">
              {trends.map((item, i) => {
                const height =
                  maxTrend > 0 ? (item.amount / maxTrend) * 100 : 0;
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                  >
                    <span className="text-xs font-semibold text-text-muted">
                      {(item.amount / 1000).toFixed(0)}k
                    </span>
                    <div
                      className="w-full rounded-lg bg-gradient-to-t from-primary to-secondary transition-all duration-500"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <span className="text-xs font-medium text-text-muted">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-text-muted text-sm">
              Validez une période de paie pour voir les tendances
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border-2 border-border shadow-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-amber-50">
              <Award className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary">Top 3 salaires</h3>
              <p className="text-xs text-text-muted">
                Employés les mieux payés
              </p>
            </div>
          </div>
          {topEmployees.length > 0 ? (
            <div className="space-y-3">
              {topEmployees.map((emp, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-amber-700'}`}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {emp.name}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-text-primary">
                    {formatCurrency(emp.salary)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-text-muted text-sm">
              Aucun employé
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border-2 border-border shadow-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-indigo-50">
            <Building className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-text-primary">
              Répartition par département
            </h3>
            <p className="text-xs text-text-muted">Effectifs par département</p>
          </div>
        </div>
        {departmentBreakdown.length > 0 ? (
          <div className="space-y-4">
            {departmentBreakdown.map((dept) => {
              const maxCount = Math.max(
                ...departmentBreakdown.map((d) => d.count)
              );
              return (
                <div key={dept.name} className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-text-primary w-48 truncate">
                    {dept.name}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                      style={{
                        width: `${maxCount > 0 ? (dept.count / maxCount) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-text-primary w-8 text-right">
                    {dept.count}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-text-muted text-sm">
            Aucun département
          </div>
        )}
      </div>
    </div>
  );
}
