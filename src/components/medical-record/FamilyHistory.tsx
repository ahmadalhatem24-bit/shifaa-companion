import { useEffect, useState } from 'react';
import { Users, Plus, Loader2, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface FamilyHistoryItem {
  id: string;
  condition_name: string;
  relation: string | null;
  notes: string | null;
  created_at: string;
}

const relations = ['أب', 'أم', 'جد', 'جدة', 'أخ', 'أخت', 'عم', 'عمة', 'خال', 'خالة', 'ابن عم', 'ابنة عم'];

export function FamilyHistory({ userId }: { userId: string }) {
  const [history, setHistory] = useState<FamilyHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    condition_name: '',
    relation: '',
    notes: '',
  });

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('family_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error: any) {
      console.error('Error fetching family history:', error);
      toast.error('خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.condition_name.trim()) {
      toast.error('يرجى إدخال اسم المرض');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('family_history')
          .update({
            condition_name: formData.condition_name,
            relation: formData.relation || null,
            notes: formData.notes || null,
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success('تم تحديث البيانات');
      } else {
        const { error } = await supabase
          .from('family_history')
          .insert({
            user_id: userId,
            condition_name: formData.condition_name,
            relation: formData.relation || null,
            notes: formData.notes || null,
          });

        if (error) throw error;
        toast.success('تمت الإضافة بنجاح');
      }

      setDialogOpen(false);
      resetForm();
      fetchHistory();
    } catch (error: any) {
      console.error('Error saving family history:', error);
      toast.error('خطأ في حفظ البيانات');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: FamilyHistoryItem) => {
    setEditingId(item.id);
    setFormData({
      condition_name: item.condition_name,
      relation: item.relation || '',
      notes: item.notes || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;

    try {
      const { error } = await supabase
        .from('family_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('تم الحذف');
      fetchHistory();
    } catch (error: any) {
      console.error('Error deleting family history:', error);
      toast.error('خطأ في الحذف');
    }
  };

  const resetForm = () => {
    setFormData({ condition_name: '', relation: '', notes: '' });
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-info" />
          التاريخ المرضي العائلي
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إضافة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'تعديل' : 'إضافة'} تاريخ عائلي</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>المرض/الحالة الصحية *</Label>
                <Input
                  value={formData.condition_name}
                  onChange={(e) => setFormData({ ...formData, condition_name: e.target.value })}
                  placeholder="مثال: السكري، أمراض القلب"
                />
              </div>

              <div className="space-y-2">
                <Label>صلة القرابة</Label>
                <Select
                  value={formData.relation}
                  onValueChange={(value) => setFormData({ ...formData, relation: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر صلة القرابة" />
                  </SelectTrigger>
                  <SelectContent>
                    {relations.map((rel) => (
                      <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="أي تفاصيل إضافية..."
                  rows={3}
                />
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا يوجد تاريخ مرضي عائلي مسجل</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/30 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{item.condition_name}</h4>
                    {item.relation && (
                      <Badge variant="secondary">{item.relation}</Badge>
                    )}
                  </div>
                  {item.notes && (
                    <p className="text-sm text-muted-foreground mt-1">{item.notes}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(item.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
