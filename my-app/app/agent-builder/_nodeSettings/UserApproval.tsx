import React, { useEffect } from 'react'
import { useState } from 'react';
import { Input } from '@/components/ui/input'
import { Label } from '@radix-ui/react-label'
import { Textarea } from '@/components/ui/textarea'
import { Button }    from '@/components/ui/button'
import { toast } from 'sonner'
function UserApproval({selectedNode, updateFormData}: any   ) {
    const [formData, setFormData] = useState({
        name: selectedNode?.data?.label || '',
        message: ''
      });
      useEffect(()=>{
        selectedNode && setFormData(selectedNode?.data?.settings || formData)
      }, [selectedNode])
            const handleChange = (key: string, value: any) => {
        setFormData((prev) => ({
          ...prev,
          [key]: value
        }))
          
      }
      const onSave = () => {
        // Save logic here, e.g., send formData to backend or update state
        console.log(formData);
        updateFormData(formData);
        toast.success('Agent settings saved successfully!');
      }
  return (
    <div>
      <h2 className='font-bold'>User Approval</h2>
      <p className='text-gray-500 mt-1'>This node will pause the agent's workflow and wait for user approval before proceeding.</p>
        <div className='space-y-1'>
          <Label>Name</Label>
          <Input
            placeholder='Name'
            value={formData.name}
            
            className='bg-white'
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        <div className='space-y-1'>
          <Label>Message</Label>
          <Textarea
            placeholder='Message to show user'
            onChange={(e) => handleChange('message', e.target.value)}
            value={formData.message}
            className='bg-white min-h-24'
          />
            <Label>Name</Label>
          <Input
            placeholder='Agent Name'
            value={formData?.name}
            
            className='bg-white'
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>
        <Button className='w-full mt-5' onClick={onSave}>Save</Button>
    </div>
  )
}

export default UserApproval
