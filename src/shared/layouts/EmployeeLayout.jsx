import { Outlet } from "react-router-dom";
import Layout from "../../employee/components/layout/Layout";

const EmployeeLayout = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default EmployeeLayout;