import { Label } from '@radix-ui/react-label'
import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

function IfElseSettings({ selectedNode, updateFormData }: any) {
    const [formData, setFormData] = useState({ifCondition: ''})
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
        onChange={(e) => setFormData({ifCondition: e.target.value})}/>
      </div>
      <Button className='w-full mt-5' onClick={() => updateFormData({...formData, type: 'IfElse'}) && toast.success('Settings saved successfully!')}>Save</Button>    
    </div>
  )
}

export default IfElseSettings;
