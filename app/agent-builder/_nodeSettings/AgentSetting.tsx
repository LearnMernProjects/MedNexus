import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectItem } from '@/components/ui/select'
import { SelectContent, SelectTrigger } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import schema from '@/convex/schema'

function AgentSetting ({selectedNode}: any) {
    const [formData, setFormData] = useState({
        name: selectedNode?.data?.label || '',
        instruction: selectedNode?.data?.instruction || '',
        model: selectedNode?.data?.model || 'gpt-3.5',
        output: selectedNode?.data?.outmat || 'text',
        includeHistory: selectedNode?.data?.includeHistory || true,
        schema: selectedNode?.data?.schema || ''
      });
      const handleChange = (key: string, value: any) => {
        setFormData((prev) => ({
          ...prev,
          [key]: value
        }))
          
      }
      const onSave = () => {
        // Save logic here, e.g., send formData to backend or update state
        console.log(formData);
      }
  return (
    <div>
     <h2 className='font-bold'>Agent</h2>
        <p className='text-gray-599 mt-1'>Configure your agent settings here.</p>
<div className='mt-3 space-y-1'>
    <Label> name</Label>
    <Input placeholder='Agent name' value={selectedNode?.data?.label} className='bg-white' onChange={(e) => handleChange('name', e.target.value)}/>

</div>
<div className='mt-3 space-y-1'>
    <Label> Instruction</Label>
    <Textarea placeholder='Agent instruction' onChange={(e) => handleChange('instruction', e.target.value)} value={selectedNode?.data?.instruction} className='bg-white'/>
    <h2 className='text-sm p-1 flex gap-2 items-center'>
        
    </h2>
</div>
<div className='mt-3 flex justify-between items-center'>
    <Label>Include history</Label>
    <Switch checked={true} onCheckedChange={(checked) => {
        handleChange('includeHistory', checked)    
    }} />
</div>
<div className='mt-3 flex justify-between items-center'>
<Label>Model</Label>
<Select onValueChange={(value)=> handleChange('model', value)} defaultValue={selectedNode?.data?.model || 'gpt-3.5'}>
    <SelectTrigger>
        <SelectContent>
            <SelectItem value="gpt-3.5">GPT 3.5</SelectItem>
            <SelectItem value="gpt-4">GPT 4</SelectItem>
            <SelectItem value="custom">Custom Model</SelectItem>
        </SelectContent>
    </SelectTrigger>
</Select>
</div>
<div className='mt-3 space-y-2'>
<Label>
    Output Format
    <Tabs defaultValue="Text" onValueChange ={(value) => handleChange('output', value)} className="w-full" value={selectedNode?.data?.outputFormat}>
  <TabsList>
    <TabsTrigger value="Text">Text</TabsTrigger>
    <TabsTrigger value="JSON">JSON</TabsTrigger>
  </TabsList>
  <TabsContent value="Text"><h2 className='text-sm text-gray-500'>
    Output will be text</h2></TabsContent>
  <TabsContent value="JSON">
    <Label className='text-sm text-gray-500'>
        Enter Json Schema </Label>
        <Textarea placeholder='{title: string}' onChange={(event) => handleChange('schema', event.target.value)} value={selectedNode?.data?.outputFormat} className='bg-white max-w-[300px] mt-1'/></TabsContent>
</Tabs>
</Label>

</div>
<Button onClick={onSave} className="w-full mt-5">Save</Button>
    </div>
   
  )
}

export default AgentSetting
