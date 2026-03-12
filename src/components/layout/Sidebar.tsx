import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard,
  X,
  Shield,
  ChevronDown,
  ShoppingCart,
  TrendingUp,
  Users,
  Package,
  ClipboardList,
  CheckCircle2,
  CalendarClock,
  AlertTriangle,
  History,
  Receipt,
  RotateCcw
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

type NavItem = {
  name: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  children?: NavItem[]
}

const adminNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Wizard', href: '/wizard', icon: ShoppingCart },
  { name: 'Sales', href: '/sales', icon: TrendingUp },
  {
    name: 'Management',
    children: [
      { name: 'Customers', href: '/management/customers', icon: Users },
      { name: 'Products', href: '/management/products', icon: Package },
      { name: 'Plans', href: '/management/plans', icon: ClipboardList },
    ],
  },
  {
    name: 'Installments',
    children: [
      { name: 'Active Loans', href: '/installments/active-loans', icon: CheckCircle2 },
      { name: 'Due Calendar', href: '/installments/due-calendar', icon: CalendarClock },
      { name: 'Overdue', href: '/installments/overdue', icon: AlertTriangle },
    ],
  },
  {
    name: 'Finance',
    children: [
      { name: 'Order History', href: '/finance/order-history', icon: History },
      { name: 'Payments Log', href: '/finance/payments-log', icon: Receipt },
      { name: 'Refunds', href: '/finance/refunds', icon: RotateCcw },
    ],
  },
  { name: 'Persona Management', href: '/persona-management', icon: Shield },
]

const staffNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Wizard', href: '/wizard', icon: ShoppingCart },
  { name: 'Sales', href: '/sales', icon: TrendingUp },
  {
    name: 'Management',
    children: [
      { name: 'Customers', href: '/management/customers', icon: Users },
    ],
  },
  {
    name: 'Installments',
    children: [
      { name: 'Active Loans', href: '/installments/active-loans', icon: CheckCircle2 },
      { name: 'Due Calendar', href: '/installments/due-calendar', icon: CalendarClock },
      { name: 'Overdue', href: '/installments/overdue', icon: AlertTriangle },
    ],
  },
  {
    name: 'Finance',
    children: [
      { name: 'Order History', href: '/finance/order-history', icon: History },
      { name: 'Payments Log', href: '/finance/payments-log', icon: Receipt },
      { name: 'Refunds', href: '/finance/refunds', icon: RotateCcw },
    ],
  },
  { name: 'Persona Management', href: '/persona-management', icon: Shield },
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation()
  const { persona } = useAuth()

  // Determine navigation based on persona
  const navigation = persona?.type === 'admin' ? adminNavigation : staffNavigation

  // Track expanded/collapsed state for groups
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    ;(navigation || []).forEach((item) => {
      if (item.children && item.children.length) {
        initial[item.name] = item.children.some((c) => c.href === location.pathname)
      }
    })
    return initial
  })

  const toggleGroup = (name: string) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  // Ensure the group that contains the active route is expanded when route changes
  React.useEffect(() => {
    const activeGroup = navigation.find((item) => item.children?.some((c) => c.href === location.pathname))
    if (activeGroup) {
      setExpanded((prev) => ({ ...prev, [activeGroup.name]: true }))
    }
  }, [location.pathname])

  return (
    <>
      {/* Backdrop - shown on all screen sizes when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Installment App</h1>
              {persona && (
                <p className="text-xs text-gray-500">
                  {persona.personName || (persona.type === 'admin' ? 'Admin' : (persona.loginName || 'Staff'))} Portal
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              if (item.children && item.children.length) {
                return (
                  <div key={item.name} className="mt-2">
                    <button
                      type="button"
                      onClick={() => toggleGroup(item.name)}
                      aria-expanded={!!expanded[item.name]}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <span>{item.name}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${expanded[item.name] ? 'rotate-180' : ''}`} />
                    </button>
                    {expanded[item.name] && (
                      <div className="ml-2 mt-1 space-y-1">
                        {item.children.map((child) => {
                          const isActive = location.pathname === child.href
                          const Icon = child.icon
                          return (
                            <Link
                              key={child.name}
                              to={child.href!}
                              onClick={onClose}
                              className={`
                                flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200
                                ${isActive
                                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }
                              `}
                            >
                              {Icon && (
                                <Icon className={`
                                  h-5 w-5 mr-3 flex-shrink-0
                                  ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'}
                                `} />
                              )}
                              {child.name}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              }

              const isActive = location.pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href!}
                  onClick={onClose}
                  className={`
                    flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  {Icon && (
                    <Icon className={`
                      h-5 w-5 mr-3 flex-shrink-0
                      ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'}
                    `} />
                  )}
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}

export default Sidebar