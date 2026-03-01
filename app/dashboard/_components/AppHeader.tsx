"use client"

import { SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'
import { UserButton } from '@clerk/nextjs'
const AppHeader = () => {
  return (
    <div className='flex justify-between items-center w-full p-4 shadow bg-sidebar'>
      <SidebarTrigger />
      <UserButton afterSignOutUrl='/' />
    </div>
  )
}

export default AppHeader
