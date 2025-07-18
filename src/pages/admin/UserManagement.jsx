import ListUser from "@/components/admin/AdminUser/ListUser";

export default function UserManagement() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">User Management</h1>
      </div>
        <ListUser />
    </div>
  );
} 