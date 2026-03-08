import React from 'react'
import { UserProfile } from '@clerk/nextjs'

const page= () => {
  return (
    <div className='p-10'>
      <h2 className='font-bold text-2xl'>Profile</h2>
      <UserProfile routing='hash' />
    </div>
  )
}

export default page;
