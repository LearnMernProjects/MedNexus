'use client'

import React, { useEffect, useContext } from 'react'
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
import { UserButton, useAuth } from '@clerk/nextjs'
import { UserDetailContext } from '@/app/context/UserDetailContext'
import { useQuery, useConvex } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'

const menuOptions = [
  { title: 'Dashboard', icon: LayoutDashboard, url: '/dashboard' },
  { title: 'AI Agents', icon: Headphones, url: '/dashboard/my-agents' },
  { title: 'Data', icon: Database, url: '/dashboard/data' },
  { title: 'Pricing', icon: WalletCards, url: '/dashboard/pricing' },
  { title: 'Profile', icon: User2Icon, url: '/dashboard/profile' },
]

function AppSidebar() {
  const { open } = useSidebar()
  const userDetail = useContext(UserDetailContext)
  const path = usePathname()
  const convex = useConvex()

  const currentUser = useQuery(api.auth.getCurrentUser)
  const credits = currentUser?.token ?? userDetail?.token ?? 0

  const { has } = useAuth()
  const isPaidUser = has?.({ plan: 'create_unlimited_agent' })

  useEffect(() => {
    if (!isPaidUser && userDetail?._id) {
      GetUserAgent()
    }
  }, [isPaidUser, userDetail])

  const GetUserAgent = async () => {
    try {
      const result = await convex.query(api.agent.getUserAgents, {
        userId: userDetail?._id as any,
      });
      console.log(result)
    } catch (error) {
      console.error(error)
    }
  }

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
          {open && (
            <h2 className="text-lg font-semibold text-black">MedNexus</h2>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-semibold text-black/80">
            Application
          </SidebarGroupLabel>
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
                      {open && (
                        <span className="font-semibold text-black">
                          {menu.title}
                        </span>
                      )}
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
          {isPaidUser ? (
            <div>
              <h2 className="text-black font-semibold">
                You can create unlimited agents
              </h2>
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Gem className="w-4 h-4 text-black" />
                <span className="font-semibold text-black">
                  Remaining credits: {credits}/2
                  
                </span>
              </div>
              {open && (
                <Button className="bg-black mt-2 text-white">
                  Upgrade to Unlimited
                </Button>
              )}
            </div>
          )}
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

export default AppSidebar