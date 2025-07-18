import { useState } from "react";
import Infor from "./rightAccount/Infor";
import TransactionHistory from "./rightAccount/TransactionHistory";

export default function RightAccount({ user }) {
  const [activeTab, setActiveTab] = useState("infor");

  return (
    <>
      <div className="w-full bg-[var(--secondary-dark)] shadow-lg rounded-lg p-4 sm:p-6">
        <div className="border-b border-[var(--primary-dark)] pb-3 sm:pb-4 mb-3 sm:mb-4 flex overflow-x-auto sm:flex-wrap gap-2 sm:gap-4 text-[var(--text-secondary)] no-scrollbar">
          <button
            onClick={() => setActiveTab("infor")}
            className={`text-sm sm:text-base whitespace-nowrap py-1 ${
              activeTab === "infor"
                ? "border-b-2 border-[var(--accent-color)] text-[var(--text-primary)] font-medium"
                : "text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)]"
            }`}
          >
            Personal Information
          </button>
          <button
            onClick={() => setActiveTab("transaction")}
            className={`text-sm sm:text-base whitespace-nowrap py-1 ${
              activeTab === "transaction"
                ? "border-b-2 border-[var(--accent-color)] text-[var(--text-primary)] font-medium"
                : "text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)]"
            }`}
          >
            Transaction History
          </button>
          <button
            onClick={() => setActiveTab("notification")}
            className={`text-sm sm:text-base whitespace-nowrap py-1 ${
              activeTab === "notification"
                ? "border-b-2 border-[var(--accent-color)] text-[var(--text-primary)] font-medium"
                : "text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)]"
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab("gift")}
            className={`text-sm sm:text-base whitespace-nowrap py-1 ${
              activeTab === "gift"
                ? "border-b-2 border-[var(--accent-color)] text-[var(--text-primary)] font-medium"
                : "text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)]"
            }`}
          >
            Gifts
          </button>
          <button
            onClick={() => setActiveTab("policy")}
            className={`text-sm sm:text-base whitespace-nowrap py-1 ${
              activeTab === "policy"
                ? "border-b-2 border-[var(--accent-color)] text-[var(--text-primary)] font-medium"
                : "text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)]"
            }`}
          >
            Policies
          </button>
        </div>

        {/* Render nội dung tương ứng */}
        <div className="mt-2 sm:mt-4">
          {activeTab === "infor" && <Infor user={user} />}
          {activeTab === "transaction" && <TransactionHistory user={user} />}
          {activeTab === "notification" && <div className="text-[var(--text-primary)]">Notifications</div>}
          {activeTab === "gift" && <div className="text-[var(--text-primary)]">Gifts</div>}
          {activeTab === "policy" && <div className="text-[var(--text-primary)]">Policies</div>}
        </div>
      </div>
    </>
  );
}
