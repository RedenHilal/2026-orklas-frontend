import React from "react"
import { SidebarItem } from "../types/sidebar"
import { NavLink } from "react-router-dom"

interface SidebarProps {
  items: SidebarItem[]
}

const Sidebar: React.FC<SidebarProps> = ({ items }) => {
  return (
    <aside className="h-screen w-64 bg-bg text-white flex flex-col border-r border-accent/30">
      <div className="p-6 text-2xl font-bold text-accent">
        Orkla<span className="text-highlight">s</span>
      </div>

      <nav className="flex-1 px-3 space-y-2">
        {items.map((item, index) => (
          <NavLink
            key={index}
            to={item.href}
            className={({ isActive }) =>
              `
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
              hover:bg-accent/20 hover:text-accent
              ${isActive ? "bg-accent text-white shadow-md" : "text-gray-300"}
              `
            }
          >
            {item.icon && (
              <span className="text-lg">{item.icon}</span>
            )}
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-accent/30 text-sm text-gray-400">
        © 2026 Ellen
      </div>
    </aside>
  )
}

export default Sidebar

