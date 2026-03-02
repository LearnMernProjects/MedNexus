import { Button } from '@base-ui/react'
import React, { useEffect, useState } from 'react'
import { Textarea } from '@/components/ui/textarea' 
import schema from '@/convex/schema'
import { toast } from 'sonner'

const EndSetting = ({updateFormData, selectedNode,selectedFormData}:any) => {
    const [formData, setFormData] = useState({schema: selectedFormData?.schema || ''})
    useEffect(()=>{
        selectedNode && setFormData(selectedNode?.data?.settings || formData)
    }, [selectedNode])
  return (
    <div>
      <h2 className='font-bold'>
        End
      </h2>
      <p className='text-gray-500 mt-1'>This is the end node. It represents the completion of the agent's workflow.</p>

    
    <div className='mt-2 space-y-2'>
    <label> oUtput </label>
    <Textarea placeholder='{name:string}' onChange={(e) =>setFormData({schema:e.target.value})}/>
</div>
<Button className='w-full mt-5' onClick={() => {updateFormData(formData); toast.success('Settings saved successfully!');}}>Save</Button>
</div>
  )
}

export default EndSetting
