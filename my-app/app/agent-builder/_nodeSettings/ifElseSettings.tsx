import { Label } from '@radix-ui/react-label'
import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

function IfElseSettings({ selectedNode, updateFormData }: any) {
  const [formData, setFormData] = useState({ifCondition: '', elseCondition: ''})
        useEffect(()=>{
            selectedNode && setFormData(selectedNode?.data?.settings || formData)
        }, [selectedNode])
  return (
    <div>
      <h2 className='font-bold'>If/Else</h2>
      <p className='text-gray-500 mt-1'>
        Create conditions to branch your workflow
      </p>
      <div className='mt-3'>
        <Label>If</Label>
        <Input type='text' value={formData.ifCondition} placeholder='Condition expression, e.g. {age} > 18' className=' mt-2'
        onChange={(e) => setFormData((prev) => ({...prev, ifCondition: e.target.value}))}/>
      </div>
      <div className='mt-3'>
        <Label>Else</Label>
        <Input type='text' value={formData.elseCondition} placeholder='Optional fallback condition or note' className=' mt-2'
        onChange={(e) => setFormData((prev) => ({...prev, elseCondition: e.target.value}))}/>
      </div>
      <Button className='w-full mt-5' onClick={() => updateFormData(formData) && toast.success('Settings saved successfully!')}>Save</Button>    
    </div>
  )
}

export default IfElseSettings;
