import { SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'
import AppSidebar from './_components/AppSidebar' // changed
import AppHeader from './_components/AppHeader'

const DashboardProvider = ({ children }: any) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full"> 
        <AppHeader/>{children}</div>
    </SidebarProvider>
  )
}

export default DashboardProvider;