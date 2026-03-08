import React, { useEffect, useState } from 'react'
import { Label } from '@radix-ui/react-label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
function WhileSettings({ selectedNode, updateFormData }: any) {
    const [formData, setFormData] = useState({whileCondition: ''})
        useEffect(()=>{
            selectedNode && setFormData(selectedNode?.data?.settings || formData)
        }, [selectedNode])
  return (
    <div>
      <h2 className='font-bold'>While</h2>
      <p className='text-gray-500 mt-1'>
        Loop logic
      </p>
      <div className='mt-3'>
        <Label>While</Label>
        <Input type='text' value={formData.whileCondition} placeholder='Condition expression, e.g. {age} > 18' className=' mt-2'
        onChange={(e) => setFormData({whileCondition: e.target.value})}/>
      </div>
      <Button className='w-full mt-5' onClick={() => updateFormData({...formData, type: 'IfElse'}) && toast.success('Settings saved successfully!')}>Save</Button>    
    </div>
  )
}

export default WhileSettings
