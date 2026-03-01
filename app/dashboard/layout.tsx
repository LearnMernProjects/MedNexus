import React from "react";
import DashboardProvider from "./Provider";

function DashboardLayout({children}: any) {
    return (
        <DashboardProvider>{children}</DashboardProvider>
    )
}
export default DashboardLayout;