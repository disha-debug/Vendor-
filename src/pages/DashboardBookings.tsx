import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import MyBookings from "./customer/MyBookings";
import VendorBookings from "./vendor/VendorBookings";
import AdminBookings from "./admin/AdminBookings";

export default function DashboardBookings() {
  const { role } = useAuth();

  return (
    <Layout>
      {role === "customer" && <MyBookings />}
      {role === "vendor" && <VendorBookings />}
      {role === "admin" && <AdminBookings />}
    </Layout>
  );
}
