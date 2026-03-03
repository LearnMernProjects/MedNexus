'use client'

import React from 'react'
import { useContext } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar,
  SidebarRail,
} from '@/components/ui/sidebar'
import Image from 'next/image'
import Link from 'next/link'
import {
  LayoutDashboard,
  Headphones,
  Database,
  WalletCards,
  User2Icon,
  Gem,
} from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { UserDetailContext } from '@/app/context/UserDetailContext'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/dist/client/components/navigation'

const menuOptions = [
  { title: 'Dashboard', icon: LayoutDashboard, url: '/dashboard' },
  { title: 'AI Agents', icon: Headphones, url: '/#' },
  { title: 'Data', icon: Database, url: '/#' },
  { title: 'Pricing', icon: WalletCards, url: '#' },
  { title: 'User', icon: User2Icon, url: '/#' },
]

function AppSidebar() {
  const { open } = useSidebar()
  const userDetail = useContext(UserDetailContext)
  const path= usePathname();
  const currentUser = useQuery(api.auth.getCurrentUser)
  const credits = currentUser?.token ?? userDetail?.token ?? 0
  return (
    <Sidebar
      collapsible="icon"
      style={{
        ['--sidebar' as any]: '#D1FAE5',
        ['--sidebar-foreground' as any]: '#000000',
      }}
    >
      <SidebarHeader>
        <div className="flex items-center gap-2 px-1">
         
          <Image src="/logo.svg" width={35} height={35} alt="MedNexus Logo" />
          {open && <h2 className="text-lg font-semibold text-black">MedNexus</h2>}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-semibold text-black/80">Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuOptions.map((menu) => (
                <SidebarMenuItem key={menu.title}>
                  <SidebarMenuButton
                    asChild
                    size={open ? 'lg' : 'default'}
                    isActive={path === menu.url}
                    className="font-semibold text-black hover:text-black data-[active=true]:text-black"
                  >
                    <Link href={menu.url}>
                      <menu.icon />
                      {open && <span className="font-semibold text-black">{menu.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mb-10">
        <div className="flex gap-2 items-center">
          <UserButton afterSignOutUrl="/" />
          {open && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Gem className="w-4 h-4 relative text-black" />
                <span className="font-semibold text-black">Remaining credits: {credits}</span>
              </div>
              <Button className="bg-black text-white">Upgrade to Unlimited</Button>
            </div>
          )}
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

export default AppSidebar