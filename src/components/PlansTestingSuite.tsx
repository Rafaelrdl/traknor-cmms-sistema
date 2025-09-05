import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } f
  CheckCircle, 
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertCircle, 
  Settings,
  Wrench
import {
import { us
import { ge

  id: st
  description: string;
import { toast } from 'sonner';
import { PlanFormModal } from '@/components/PlanFormModal';
import { useCompanies, useSectors, useEquipment } from '@/hooks/useDataTemp';
import { useMaintenancePlansNew } from '@/hooks/useMaintenancePlans';
import { generateWorkOrdersFromPlan } from '@/data/workOrdersStore';
import type { MaintenancePlan } from '@/models/plan';

interface TestCase {
  id: string;
  name: string;
  description: string;
  expectedResult: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  result?: string;
  error?: string;
}

  
  const [currentTes
  const [testResul
  // Test scenarios to va
    {
      equipmentCount: 2,
 

      equipmentCount: 3,
      expectedWorkOrders: 3
    {
      equipmentCount: 1,
      expectedWorkOrders: 1
  
  const initialTestCases: TestCase[] = [
      id: 'test-01',
      description: 'Verificar se ao selecionar uma empresa, ap
      status: 'pending'

      name: 'Filtrar equipament
      expectedResult: 'Equipamentos filtr
    }
      id: 'test-03',
      description: 'Perm
      status: 'pending'
    {
      
     
    },
      id: 'test-05',
      description: 'Gerar orden
      status: 'pending'
    {
     
      expectedResult: 'Data de próxim
    }

    setTestResults(initialT

    

        if (!techCorpCompany) throw new 
     
        const filter
        if (filteredEquipment.length === 0) {
        }
        // Validate that equipment belongs to the right sectors
          techCorpSecto

     

      }
      // Test 2: Equipment filtering by sector  
        const adminSector = sectors.find(s => s.name === 'Setor Admini

      
     

      }
      return false;
      console.error(`Erro no teste ${testId}:`, error);
    }

    t
      // For now, we
      
      const emptyFormData = {
        frequency: '',
          location_id: 
      

      const hasNameV
      const hasLocationValidation = !e

    } catch (error) {
      return false;
  };
  con
      // Find or cre
        p.scope.equipment_ids && p.scop

        throw new Error('Nenhum plano ativo encontrado para teste');

     
    

      
      if (workOrders.length !== equip
      }

        workOrders.some(wo => wo.equipmentId === equipId)

        throw new Error('Nem todos os equipamen

    } catch (error) {
      return false;

  const runSingleTest = async (testCase: TestCase): Promise<TestCase> => {
    setTestResults(prev => prev.map(tc => tc.id === testC
    try {
      le
      switch (testCase.id) {
        case 'test-02':
         

          // Test multiple equipment selection
            p.scope.equipment_ids && p.scope.equipment_ids.leng
          success = multiEquipmentPlans.length > 0;
          

        case 'test-04':
          result = success ? 'Validações estão implementadas' : 'Validações não f


          break;
       

          result = success 
            : 'Nenhum plano com g

          success = false;

      return {
        
        error: success ? undefined : result

      ret

        error: (erro
    }

    setIsRunningTes

      for (const testCase of testResults) {
        setTestResu
     
    

      
      toa
    } finally {
    }

    se
  };
  const createTestPlan = () =
    setIsTestModa

    setPlans(cur
  };
  const getStatusIcon = (st
      cas
      ca

      default:
    }

    const variants = {
      running: 'default', 


      <Badge variant=
        {status === 'running' && 'Executando'}
        {status ===
    )


    failed: testResults.filter(t => t.status === 'failed').length,
  };
  return (
      <Card>
          <CardTitle className="flex items-center gap-2">
            Suite de Testes - Planos com Múltiplo

          <Alert>
            <AlertTitle>Sobre os Testes</AlertTitle>
       


            <div className="bg-blue-50
              <div className="text-sm text-blue-800">Tota
       

            <div className="b
              <div className="text-sm text-red-800">Reprovados
      
              <div className="text-sm text-gra
          </div>
          <div className="flex flex-wrap gap-3">
       

              <Play className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={resetTests
        

              <Wrench className="
            </Button>
       

        <CardHeade
        </CardHeader>
          <div className="space-y-4">
              <div 
     
    

                    {getStatusBadge(test.status)}
                  <Button 
                    size="sm"

         
                </div>
                <p cla

                    <strong>
                  {test
                      <
                  )}
                    <div className="text-red-600 mt-1">
                

            ))}
        </CardContent>

        <CardHeader>
            
          </CardTitle>
        <CardContent classN
            <h4 className="font-medium mb-2">Empresas ({companies.length})</h4>
              {companies.map(company => (
                

          </div>
          <div>
            <ul className="text-sm space-y-1">
                

            </ul>
          
            <h4 className="font-medium mb-2">Equipamentos ({equipment.length})</h4>
              {e

              ))}
                <li className="text-muted-f
                </li>
            </ul>
        </CardContent>

        open={isTestModalOpen}
        plan={cu

  );









































































































































































































































































