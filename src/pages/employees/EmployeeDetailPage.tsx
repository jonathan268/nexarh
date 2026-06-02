import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import StatusBadge from '../../components/shared/StatusBadge'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { Button } from '../../components/ui/button'
import { ArrowLeft, Pencil, Mail, Phone, MapPin, Calendar, CreditCard, Hash } from 'lucide-react'
import { toast } from 'sonner'
import type { Employee } from '../../types/electron.d'

export default function EmployeeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.electronAPI.employees.getById(parseInt(id!)).then((result) => {
      if (result.success) {
        setEmployee(result.data)
      } else {
        toast.error(result.error)
      }
      setLoading(false)
    })
  }, [id])

  if (loading) return <LoadingSpinner />
  if (!employee) return <div className="text-text-secondary">Employé non trouvé</div>

  const sections = [
    {
      title: 'Identité',
      icon: Hash,
      color: 'text-primary',
      bg: 'bg-primaryLight',
      fields: [
        { label: 'Matricule', value: employee.employeeNumber },
        { label: 'Genre', value: employee.gender === 'M' ? 'Masculin' : employee.gender === 'F' ? 'Féminin' : '-' },
        { label: 'Date de naissance', value: employee.dateOfBirth || '-' },
        { label: 'N° CNI', value: employee.nationalId || '-' }
      ]
    },
    {
      title: 'Contact',
      icon: Mail,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      fields: [
        { label: 'Email', value: employee.email || '-' },
        { label: 'Téléphone', value: employee.phone || '-' },
        { label: 'Adresse', value: employee.address || '-' }
      ]
    },
    {
      title: 'Emploi',
      icon: Calendar,
      color: 'text-accent',
      bg: 'bg-accent/10',
      fields: [
        { label: "Date d'embauche", value: employee.hireDate },
        { label: "Type d'emploi", value: employee.employmentType },
        { label: 'Salaire de base', value: `${employee.baseSalary.toLocaleString()} XAF` },
        { label: 'Compte bancaire', value: employee.bankAccount || '-' }
      ]
    }
  ]

  return (
    <div>
      <PageHeader
        title={`${employee.firstName} ${employee.lastName}`}
        description={employee.employeeNumber}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/employees')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour
            </Button>
            <Button onClick={() => navigate(`/employees/${employee.id}/edit`)}>
              <Pencil className="h-4 w-4 mr-2" /> Modifier
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-3 mb-6">
        <StatusBadge status={employee.status} />
        <span className="text-sm text-text-muted">Créé le {employee.createdAt}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {sections.map((section) => (
          <div key={section.title} className="bg-white rounded-2xl border-2 border-border shadow-card p-6">
            <div className="flex items-center gap-3 pb-4 mb-4 border-b-2 border-border">
              <div className={`p-2 rounded-xl ${section.bg}`}>
                <section.icon className={`h-4 w-4 ${section.color}`} />
              </div>
              <h3 className="font-bold text-text-primary">{section.title}</h3>
            </div>
            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.label}>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">{field.label}</p>
                  <p className="text-sm font-medium text-text-primary mt-0.5">{field.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
