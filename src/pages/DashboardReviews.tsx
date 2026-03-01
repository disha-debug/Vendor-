import Layout from "@/components/Layout";
import AdminReviews from "./admin/AdminReviews";

/** Admin-only: managed by ProtectedRoute allowedRoles={["admin"]}. */
export default function DashboardReviews() {
  return (
    <Layout>
      <AdminReviews />
    </Layout>
  );
}
