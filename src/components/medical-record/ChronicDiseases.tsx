import { useEffect, useState } from 'react';
import { Heart, Plus, Loader2, Trash2, Edit2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChronicDisease {
  id: string;
  disease_name: string;
  diagnosis_date: string | null;
  notes: string | null;
  created_at: string;
}

export function ChronicDiseases({ userId }: { userId: string }) {
  const [diseases, setDiseases] = useState<ChronicDisease[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    disease_name: '',
    diagnosis_date: '',
    notes: '',
  });

  useEffect(() => {
    fetchDiseases();
  }, [userId]);

  const fetchDiseases = async () => {
    try {
      const { data, error } = await supabase
        .from('chronic_diseases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiseases(data || []);
    } catch (error: any) {
      console.error('Error fetching diseases:', error);
      toast.error('خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.disease_name.trim()) {
      toast.error('يرجى إدخال اسم المرض');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('chronic_diseases')
          .update({
            disease_name: formData.disease_name,
            diagnosis_date: formData.diagnosis_date || null,
            notes: formData.notes || null,
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success('تم تحديث البيانات');
      } else {
        const { error } = await supabase
          .from('chronic_diseases')
          .insert({
            user_id: userId,
            disease_name: formData.disease_name,
            diagnosis_date: formData.diagnosis_date || null,
            notes: formData.notes || null,
          });

        if (error) throw error;
        toast.success('تمت الإضافة بنجاح');
      }

      setDialogOpen(false);
      resetForm();
      fetchDiseases();
    } catch (error: any) {
      console.error('Error saving disease:', error);
      toast.error('خطأ في حفظ البيانات');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (disease: ChronicDisease) => {
    setEditingId(disease.id);
    setFormData({
      disease_name: disease.disease_name,
      diagnosis_date: disease.diagnosis_date || '',
      notes: disease.notes || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;

    try {
      const { error } = await supabase
        .from('chronic_diseases')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('تم الحذف');
      fetchDiseases();
    } catch (error: any) {
      console.error('Error deleting disease:', error);
      toast.error('خطأ في الحذف');
    }
  };

  const resetForm = () => {
    setFormData({ disease_name: '', diagnosis_date: '', notes: '' });
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
          <Heart className="h-5 w-5 text-destructive" />
          الأمراض المزمنة
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إضافة مرض
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'تعديل' : 'إضافة'} مرض مزمن</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>اسم المرض *</Label>
                <Input
                  value={formData.disease_name}
                  onChange={(e) => setFormData({ ...formData, disease_name: e.target.value })}
                  placeholder="مثال: السكري، ضغط الدم"
                />
              </div>

              <div className="space-y-2">
                <Label>تاريخ التشخيص</Label>
                <Input
                  type="date"
                  value={formData.diagnosis_date}
                  onChange={(e) => setFormData({ ...formData, diagnosis_date: e.target.value })}
                />
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
        {diseases.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا توجد أمراض مزمنة مسجلة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {diseases.map((disease) => (
              <div
                key={disease.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/30 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{disease.disease_name}</h4>
                  {disease.diagnosis_date && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      تاريخ التشخيص: {disease.diagnosis_date}
                    </p>
                  )}
                  {disease.notes && (
                    <p className="text-sm text-muted-foreground mt-1">{disease.notes}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(disease)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(disease.id)}
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
