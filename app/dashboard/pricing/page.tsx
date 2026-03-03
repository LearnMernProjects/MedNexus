import React from 'react'
import { PricingTable } from '@clerk/nextjs'
const Pricing = () => {
  return (
    <div style={{maxWidth: "800px", margin: "0 auto", padding: "2rem"}}>
      <PricingTable/>
    </div>
  )
}

export default Pricing;
