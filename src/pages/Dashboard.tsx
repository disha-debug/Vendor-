import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import BrowseServices from "./customer/BrowseServices";
import VendorDashboard from "./vendor/VendorDashboard";
import AdminDashboard from "./admin/AdminDashboard";

/** Dashboard entry: role-based view. Auth and loading are handled by ProtectedRoute. */
export default function Dashboard() {
  const { role } = useAuth();

  return (
    <Layout>
      {role === "admin" && <AdminDashboard />}
      {role === "vendor" && <VendorDashboard />}
      {role === "customer" && <BrowseServices />}
      {!role && <p className="text-muted-foreground">No role assigned. Contact admin.</p>}
    </Layout>
  );
}
