import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/stops', label: "Today's Stops" },
  { to: '/day-setup', label: 'Day Setup' },
  { to: '/review', label: 'Review Queue' },
  { to: '/export', label: 'Export' },
  { to: '/archive', label: 'Archive' },
  { to: '/admin', label: 'Admin' }
]

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-harvest-light">
      <header className="bg-harvest text-white px-4 py-3 shadow">
        <h1 className="text-lg font-semibold">Iskashitaa Harvest Lead App</h1>
      </header>
      <nav className="flex overflow-x-auto bg-white border-b border-gray-200 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `px-3 py-2 text-sm whitespace-nowrap border-b-2 ${
                isActive ? 'border-harvest text-harvest font-medium' : 'border-transparent text-gray-600'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <main className="flex-1 p-4 max-w-3xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
