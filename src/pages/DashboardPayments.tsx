import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import CustomerPayments from "./customer/CustomerPayments";
import VendorEarnings from "./vendor/VendorEarnings";
import AdminPayments from "./admin/AdminPayments";

export default function DashboardPayments() {
  const { role } = useAuth();

  return (
    <Layout>
      {role === "customer" && <CustomerPayments />}
      {role === "vendor" && <VendorEarnings />}
      {role === "admin" && <AdminPayments />}
    </Layout>
  );
}
