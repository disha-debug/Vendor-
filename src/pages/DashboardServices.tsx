import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import VendorServices from "./vendor/VendorServices";
import AdminServices from "./admin/AdminServices";

export default function DashboardServices() {
  const { role } = useAuth();

  return (
    <Layout>
      {role === "vendor" && <VendorServices />}
      {role === "admin" && <AdminServices />}
    </Layout>
  );
}
