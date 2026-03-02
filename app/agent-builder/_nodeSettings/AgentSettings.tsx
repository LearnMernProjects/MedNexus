import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectItem } from '@/components/ui/select'
import { SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useEffect } from 'react'
function AgentSetting ({selectedNode, updateFormData}: any) {
    const [formData, setFormData] = useState({
        name: selectedNode?.data?.label || '',
        instruction: selectedNode?.data?.instruction || '',
        model: selectedNode?.data?.model || 'gpt-3.5',
        outputFormat: selectedNode?.data?.outputFormat || 'Text',
        outputText: selectedNode?.data?.output || '',
        includeHistory: selectedNode?.data?.includeHistory ?? true,
        schema: selectedNode?.data?.schema || ''
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
    <div className='space-y-4'>
        <div>
          <h2 className='font-bold'>Agent</h2>
          <p className='text-muted-foreground mt-1 text-sm'>Configure your agent settings here.</p>
        </div>

        <div className='space-y-1'>
          <Label>Name</Label>
          <Input
            placeholder='Agent name'
            value={formData.name}
            
            className='bg-white'
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        <div className='space-y-1'>
          <Label>Instruction</Label>
          <Textarea
            placeholder='Agent instruction'
            onChange={(e) => handleChange('instruction', e.target.value)}
            value={formData.instruction}
            className='bg-white min-h-24'
          />
        </div>

        <div className='flex items-center justify-between'>
          <Label>Include history</Label>
          <Switch
            checked={formData.includeHistory}
            onCheckedChange={(checked) => {
              handleChange('includeHistory', checked)
            }}
          />
        </div>

        <div className='space-y-1'>
          <Label>Model</Label>
          <Select onValueChange={(value)=> handleChange('model', value)} value={formData.model}>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select model' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-3.5">GPT 3.5</SelectItem>
              <SelectItem value="gpt-4">GPT 4</SelectItem>
              <SelectItem value="custom">Custom Model</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label>Output Format</Label>
          <Tabs
            defaultValue="Text"
            onValueChange={(value) => handleChange('outputFormat', value)}
            className="w-full"
            value={formData.outputFormat}
          >
            <TabsList className='w-full grid grid-cols-2'>
              <TabsTrigger value="Text">Text</TabsTrigger>
              <TabsTrigger value="JSON">JSON</TabsTrigger>
            </TabsList>

            <TabsContent value="Text" className='mt-3 space-y-1'>
              <Label className='text-sm text-muted-foreground'>Enter Text Output Format</Label>
              <Textarea
                placeholder='Describe output format in text...'
                onChange={(event) => handleChange('outputText', event.target.value)}
                value={formData.outputText}
                className='bg-white min-h-24'
              />
            </TabsContent>

            <TabsContent value="JSON" className='mt-3 space-y-1'>
              <Label className='text-sm text-muted-foreground'>Enter Json Schema</Label>
              <Textarea
                placeholder='{title: string}'
                onChange={(event) => handleChange('schema', event.target.value)}
                value={formData.schema}
                className='bg-white min-h-24'
              />
            </TabsContent>
          </Tabs>
        </div>

        <Button onClick={onSave} className="w-full text-md bg-gray-900 hover:bg-black  text-white mt-2">Save</Button>
    </div>
  )
}

export default AgentSetting
