import Layout from "@/components/Layout";
import AdminUsers from "./admin/AdminUsers";

/** Admin-only: managed by ProtectedRoute allowedRoles={["admin"]}. */
export default function DashboardUsers() {
  return (
    <Layout>
      <AdminUsers />
    </Layout>
  );
}
