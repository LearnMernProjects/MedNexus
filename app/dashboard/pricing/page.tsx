import React from 'react'
import { PricingTable } from '@clerk/nextjs'
const Pricing = () => {
  return (
    <div style={{maxWidth: "800px", margin: "0 auto", padding: "2rem"}}>
        <h2 className='my-10 text-center text-3xl font-bold'>Pricing</h2>
      <PricingTable/>
    </div>
  )
}

export default Pricing;
