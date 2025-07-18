import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";
import { FiPlus } from "react-icons/fi";
import ListDirectors from "@/components/admin/AdminDirectors/ListDirector";
import { canPerformAdminAction } from "../../utils/auth";

export default function Directors() {
  const canAddActor = canPerformAdminAction();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">List of Directors</h2>
        {canAddActor && (
        <Link to="/admin/directors/add">
          <Button
            type="primary"
            icon={<FiPlus />}
            className="flex items-center"
          >
            Add Director
          </Button>
        </Link>
        )}
      </div>
      
      <div className="mt-4">
        <ListDirectors />
      </div>
    </div>
  );
}
