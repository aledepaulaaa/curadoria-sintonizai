'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {  FileUp, CheckCircle2, AlertTriangle, Loader2, Check } from 'lucide-react';
import * as XLSX from 'xlsx';
import { criarEventosBatch, listarEventos } from '@/src/actions/eventos/eventosActions';
import Pagination from '../common/Pagination';

export default function ImportManager() {
  const [pendingItems, setPendingItems] = React.useState<any[]>([]);
  const [existingNames, setExistingNames] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(false);
  const [stats, setStats] = React.useState({ total: 0, duplicados: 0, novos: 0 });
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());
  const [pagina, setPagina] = React.useState(0);
  const itensPorPagina = 10;

  // Carrega nomes existentes para check rápido
  React.useEffect(() => {
    listarEventos().then(eventos => {
      const names = new Set(eventos.map(e => `${e.nome}_${e.dataInicio?.split('T')[0]}`));
      setExistingNames(names);
    });
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = async (evt) => {
      try {
        let rawData: any[] = [];
        if (file.name.endsWith('.json')) {
          rawData = JSON.parse(evt.target?.result as string);
        } else {
          const workbook = XLSX.read(evt.target?.result, { type: 'binary' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          rawData = XLSX.utils.sheet_to_json(sheet);
        }

        const normalized = rawData.map((item, index) => {
          const dataISO = normalizarData(item.dataInicio || item.data);
          const key = `${item.nome}_${dataISO}`;
          return {
            ...item,
            _id: index,
            _status: existingNames.has(key) ? 'duplicado' : 'novo',
            dataInicio: dataISO
          };
        });

        setPendingItems(normalized);
        const duplicados = normalized.filter(i => i._status === 'duplicado').length;
        setStats({ 
          total: normalized.length, 
          duplicados, 
          novos: normalized.length - duplicados 
        });
      } catch (err) {
        alert('Erro ao processar arquivo: ' + err);
      } finally {
        setLoading(false);
      }
    };

    if (file.name.endsWith('.json')) reader.readAsText(file);
    else reader.readAsBinaryString(file);
  };

  const normalizarData = (dStr: string) => {
    if (!dStr) return '';
    if (dStr.includes('/')) {
      const parts = dStr.split('/');
      if (parts.length === 3) {
        return `${parts[2].padStart(4, '20')}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    return dStr.split('T')[0];
  };

  const handleImport = async () => {
    const toImport = pendingItems
      .filter(i => i._status === 'novo' || selectedIds.has(i._id))
      .map(i => {
        // Remove campos internos do preview
        const { _id, _status, ...clean } = i;
        // Mapeamento final para o modelo Evento
        return {
          nome: clean.nome || 'Sem Nome',
          descricao: clean.descricao || '',
          horario: clean.horario || '20:00',
          dataInicio: clean.dataInicio,
          local: {
            nome: clean.local_nome || clean.local?.nome || 'Local não informado',
            lat: clean.local?.lat || -23.5505,
            lng: clean.local?.lng || -46.6333
          },
          categoria: clean.categoria || clean.tipo_evento || 'Outros',
          vibe: clean.vibe || 'Cultural',
          bombando: false,
          aoVivo: false,
          likes: 0,
          gratuito: clean.gratuito === 'Sim' || clean.gratuito === true,
          preco: clean.preco,
          linkIngresso: clean.linkIngresso,
          endereco: clean.endereco
        } as any;
      });

    if (toImport.length === 0) return;

    setLoading(true);
    try {
      const count = await criarEventosBatch(toImport);
      alert(`${count} eventos importados com sucesso!`);
      setPendingItems([]);
    } catch (err) {
      alert('Erro na importação: ' + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dropzone / Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center">
        <input type="file" id="import-file" className="hidden" onChange={handleFileUpload} accept=".json,.csv,.xlsx" />
        <label htmlFor="import-file" className="cursor-pointer flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center">
            <FileUp size={32} />
          </div>
          <div>
            <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-wider">Importação de Lote</h3>
            <p className="text-sm text-zinc-500 mt-1">Clique para selecionar arquivos .json, .csv ou .xlsx</p>
          </div>
        </label>
      </div>

      {pendingItems.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
               <p className="text-xs text-zinc-500 uppercase font-black tracking-widest">Total Encontrado</p>
               <p className="text-2xl font-black text-zinc-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-500/10 rounded-2xl border border-orange-100 dark:border-orange-500/20">
               <p className="text-xs text-orange-500 uppercase font-black tracking-widest">Já Existem (Duplicados)</p>
               <p className="text-2xl font-black text-orange-600 dark:text-orange-400">{stats.duplicados}</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-500/10 rounded-2xl border border-green-100 dark:border-green-500/20">
               <p className="text-xs text-green-500 uppercase font-black tracking-widest">Novos para Adicionar</p>
               <p className="text-2xl font-black text-green-600 dark:text-green-400">{stats.novos}</p>
            </div>
          </div>

          {/* Table Preview */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">
                    <th className="px-4 py-4 w-10"></th>
                    <th className="px-4 py-4">Evento</th>
                    <th className="px-4 py-4">Data/Hora</th>
                    <th className="px-4 py-4">Local</th>
                    <th className="px-4 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {pendingItems.slice(pagina * itensPorPagina, (pagina + 1) * itensPorPagina).map((item) => (
                    <tr key={item._id} className={`group ${item._status === 'duplicado' ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                      <td className="px-4 py-3">
                         <input 
                           type="checkbox" 
                           checked={item._status === 'novo' || selectedIds.has(item._id)} 
                           onChange={(e) => {
                              const newSet = new Set(selectedIds);
                              if (e.target.checked) newSet.add(item._id);
                              else newSet.delete(item._id);
                              setSelectedIds(newSet);
                           }}
                           className="w-4 h-4 accent-purple-600"
                         />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-zinc-900 dark:text-white truncate max-w-[200px]">{item.nome}</p>
                        <p className="text-[10px] text-zinc-500 truncate max-w-[200px]">{item.categoria}</p>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium">
                        {item.dataInicio} <span className="text-zinc-400">@{item.horario}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500 truncate max-w-[150px]">
                        {item.local_nome || item.local?.nome}
                      </td>
                      <td className="px-4 py-3">
                        {item._status === 'duplicado' ? (
                          <div className="flex items-center gap-1 text-orange-500 font-black text-[10px] uppercase">
                            <AlertTriangle size={12} /> Existe
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-green-500 font-black text-[10px] uppercase">
                            <CheckCircle2 size={12} /> Novo
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination 
            pagina={pagina} 
            totalPaginas={Math.ceil(pendingItems.length / itensPorPagina)} 
            onPaginaChange={setPagina} 
          />

          {/* Footer Actions */}
          <div className="flex justify-between items-center bg-zinc-900 text-white p-6 rounded-3xl shadow-2xl shadow-purple-500/10">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-zinc-400 font-black uppercase tracking-widest">Preparado para Importar</span>
                <span className="text-xl font-black">{stats.novos + selectedIds.size} itens selecionados</span>
              </div>
            </div>
            <div className="flex gap-3">
               <button onClick={() => setPendingItems([])} className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-sm font-bold rounded-xl transition-colors">
                  Cancelar
               </button>
               <button 
                 onClick={handleImport}
                 disabled={loading || (stats.novos === 0 && selectedIds.size === 0)}
                 className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-sm font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2 disabled:opacity-50"
               >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  Confirmar Importação
               </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
