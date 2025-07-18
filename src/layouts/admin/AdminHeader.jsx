import React from "react";

const mockUser = {
  name: "Võ Văn Việt",
  role: "Administrator",
  email: "vovviet@example.com",
  phone: "0123456789",
  avatarUrl: "https://kenh14cdn.com/2020/6/25/photo-1-15930194653111314658724.jpg",
};

export default function AdminHeader() {
  return (
    <header className="mb-1 flex flex-wrap items-center justify-between border-b-2 border-[var(--primary-dark)] pb-2">
      {/* Search Bar */}
      <div className="flex items-center space-x-2 w-full sm:w-auto mb-2 sm:mb-0">
        <input
          type="text"
          placeholder="Search..."
          className="px-3 py-1.5 border rounded-lg text-sm w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] bg-[var(--primary-dark)] text-[var(--text-primary)] border-[var(--secondary-dark)] placeholder-[var(--text-secondary)]"
        />
        <button className="bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/80 text-[var(--text-primary)] text-sm px-4 py-2 rounded-lg mt-2 sm:mt-0 transition-colors duration-200">
          Search
        </button>
      </div>

      {/* User Info and Logout Button */}
      <div className="flex items-center space-x-4">
        {/* User Info */}
        <div className="flex items-center relative group">
          <img
            src={mockUser.avatarUrl}
            alt="User Avatar"
            className="w-10 h-10 rounded-full mr-3 border-2 border-[var(--accent-color)] transform transition duration-300 ease-in-out group-hover:scale-90"
          />
          <div className="hidden group-hover:block absolute left-0 top-12 bg-[var(--secondary-dark)] shadow-lg rounded-lg p-4 w-55 text-[var(--text-primary)] z-50 transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100">
            <p className="font-bold">{mockUser.name}</p>
            <p className="text-xs text-[var(--text-secondary)]">{mockUser.role}</p>
            <p className="text-xs text-[var(--text-secondary)]">{mockUser.email}</p>
            <p className="text-xs text-[var(--text-secondary)]">{mockUser.phone}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button className="bg-[var(--primary-dark)] hover:bg-[var(--secondary-dark)] text-sm text-[var(--text-primary)] px-4 py-2 rounded transition-colors duration-200">
          Logout
        </button>
      </div>
    </header>
  );
}
