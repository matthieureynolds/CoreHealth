import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { OPENAI_API_KEY, HealthAssistantService } from '../../../shared/services/ai/healthAssistantService';
import { supabase } from '../../../shared/config/supabase';
import type { ChatMessage } from '../types';

interface UseMediaInputParams {
  profile: any;
  biomarkers: any;
  healthScore: any;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setIsLoading: (v: boolean) => void;
  generateId: (prefix: string) => string;
  stripEmojis: (input: string) => string;
}

export function useMediaInput({
  profile, biomarkers, healthScore,
  setMessages, setIsLoading, generateId, stripEmojis,
}: UseMediaInputParams) {
  const [showImageInputModal, setShowImageInputModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [imageInputText, setImageInputText] = useState('');

  const handleImageInput = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.7, base64: true });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0]); setImageInputText(''); setShowImageInputModal(true);
    }
  };

  const sendImageWithText = async () => {
    if (!selectedImage) return;
    setIsLoading(true); setShowImageInputModal(false);
    try {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: imageInputText.trim() || '[Image]', timestamp: new Date(), imageUri: selectedImage.uri }]);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are a friendly, highly knowledgeable health researcher (PhD-level) who can analyze images and answer health-related questions.' },
            { role: 'user', content: [{ type: 'text', text: imageInputText.trim() || 'Please analyze this image and provide any relevant health insights or descriptions.' }, { type: 'image_url', image_url: { url: `data:${selectedImage.mimeType || 'image/jpeg'};base64,${selectedImage.base64}` } }] },
          ],
          max_tokens: 800,
        }),
      });
      if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
      const data = await response.json();
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: stripEmojis(data.choices[0]?.message?.content || '[No analysis returned]'), timestamp: new Date() }]);
    } catch (error) {
      console.error('Error analyzing image:', error); Alert.alert('Error', 'Failed to analyze image.');
    } finally { setIsLoading(false); setSelectedImage(null); setImageInputText(''); }
  };

  const handleDocumentInput = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setIsLoading(true);
      try {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: asset.name || '[Document]', timestamp: new Date(), documentName: asset.name, documentUri: asset.uri }]);
        let aiContent = '[No analysis returned]';
        if (asset.mimeType && asset.mimeType.startsWith('image/')) {
          const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' });
          const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` }, body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'system', content: 'You are a friendly, highly knowledgeable health researcher (PhD-level) who can analyze images and answer health-related questions.' }, { role: 'user', content: [{ type: 'text', text: 'Please analyze this image and provide any relevant health insights or descriptions.' }, { type: 'image_url', image_url: { url: `data:${asset.mimeType || 'image/jpeg'};base64,${base64}` } }] }], max_tokens: 800 }) });
          if (response.ok) { const data = await response.json(); aiContent = stripEmojis(data.choices[0]?.message?.content || '[No analysis returned]'); }
        } else if (asset.mimeType === 'application/pdf') {
          try {
            const pdfText = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'utf8' });
            if (pdfText.length >= 100) { const aiResponse = await HealthAssistantService.chatWithAssistant(`Please analyze this PDF document and provide health insights: ${pdfText.substring(0, 4000)}`, undefined, { profile, biomarkers, healthScore }); aiContent = stripEmojis(aiResponse); }
            else { aiContent = "I received your PDF but couldn't extract readable text from it — this can happen with scanned or encrypted PDFs. You could try sharing the key information as text instead, or I can help answer questions based on what you tell me about it."; }
          } catch { aiContent = "I received your PDF but had trouble reading it. You could try sharing the key information as text instead."; }
        }
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: stripEmojis(aiContent), timestamp: new Date() }]);
      } catch (error) { console.error('Error analyzing document:', error); Alert.alert('Error', 'Failed to analyze document.'); }
      finally { setIsLoading(false); }
    }
  };

  return {
    showImageInputModal, setShowImageInputModal,
    selectedImage, imageInputText, setImageInputText,
    handleImageInput, sendImageWithText, handleDocumentInput,
  };
}

// Plan and timeline history loading
interface UsePlanHistoryParams {
  setPlanHistory: (v: any[]) => void;
  setShowPlanHistory: (v: boolean) => void;
  setPlanHistoryLoading: (v: boolean) => void;
  setTimelineHistory: (v: any[]) => void;
  setShowTimelineHistory: (v: boolean) => void;
  setTimelineHistoryLoading: (v: boolean) => void;
  setTimelineHistoryTitle: (v: string) => void;
}

export function usePlanHistory({
  setPlanHistory, setShowPlanHistory, setPlanHistoryLoading,
  setTimelineHistory, setShowTimelineHistory, setTimelineHistoryLoading, setTimelineHistoryTitle,
}: UsePlanHistoryParams) {
  const openTimelineHistory = async (type: 'Supplement' | 'Appointment' | 'Lab', title: string) => {
    setTimelineHistoryTitle(title); setShowTimelineHistory(true); setTimelineHistoryLoading(true);
    try {
      const { data, error } = await supabase.from('timeline_entries').select('id, occurred_at, title, meta, type').eq('type', type).order('occurred_at', { ascending: false }).limit(15);
      if (error) throw error;
      setTimelineHistory((data || []).map((row: any) => ({ id: row.id as string, occurred_at: row.occurred_at as string, title: row.title as string, meta: row.meta as any })));
    } catch { setTimelineHistory([]); } finally { setTimelineHistoryLoading(false); }
  };

  const handleLoadPlanHistory = async () => {
    setShowPlanHistory(true); setPlanHistoryLoading(true);
    try {
      const { data: events, error: e1 } = await supabase.from('symptom_events').select('id, created_at, side, region, severity').eq('kind', 'leg_pain').order('created_at', { ascending: false }).limit(10);
      if (e1) throw e1;
      const ids = (events || []).map((ev: any) => ev.id);
      let togglesMap: Record<string, { total: number; completed: number }> = {};
      if (ids.length > 0) {
        const { data: toggles, error: e2 } = await supabase.from('symptom_toggles').select('symptom_id, toggle_key, completed').in('symptom_id', ids);
        if (e2) throw e2;
        (toggles || []).forEach((t: any) => {
          const key = t.symptom_id as string;
          if (!togglesMap[key]) togglesMap[key] = { total: 0, completed: 0 };
          togglesMap[key].total += 1;
          if (t.completed) togglesMap[key].completed += 1;
        });
      }
      setPlanHistory((events || []).map((ev: any) => ({ id: ev.id as string, created_at: ev.created_at as string, side: ev.side as string | undefined, region: ev.region as string | undefined, severity: ev.severity as number | undefined, completed: togglesMap[ev.id]?.completed || 0, total: togglesMap[ev.id]?.total || 0 })));
    } catch { setPlanHistory([]); } finally { setPlanHistoryLoading(false); }
  };

  return { openTimelineHistory, handleLoadPlanHistory };
}
